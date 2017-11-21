const server = require("http").createServer()
const io = require("socket.io")(server)

const {Server} = require('bolt-rpc')
const {comprehend, dequeue} = require('../../libs')

const app = new Server(io)
const app_v0 = new Server()

const DEFAULT_TIMEOUT = 10*1000
let _withQueue = false

app_v0.use('echo', function(req, res) {
  res.json(req.data)
})

app_v0.use('comprehend', function(req, res) {
  const {text, patterns} = req.data

  let aborted = false
  let timeout

  if (text.length > 80) {
    res.json({results: [], status: 204})
    return
  }

  timeout = setTimeout(() => {
    dequeue(request)
    aborted = true
    res.json({status: 504})
  }, DEFAULT_TIMEOUT)

  const request = comprehend(text, patterns, {withQueue: _withQueue}, (err, commands) => {
    clearTimeout(timeout)
    if (err) {
      console.log(err)
      return res.json({status: 400})
    }
    if (!aborted) res.json({commands, status: 200})
  })
})

app.use('v0', app_v0)

exports.init = function(port=8080, withQueue=false) {
  _withQueue = withQueue

  server.listen(port, () => {
    console.log('rpc server listen start')
  })

  return server
}