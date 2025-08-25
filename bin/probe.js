const url = require('url');
const { performance } = require('perf_hooks');
const helpers = require('./helper.js')

// Increase global event emitter limits to prevent warnings
require('events').EventEmitter.defaultMaxListeners = 100;

const http = require('http');
const https = require('https');

const httpAgent = new http.Agent({
    keepAlive: false,  
    maxSockets: 100,
    timeout: 30000
});

const httpsAgent = new https.Agent({
    keepAlive: false,  
    maxSockets: 100,
    timeout: 30000
});

const overallMetrics = {
    totalCount: 0, 
    successCount: 0, 
    failureCount: 0, 
    totalBytes: 0,
    responseTimes: [], 
    dnsLookup: [],
    tcpConnection: [],
    tlsHanshake: [], 
    ttfb: [], 
}

function sendRequest(urlStr) {
    var parsedUrl = url.parse(urlStr, true);
    var protocol = (parsedUrl.protocol == "http:") ? http : https;
    var agent = (parsedUrl.protocol == "http:") ? httpAgent : httpsAgent;
    
    let options = {
        path: parsedUrl.pathname,
        host: parsedUrl.hostname,
        port: parsedUrl.port,
        agent: agent,
        timeout: 30000,
        keepAlive: false,
    };

    return new Promise((resolve, reject) => {
        let metrics = { 
            start: process.hrtime.bigint(), 
            dnsLookupAt: undefined,
            tcpConnectionAt: undefined,
            tlsHandshakeAt: undefined,
            firstByteAt: undefined, 
            end: undefined, 
        };
        
        const request = protocol.get(options, res => {
            let bytes = 0; 
            res.once('readable', () => {
                metrics.firstByteAt = process.hrtime.bigint();
            })
            res.on("data", chunk => { bytes += chunk.length; }); 
            res.on("end", () => {
                metrics.end = process.hrtime.bigint();
                resolve({
                    status: res.statusCode, 
                    bytes: bytes, 
                    metrics: metrics, 
                });
            }); 
        });

        request.on('socket', (socket) => {
            socket.setMaxListeners(50);
            
            const cleanup = () => {
                socket.removeAllListeners('lookup');
                socket.removeAllListeners('connect');
                socket.removeAllListeners('secureConnect');
                socket.removeAllListeners('timeout');
            };
            
            socket.on('lookup', () => {
                metrics.dnsLookupAt = process.hrtime.bigint();
            });
            socket.on('connect', () => {
                metrics.tcpConnectionAt = process.hrtime.bigint();
            });
            socket.on('secureConnect', () => {
                metrics.tlsHandshakeAt = process.hrtime.bigint();
            });
            socket.on('timeout', () => {
                cleanup();
                request.destroy();
                reject(new Error('Request timeout'));
            }); 
            
            // Clean up listeners when request completes
            request.on('response', cleanup);
            request.on('error', cleanup);
        });     

        request.on("error", (error) => {
            request.destroy();
            reject(error);
        }); 

        request.end(); 
    });
}

function calculateMetrics(metrics, status) {
    if (status >= 200 && status <= 300) overallMetrics.successCount++; else overallMetrics.failureCount++;
    
    const responseTime = helpers.ms(metrics.end != null ? helpers.diffBigint(metrics.end, metrics.start) : null);
    const dnsLookup = helpers.ms(metrics.dnsLookupAt !== undefined ? helpers.diffBigint(metrics.dnsLookupAt, metrics.start) : null);
    const tcpConnection = helpers.ms(metrics.tcpConnectionAt ? helpers.diffBigint(metrics.tcpConnectionAt, (metrics.dnsLookupAt || metrics.start)) : null);
    const tlsHanshake = helpers.ms(metrics.tlsHandshakeAt !== undefined ? helpers.diffBigint(metrics.tlsHandshakeAt, metrics.tcpConnectionAt) : null);
    const ttfb = helpers.ms(metrics.firstByteAt ? helpers.diffBigint(metrics.firstByteAt, (metrics.tlsHandshakeAt || metrics.tcpConnectionAt)) : null);

    helpers.push(overallMetrics.responseTimes, responseTime);
    helpers.push(overallMetrics.dnsLookup, dnsLookup);
    helpers.push(overallMetrics.tcpConnection, tcpConnection);
    helpers.push(overallMetrics.tlsHanshake, tlsHanshake);
    helpers.push(overallMetrics.ttfb, ttfb);
}

async function worker(urlStr, deadline) {
    while (helpers.ms(process.hrtime.bigint()) < deadline) {
        overallMetrics.totalCount++;

        try {
            const {status, bytes, metrics} = await sendRequest(urlStr);
            
            calculateMetrics(metrics, status); 
        } catch (error) {
            overallMetrics.failureCount++;
        }
    }
}

async function loadTestEnpoint(urlStr, duration, concurrency) {
    const durationInMilliSeconds = Math.max(1, Math.round(Number(duration) * 1000));
    const startTime = process.hrtime.bigint(); 
    const deadline = helpers.ms(startTime) + durationInMilliSeconds;  

    const workers = Array(concurrency).fill().map(() => worker(urlStr, deadline));
    
    await Promise.all(workers); 

    const endTime = process.hrtime.bigint(); 

    const testDuration = helpers.ms(endTime) - helpers.ms(startTime);
    
    const metricsForDisplay = {
        ...overallMetrics,
        duration: testDuration / 1000
    };
    
    helpers.printBeautifulMetrics(metricsForDisplay);
    
    httpAgent.destroy();
    httpsAgent.destroy();
}

module.exports = {loadTestEnpoint}; 