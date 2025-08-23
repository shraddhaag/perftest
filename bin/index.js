#! /usr/bin/env node

const probe = require('./probe.js')
const yargs = require('yargs');

const argv = yargs(process.argv.slice(1))
	.usage('Usage: $0 --endpoint [url]')
	.demandOption(['endpoint'])
	.parse(); 

// console.log("Hello World!");
probe.sendRequest(argv.endpoint)