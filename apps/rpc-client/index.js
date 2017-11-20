const io_for_client = require('socket.io-client')

const {Client} = require('bolt-rpc')

const _connections = {}

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

class HalumiCore {
  constructor(options) {
    this.client = _connect(options)
  }

  comprehend(text, patterns, cb) {
    const q = {
      text,
      patterns
    }
    this.client.send('v0/comprehend', q, cb)
  }
}


exports.HalumiCore = HalumiCore
