const io_for_client = require('socket.io-client')

const {Client} = require('bolt-rpc')

const _connections = {}

exports.STATUS = {
  READY: 'ready',
  CONNECTING: 'connecting'
}

function _connect(options) {
  const {
    scheme = 'http',
    host = 'localhost',
    port = 8080
  } = options

  const url = `${scheme}://${host}:${port}`

  if (_connections[url]) return _connections[url]

  const client = new Client(io_for_client, {url})

  _connections[url] = client

  return client
}

function callWithTimeout(timeout, f, cb) {
  let called = false

  const _cb = (...args) => {
    if (called) return;
    clearTimeout(timer)
    called = true
    cb(...args)
  }

  const timer = setTimeout(() => {
    _cb(new Error('request timeout'))
  }, timeout)

  f(_cb)
}

class HalumiCore {
  constructor(options) {
    this.status = exports.STATUS.CONNECTING
    this.client = _connect(options)
    this.timeout = 10 * 1000
    this.checkStatus()
  }

  checkStatus() {
    this.client.send('v0/echo', {text: 'ok'}, (err, result) => {
      if (result.text === 'ok') {
        this.status = exports.STATUS.READY
      }
    })
  }

  comprehend(text, patterns, cb) {
    const q = {
      text,
      patterns
    }

    callWithTimeout(this.timeout, (next) => {
      this.client.send('v0/comprehend', q, (...args) => {
        this.status = exports.STATUS.READY
        next(...args)
      })
    }, (err, ...args) => {
      // call at once
      if (err) {
        this.status = exports.STATUS.CONNECTING
      }
      cb(err, ...args)
    })
  }
}


exports.HalumiCore = HalumiCore

