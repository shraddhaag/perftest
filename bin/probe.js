const url = require('url');

function sendRequest(urlStr) {
    var parsedUrl = url.parse(urlStr, true);
    var protocol = (parsedUrl.protocol == "http:") ? require('http') : require('https');
    let options = {
        path: parsedUrl.pathname,
        host: parsedUrl.hostname,
        port: parsedUrl.port,
    };
    const request = protocol.get(options, res => {
        let bytes = 0; 
        res.on("data", chunk => { bytes += chunk.length; }); 
        res.on("end", () => {
            console.log("status: ", res.statusCode); 
            console.log("bytes: ", bytes); 
        }); 
    });

    request.on("error", err => {
        console.log("encountered an error ", err.message);
    });

    request.end(); 
}

module.exports = {sendRequest}; 