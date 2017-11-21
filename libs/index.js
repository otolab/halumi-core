"use strict"

const {parse, enqueue, dequeue, start} = require('./parser')
const {datePrefilter, dateList} = require('./date')
const {findPattern, findInvolvedTimePhrases, extractStatus} = require('./base')

function mapPhrases(phrases) {
  return phrases.map((phrase) => phrase.normalizedPhrase())
}

function removeCirculation(phrases) {
  return phrases.map((phrase) => {
    if (phrase.phrases) delete phrase.phrases;
    return phrase
  })
}

function match(patterns, phrases) {
  for (let i=0; i<patterns.length; i++) {
    const pattern = patterns[i]
    const ret = findPattern(phrases, pattern)
    if (ret) return ret
  }
  return null
}

function _parse(src, options={}, cb) {
  const {withQueue} = Object.assign({
    withQueue: false
  }, options)

  const parser = withQueue ? enqueue : parse

  return parser(src, cb)
}

function comprehend(src, patterns, options={}, cb) {
  const {withQueue} = Object.assign({
    withQueue: false
  }, options)

  let commands = []

  src = src.replace(/[\n\r\s]*/g, '')
  src = datePrefilter(src)

  if (!src) return cb(null, [])

  return _parse(src, {withQueue}, (err, cargo) => {
    if (err) return cb ? cb(err, commands) : err;

    for (let k in patterns) {
      let phrases = match(patterns[k], cargo.phrases)

      if (!phrases) continue

      const status = extractStatus(phrases)

      let timePhrases = findInvolvedTimePhrases(cargo.phrases, phrases)

      const simplyPhrases = mapPhrases(phrases)
      const simplyDays = dateList(timePhrases)

      phrases = removeCirculation(phrases)
      timePhrases = removeCirculation(timePhrases)

      let command = {
        command: k,
        phrases: simplyPhrases,
        days: simplyDays,
        status: status,
        source: src,
        raw: {phrases, timePhrases}
      }
      commands.push(command)
    }

    if (cb) return cb(err, commands)
  })
}


module.exports = {
  parse: _parse,
  comprehend: comprehend,
  dequeue: dequeue,
  startAsyncParser: start
}