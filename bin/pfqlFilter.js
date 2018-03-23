#!/usr/bin/env node
'use strict'

const path = require('path')
const through2 = require('through2')
const ArgumentParser = require('argparse').ArgumentParser
const cbio = require('core-bio')
const fs = require('fs')
const pfql = require('pfql')

const AddDomainArch = require('../src/AddDomainArch')

let parser = new ArgumentParser({
	addHelp: true,
	description: 'Command line application to use PFQL to filter protein sequences with specific domain architecture.'
})

parser.addArgument(
	'fasta',
	{
		help: 'Fasta file'
	}
)

parser.addArgument(
	'pfqlConfig',
	{
		help: 'PFQL config file - see PFQL instructions'
	}
)

parser.addArgument(
	['--keepGoing'],
	{
		help: 'Do not stop if can\'t find sequence',
		action: 'storeTrue',
		default: false
	}
)

parser.addArgument(
	['-o', '--output'],
	{
		help: 'name of the output file',
		defaultValue: 'pfqlFiltered.fa'
	}
)

const args = parser.parseArgs()

if (args.output === 'pfqlFiltered.fa')
	args.output = args.fasta.replace(/\.([a-z]|[A-Z]){2,4}$/, '.pfqlFiltered.fa')


const query = JSON.parse(fs.readFileSync(path.resolve(args.pfqlConfig)))
const pfqlFilter = new pfql.PFQLService(query)

pfqlFilter.initRules()

const addDomainArch = new AddDomainArch(0, pfqlFilter, {keepGoing: args.keepGoing})
addDomainArch.on('error', (err) => {
	console.error('There was an error in the processing of one or more sequences.\nIf this is not important to you, try the flag --keepGoing')
	console.log(err)
})

const rs = fs.createReadStream(path.resolve(args.fasta))
const reader = cbio.fastaStream()
const writer = cbio.fastaStream.writer()
const ws = fs.createWriteStream(path.resolve(args.output))

// rs.pipe(reader).pipe(addDomainArch).pipe(writer).pipe(ws)
rs
	.pipe(reader)
	.pipe(addDomainArch)
	.pipe(writer).pipe(ws)
/* 	.pipe(through2.obj(function(chunk, enc, done) {
		console.log(chunk)
	}))
 */
