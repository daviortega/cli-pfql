#!/usr/bin/env node
'use strict'
let shell = require('shelljs'),
	path = require('path')

let args = process.argv.slice(2).join(' ')
let path2pfqlFilter = path.resolve(__dirname, 'pfqlFilter.js')
let path2bunyan = path.resolve(__dirname, '..', 'node_modules/.bin/bunyan')

shell.exec('node ' + path2pfqlFilter + ' ' + args + ' | ' + path2bunyan + ' --color')