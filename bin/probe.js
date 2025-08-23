const url = require('url');
const { performance } = require('perf_hooks');
const helpers = require('./helper.js')

// Increase global event emitter limits to prevent warnings
require('events').EventEmitter.defaultMaxListeners = 100;

const http = require('http');
const https = require('https');

const httpAgent = new http.Agent({
    keepAlive: true,
    maxSockets: 100,
    maxFreeSockets: 20,
    timeout: 60000,
    freeSocketTimeout: 30000
});

const httpsAgent = new https.Agent({
    keepAlive: true,
    maxSockets: 100,
    maxFreeSockets: 20,
    timeout: 60000,
    freeSocketTimeout: 30000
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
        // Add connection pooling options
        keepAlive: true,
        keepAliveMsecs: 1000,
    };

    return new Promise((resolve, reject) => {
        metrics = { 
            start: performance.now(), 
            dnsLookupAt: undefined,
            tcpConnectionAt: undefined,
            tlsHandshakeAt: undefined,
            firstByteAt: undefined, 
            end: undefined, 
        };
        
        const request = protocol.get(options, res => {
            let bytes = 0; 
            res.once('readable', () => {
                metrics.firstByteAt = performance.now();
            })
            res.on("data", chunk => { bytes += chunk.length; }); 
            res.on("end", () => {
                metrics.end = performance.now();
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
                metrics.dnsLookupAt = performance.now();
            });
            socket.on('connect', () => {
                metrics.tcpConnectionAt =  performance.now();
            });
            socket.on('secureConnect', () => {
                metrics.tlsHandshakeAt =  performance.now();
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
    responseTime = helpers.ms((metrics.end != null) ? (metrics.end - metrics.start) : null);
    dnsLookup = helpers.ms(metrics.dnsLookupAt !== undefined ? (metrics.dnsLookupAt - metrics.start) : null);
    tcpConnection = helpers.ms(metrics.tcpConnectionAt - (metrics.dnsLookupAt || metrics.start));
    tlsHanshake = helpers.ms(metrics.tlsHandshakeAt !== undefined ? (metrics.tlsHandshakeAt - metrics.tcpConnectionAt) : null);
    ttfb = helpers.ms(metrics.firstByteAt - (metrics.tlsHandshakeAt || metrics.tcpConnectionAt));

    helpers.push(overallMetrics.responseTimes, responseTime);
    helpers.push(overallMetrics.dnsLookup, dnsLookup);
    helpers.push(overallMetrics.tcpConnection, tcpConnection);
    helpers.push(overallMetrics.tlsHanshake, tlsHanshake);
    helpers.push(overallMetrics.ttfb, ttfb);
}

async function worker(urlStr, deadline) {
    while (performance.now() < deadline) {
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
    durationInMilliSeconds = Math.max(1, Math.round(Number(duration) * 1000));
    const startTime = performance.now(); 
    const deadline = startTime + durationInMilliSeconds;  

    const workers = Array(concurrency).fill().map(() => worker(urlStr, deadline));
    
    await Promise.all(workers); 

    const endTime = performance.now(); 

    console.log("Time elapsed: ", (endTime - startTime)/1000, "s");
    console.log("Total Requests: ", overallMetrics.totalCount);
    console.log("Successful Requests: ", overallMetrics.successCount);
    console.log("Failed Requests: ", overallMetrics.failureCount); 
    helpers.printMetrics("Response Time", overallMetrics.responseTimes);
    helpers.printMetrics("DNS Lookup", overallMetrics.dnsLookup);
    helpers.printMetrics("TCP Connection", overallMetrics.tcpConnection);
    helpers.printMetrics("TLS Hanshake", overallMetrics.tlsHanshake);
    helpers.printMetrics("TTFB", overallMetrics.ttfb);
    
    httpAgent.destroy();
    httpsAgent.destroy();
}

module.exports = {loadTestEnpoint}; 