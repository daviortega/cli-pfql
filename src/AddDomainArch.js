'use strict'

const pfql = require('pfql')
const Transform = require('stream').Transform
const Genes = require('node-mist3').Genes
const parser = require('mist3-to-pfql')

const bunyan = require('bunyan')

module.exports =
class AddDomainArch extends Transform {
	constructor(indexMatch, pfqlService, pfqlOptions) {
		super({objectMode: true})
		this.genes = []
		this.pfqlService = pfqlService
		this.indexMatch = indexMatch
		this.pfqlOptions = pfqlOptions
		this.log = bunyan.createLogger({
			name: 'cli-pfql'
		})
	}

	_transform(chunk, enc, done) {
		chunk.aseq_id = chunk.seqId()
		this.genes.push(chunk)
		done()
	}

	_flush(done) {
		const genes = new Genes()
		//console.log(this.genes[0])
		genes.addAseqInfo(this.genes, this.pfqlOptions).then((updatedGenes) => {
			const geneNumber = updatedGenes.length
			for (let i = 0; i < geneNumber; i++) {
				const gene = updatedGenes[i]
				//console.log(`Gene ${i}`)// - ${JSON.stringify(gene)}`)
				if (gene.ai) {
					gene.ai = parser.Mist3ToPfql(gene.ai)
					gene.ai = this.pfqlService.findMatches(gene.ai)
					const matches = gene.ai.PFQLMatches
					for (let j = 0; j < matches.length; j++) {
						const match = matches[j]
						if (match === this.indexMatch) {
							this.log.info(`found a match ${gene.header()}`)
							this.push(gene)
						}
					}
				}
			}
			done()
		})
		.catch((err) => {
			this.emit('error', err)
			done()
		})
	}

}
