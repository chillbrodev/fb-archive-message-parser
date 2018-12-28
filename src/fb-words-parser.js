const fs = require('fs')
const unzipper = require('unzipper')
const rimraf = require('rimraf')

const msgOutputDir = 'output/fb-messages'
const finalOutputDir = 'output/parsed-messages'

const unzipCB = () => {
    console.log(`Unzip Finished`)
    parseMessageWords()
}

function printHelp() {
    console.log("Username is required to parse zip file. \nExample zip archive: facebook-username1234.zip \nExample command: node index.js username1234")
}

function startParser(username) {
    createDirs()
    setTimeout(parseFacebookZip, 250, username)
}

function createDirs() {
    createOutputDirSync()
    setTimeout(createFinalOutputDirSync, 250, finalOutputDir)
    setTimeout(createParseDirSync, 250, msgOutputDir)
}

function createOutputDirSync() {
    const dir = 'output'
    console.log(`Creating ${dir} directory`)
    if (fs.existsSync(dir)) {
        rimraf(dir, (err) => {
            if (err) {
                throw err
            }
            fs.mkdirSync(dir)
        })
    } else {
        fs.mkdirSync(dir)
    }
}

function createParseDirSync(msgOutputDir) {
    console.log(`Creating ${msgOutputDir} directory`)
    if (fs.existsSync(msgOutputDir)) {
        rimraf(msgOutputDir, (err) => {
            if (err) {
                throw err
            }

            fs.mkdirSync(msgOutputDir)
        })
    } else {
        fs.mkdirSync(msgOutputDir)
    }
}

function createFinalOutputDirSync(finalOutputDir) {
    console.log(`Creating ${finalOutputDir} directory`)

    if (fs.existsSync(finalOutputDir)) {
        rimraf(finalOutputDir, (err) => {
            if (err) {
                throw err
            }
            fs.mkdirSync(finalOutputDir)
        })
    } else {
        fs.mkdirSync(finalOutputDir)
    }
}

function checkZipExists(zipPath) {
    if (!fs.existsSync(zipPath)) {
        throw new Error("Please ensure the zip archive exists in the input directory. \nEX: input/facebook-username1234.zip")
    }
}

function parseFacebookZip(username) {
    console.log("Starting up parser!!!")
    let count = 0
    const path = `./input/facebook-${username}.zip`
    checkZipExists(path)
    fs.createReadStream(path)
        .pipe(unzipper.Parse())
        .on('entry', (entry) => {
            let fileName = entry.path
            if (!fileName.startsWith("__") && fileName.endsWith('message.json')) {
                console.log(`Filename: ${fileName}`)
                entry.pipe(fs.createWriteStream(`${msgOutputDir}/${count}.json`))
                count++
            } else {
                entry.autodrain()
            }
        }).on('finish', unzipCB)
}

function parseMessageWords() {
    console.log(`Parsing Words from each message file...`)
    fs.readdir(msgOutputDir, (err, files) => {
        if (err) {
            throw err
        }

        files.forEach((fileName) => {
            let file = `${msgOutputDir}/${fileName}`
            if (file.endsWith('.json')) {
                fs.readFile(file, 'utf-8', (err, content) => {
                    if (err) {
                        throw err
                    }
                    let fileJson = JSON.parse(content)
                    let messages = fileJson.messages
                    let wordMap = parseMessagesToMap(messages)
                    let sortedMap = new Map([...wordMap]
                        .sort((a, b) => a[1] === b[1] ? 0 : a[1] > b[1] ? 1 : -1))
                    saveWordMap(fileName, sortedMap)
                })
            }
        })
        console.log(`Finishing up...`)
    })
}

function parseMessagesToMap(messages) {
    let dict = new Map()
    messages.forEach((msg) => {
        if (msg.content) {
            let split = msg.content.split(' ')
            split.forEach((s) => {
                if (dict.has(s)) {
                    let count = dict.get(s)
                    let newCount = count += 1
                    dict.set(s, newCount)
                } else {
                    dict.set(s, 1)
                }
            })
        }
    })
    return dict
}

function saveWordMap(filename, wordMap) {
    let data = []
    wordMap.forEach((value, key, map) => {
        data.push({ key: key, value: value })
    })

    fs.appendFile(
        `${finalOutputDir}/${filename}-words.json`,
        JSON.stringify(data), (err) => {
            if (err) {
                throw err
            }
        })
}

module.exports.startParser = startParser
module.exports.printHelp = printHelp