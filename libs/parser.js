"use strict"

const {generateMachine, PostJumanProcess} = require('./knp')

const spawn = require('child_process').spawn
const {Transform} = require('stream')
const split = require('split')


let _processes = null

function buildPipeline() {
  const jumanpp = spawn('jumanpp')
  const knp = spawn('knp', ['-tab', '-anaphora'])

  jumanpp.stdout
    .pipe(require('split')())
    .pipe(new Transform(PostJumanProcess))
    .pipe(knp.stdin)

  return {
    input: jumanpp.stdin,
    output: knp.stdout
  }
}

function getPipeline() {
  if (_processes) {
    setTimeout(() => {
      _processes.push(buildPipeline())
    }, 0)
  }

  let p = _processes && _processes.shift()
  if (!p) return buildPipeline()
  return p
}

let _queue = []
let _running = []

function proc(src) {
  return new Promise((resolve) => {
    const {input, output} = getPipeline()
    let m = generateMachine()
    let data = []

    output
      .pipe(split())
      .on('data', (line) => {
        data.push(line)
      })
      .on('end', () => {
        m.set(data)
        resolve(m.run())
      })

    input.write(src)
    input.end()
  })
}

function run() {
  if (_queue.length === 0 || _running.length > 8) return
  // console.log('queue:', _queue.length, 'running:', _running.length)

  const {src, cb} = _queue.shift()
  const p = proc(src)
    .then((commands) => cb(null, commands))
    .catch((err) => cb(err))

  _running.push(p)
  p.then(() => {
    _running = _running.filter((_p) => _p !== p)
    // console.log('queue:', _queue.length, 'running:', _running.length)
  })
}

function enqueue(src, cb) {
  const request = {src, cb}
  _queue.push(request)
  return request
}

function dequeue(request) {
  _queue = _queue.filter((_r) => _r !== request)
  // console.log('queue:', _queue.length, 'running:', _running.length)
}

function start() {
  _processes = []
  for(let n=0; n<8; n++) _processes.push(buildPipeline())
  setInterval(run, 100)
}

function parse(src, cb) {
  const p = proc(src)
    .then((commands) => cb(null, commands))
    .catch((err) => cb(err))
}


module.exports = {
 parse: parse,
 enqueue: enqueue,
 dequeue: dequeue,
 start: start
}