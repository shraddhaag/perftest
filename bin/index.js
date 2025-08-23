#! /usr/bin/env node

const probe = require('./probe.js')
const yargs = require('yargs');

const argv = yargs(process.argv.slice(2))
	.usage('Usage: $0 --endpoint [url] --duration [dur] --concurrency [con]')
	.demandOption(['endpoint'])
	.parse(); 

if (typeof argv.duration === 'undefined') {
    argv.duration = 11;
    console.log("Duration not specified. Falling back to default value of 11s.")
}
if (typeof argv.concurrency === 'undefined') {
    argv.concurrency = 100;
    console.log("Concurrency not specified. Falling back to default value of 100.")
}

probe.loadTestEnpoint(argv.endpoint, argv.duration, argv.concurrency)