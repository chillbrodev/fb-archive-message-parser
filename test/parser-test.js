const assert = require('assert')
const fs = require('fs')
const { startParser } = require('../src/fb-words-parser')

describe('Parser', () => {
    describe('Start Parser', () => {
        it('should parse the zip archive', () => {
            startParser("testuser123")
            assert.equal(fs.existsSync('output/fb-messages/0.json'), true)
            assert.equal(fs.existsSync('output/parsed-messages/0.json-words.json'), true)
        })
    })
})


