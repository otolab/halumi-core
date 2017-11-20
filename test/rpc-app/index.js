const io_for_client = require('socket.io-client')

const {Client} = require('bolt-rpc')
const {init} = require('../../apps/rpc-app/server')
const {HalumiCore} = require('../../apps/rpc-client')

const server = init(8081, false)

const url = `http://localhost:8081`
// const client = new Client(io_for_client, {url: url})

describe.skip('simple', function() {

  before(function(done) {
    this.port = 8081
    this.server = init(this.port, false)
    done()
  })

  after(function(done) {
    this.server.close()
    done()
  })

  it('connect', function(done) {
    const client = new Client(io_for_client, {url: url})

    const q = {
      text: '明日は休みます',
      patterns: {
        rest: [
          ['休む']
        ]
      }
    }

    client.send('v0/comprehend', q, (err, data) => {
      console.log(data)
      done()
    })
  })
})


describe('halumi-core', function() {
  it('client', function(done) {
    const client = new HalumiCore({port: 8081})

    const q = {
      text: '明日は休みます',
      patterns: {
        rest: [
          ['休む']
        ]
      }
    }

    client.comprehend(q.text, q.patterns, (err, data) => {
      console.log(data)
      done()
    })
  })

})