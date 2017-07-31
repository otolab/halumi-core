"use strict"

const {isTimePhrase} = require('./date')

class Phrase {
  constructor ({phrases, phraseId, tags}) {
    this.sentences = []
    this.phraseId = phraseId
    this.phrases = phrases
    this._tags = tags
  }

  tag(name) {
    if (!this._tags) return {};
    const regexp = new RegExp('^'+name+'$')
    return this._tags.find((tag) => regexp.test(tag.tag)) || {}
  }

  tags(name) {
    if (!this._tags) return [];
    if (!name) return this._tags;
    const regexp = new RegExp('^'+name+'$')
    return this._tags.filter((tag) => regexp.test(tag.tag)) || []
  }

  normalizedPhrase() {
    return this.tag('正規化代表表記').attr || ''
  }

  is(obj) {
    if (typeof obj === 'string' || obj instanceof String) {
      const norm = this.normalizedPhrase()
      if (norm === obj) return true
      if (norm.split(/[\/\?]/g).includes(obj)) return true

      const a = norm.split('+')
      const b = obj.split('+')
      if (b.every((w) => {
        if (!a.length) return
        let t = a.shift()
        return t.split(/[\/\?+]/g).includes(w)
      })) {
        return true
      }
    }
    if (obj.type === 'date') {
      return this.sentences.some((sentence) => {
        return sentence.tag('NE:DATE').attr
      })
    }
    return false
  }

  relationTo() {
    const code = this.phraseId.replace(/[^A-Z]/g, '')
    const idx = Number(this.phraseId.replace(/[^0-9-]*/g, ''))

    let relType = '';
    if (code === 'D') relType = '';
    if (code === 'P') {
      relType = this.tag('並列タイプ').attr || '並列'
    }
    if (code === 'A') relType = '同格';
    if (code === 'I') relType = '部分並列';

    return {
      phrase: idx < 0 ? null : this.phrases[idx],
      idx,
      code,
      type: relType
    }
  }
}

class Sentence {
  constructor ({basicSentenceId, tags, kaku}) {
    this.words = []
    this.basicSentenceId = basicSentenceId
    this._tags = tags
    this.kaku = []
  }

  tag(name) {
    if (!this._tags) return {};
    const regexp = new RegExp('^'+name+'$')
    return this._tags.find((tag) => regexp.test(tag.tag)) || {}
  }

  tags(name) {
    if (!this._tags) return [];
    if (!name) return this._tags;
    const regexp = new RegExp('^'+name+'$')
    return this._tags.filter((tag) => regexp.test(tag.tag)) || []
  }
}

function traverse(output, phrases, pattern, phraseId) {
  if (pattern.length === 0) return output;
  if (phraseId < 0) return null;

  let phrase = phrases[phraseId]
  let p = pattern.shift()
  if (phrase.is(p)) {
    output.push(phrase)
    let {idx} = phrase.relationTo()
    return traverse(output, phrases, pattern.slice(1), idx)
  }
  else if (p === '*') {
    if (pattern.length > 0 && phrase.is(pattern[0])) {
      pattern.shift()
      output.push(phrase)
      let {idx} = phrase.relationTo()
      return traverse(output, phrases, pattern, idx)
    }
    else {
      pattern.unshift('*')
      output.push(phrase)
      let {idx} = phrase.relationTo()
      if (idx < 0) return output
      return traverse(output, phrases, pattern, idx)
    }
  }
  return null
}

function findPattern(phrases, pattern) {
  let output
  for (let i=0; i<phrases.length; i++) {
    let phrase = phrases[i];
    if (phrase.is(pattern[0])) {
      output = [phrase]
      let {idx} = phrase.relationTo()
      let ret = traverse(output, phrases, pattern.slice(1), idx)
      if (ret) return ret
    }
  }
  return null
}


function isInvolved(phrases, phrase) {
  if (phrases.includes(phrase)) return true

  const rel = phrase.relationTo()

  if (rel.idx < 0) return false

  return isInvolved(phrases, rel.phrase)
}


function findInvolvedTimePhrases(allPhrases, phrases) {
  return allPhrases.map((phrase) => {
    if (isTimePhrase(phrase) && isInvolved(phrases, phrase)) {
      return phrase
    }
  }).filter((v) => v)
}


function extractStatus(phrases) {
  const status = []
  phrases.forEach((t) => {
    // 否定表現、婉曲な表現の判定
    let n = t.tag('否定表現')
    if (n.tag) status.push('否定')

    let m = t.tags('モダリティ-.*')
    m.forEach((mod) => status.push(mod.tag.split('-')[1]))
  })
  return status
}


module.exports = {
  Phrase,
  Sentence,
  findPattern,
  isInvolved,
  findInvolvedTimePhrases,
  extractStatus
}