const { startParser, printHelp } = require('./src/fb-words-parser')

if (process.argv.length < 3) {
    throw new Error('Please supply facebook username. \nEX: node index.js fbusername1234 \nEX: node index.js help')
} else {
    let arg = process.argv[2]
    if (arg === "help") {
        printHelp()
    } else {
        startParser(arg)
    }
}