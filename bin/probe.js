const url = require('url');
const { performance } = require('perf_hooks');

const metrics = {
    totalCount: 0, 
    successCount: 0, 
    failureCount: 0, 
    totalBytes: 0, 
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
        const request = protocol.get(options, res => {
            let bytes = 0; 
            res.on("data", chunk => { bytes += chunk.length; }); 
            res.on("end", () => {
                resolve({
                    status: res.statusCode, 
                    bytes: bytes, 
                });
            }); 
        });

        request.on("error", reject); 

        request.end(); 
    });
}

async function worker(urlStr, deadline) {
    while (performance.now() < deadline) {
        metrics.totalCount++;

        try {
            const {status, bytes} = await sendRequest(urlStr);
            if (status >= 200 && status <= 300) metrics.successCount++; else metrics.failureCount++;
        } catch (error) {
            metrics.failureCount++;
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
    console.log("Total Requests: ", metrics.totalCount);
    console.log("Successful Requests: ", metrics.successCount);
    console.log("Failed Requests: ", metrics.failureCount); 
}

module.exports = {loadTestEnpoint}; 