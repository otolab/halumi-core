"use strict"

const {parse} = require('./knp')
const {datePrefilter, dateList} = require('./date')
const {findPattern, findInvolvedTimePhrases, extractStatus} = require('./base')

function mapPhrases(phrases) {
  return phrases.map((phrase) => phrase.normalizedPhrase())
}

function match(patterns, phrases) {
  for (let i=0; i<patterns.length; i++) {
    const pattern = patterns[i]
    const ret = findPattern(phrases, pattern)
    if (ret) return ret
  }
  return null
}

function comprehend(src, patterns, options={}, cb) {
  let commands = []

  src = datePrefilter(src)

  parse(src, (err, cargo) => {
    if (err) return cb ? cb(err, commands) : err;

    for (let k in patterns) {
      let phrases = match(patterns[k], cargo.phrases)

      if (!phrases) continue

      const status = extractStatus(phrases)

      const timePhrases = findInvolvedTimePhrases(cargo.phrases, phrases)

      let command = {
        command: k,
        phrases: mapPhrases(phrases),
        days: dateList(timePhrases),
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
  comprehend: comprehend
}