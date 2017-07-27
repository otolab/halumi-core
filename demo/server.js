const express = require('express')
const app = express()

const {comprehend, dequeue, startAsyncParser} = require('../libs')
const patterns = require('./patterns')
const {buildReply} = require('./reply')

const ACCESS_CONTROL_ALLOW_ORIGIN = process.env.ACCESS_CONTROL_ALLOW_ORIGIN || '*'

startAsyncParser()

app.get('/', function(req, res) {
  const text = req.query['text']
  if (!text) return res.send('???')

  res.setHeader('Access-Control-Allow-Origin', ACCESS_CONTROL_ALLOW_ORIGIN)

  let aborted = false
  let timeout

  if (text.length > 80) {
    res.status(200).send('ながい文章はワカリマセン！')
    return
  }

  const request = comprehend(text, patterns, {withQueue: true}, (err, commands) => {
    clearTimeout(timeout)
    if (err) {
      console.log(err)
      return res.sendStatus(400)
    }
    if (!aborted) res.send(buildReply(commands))
  })

  timeout = setTimeout(() => {
    dequeue(request)
    aborted = true
    res.sendStatus(504)
  }, 5000)
})

app.listen(8080)
