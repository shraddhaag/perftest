#! /usr/bin/env node

const probe = require('./probe.js')
const yargs = require('yargs');

const argv = yargs(process.argv.slice(2))
	.usage('Usage: $0 --endpoint [url] --duration [seconds] --concurrency [number] --connection-reuse [bool]')
	.demandOption(['endpoint'])
	.describe('endpoint', 'Target URL to load test.')
	.describe('duration', 'Test duration in seconds (default: 11)')
	.describe('concurrency', 'Number of concurrent workers (default: 100)')
	.boolean('connection-reuse')
	.describe('connection-reuse', 'Keep connections alive for reuse (default: true)')
	.example('$0 --endpoint https://example.com --duration 5 --concurrency 50', 'Run a 5-second test with 50 concurrent workers.')
	.example('$0 --endpoint https://httpbin.org/get --duration 11 --concurrency 100 --connection-reuse', 'Run a 11-second test with connection reuse enabled.')
	.help(false)
	.version(false)
	.parse(); 

if (typeof argv.duration === 'undefined') {
    argv.duration = 11;
    console.log("duration not specified. Falling back to default value of 11s.")
} else {
    const duration = Number(argv.duration);
    if (isNaN(duration) || duration <= 0) {
        console.error("Error: duration must be a positive number");
        process.exit(1);
    }
    if (duration > 60) {
        console.error("Error: duration cannot exceed 60 seconds");
        process.exit(1);
    }
    argv.duration = duration;
}

if (typeof argv.concurrency === 'undefined') {
    argv.concurrency = 100;
    console.log("concurrency not specified. Falling back to default value of 100.")
} else {
    const concurrency = Number(argv.concurrency);
    if (isNaN(concurrency) || concurrency <= 0) {
        console.error("Error: concurrency must be a positive number");
        process.exit(1);
    }
    if (concurrency > 100) {
        console.error("Error: concurrency cannot exceed 100");
        process.exit(1);
    }
    argv.concurrency = concurrency;
}

if (typeof argv['connection-reuse'] === 'undefined') {
    argv['connection-reuse'] = true;
    console.log("connection-reuse not specified. Falling back to default value of true.")
}

probe.loadTestEnpoint(argv.endpoint, argv.duration, argv.concurrency, argv['connection-reuse'])