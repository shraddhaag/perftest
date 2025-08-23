const url = require('url');
const { performance } = require('perf_hooks');
const helpers = require('./helper.js')

const overallMetrics = {
    totalCount: 0, 
    successCount: 0, 
    failureCount: 0, 
    totalBytes: 0,
    responseTimes: [] 
}

function sendRequest(urlStr) {
    var parsedUrl = url.parse(urlStr, true);
    var protocol = (parsedUrl.protocol == "http:") ? require('http') : require('https');
    let options = {
        path: parsedUrl.pathname,
        host: parsedUrl.hostname,
        port: parsedUrl.port,
    };

    return new Promise((resolve, reject) => {
        metrics = { start: performance.now() };
        const request = protocol.get(options, res => {
            let bytes = 0; 
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

        request.on("error", reject); 

        request.end(); 
    });
}

function calculateMetrics(metrics, status) {
    if (status >= 200 && status <= 300) overallMetrics.successCount++; else overallMetrics.failureCount++;
    responseTime = (metrics.end != null) ? (metrics.end - metrics.start) : null;
    return {
        responseTime: helpers.ms(responseTime), 
    };
}

async function worker(urlStr, deadline) {
    while (performance.now() < deadline) {
        overallMetrics.totalCount++;

        try {
            const {status, bytes, metrics} = await sendRequest(urlStr);
            
            calculatedMetrics = calculateMetrics(metrics, status); 
            helpers.push(overallMetrics.responseTimes, calculatedMetrics.responseTime);
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
}

module.exports = {loadTestEnpoint}; 