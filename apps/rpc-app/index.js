const server = require('./server')
const {startAsyncParser} = require('../../libs')

startAsyncParser()

server.init(8080, true)
