"use strict"

// from: https://github.com/hecomi/node-mecab-async/blob/master/mecab.js

const spawn = require('child_process').spawn
const {Transform} = require('stream')
const split = require('split')

const StateMachine = require('./state-machine')
const {Phrase, Sentence} = require('./base')

const tagRegexp = /<(.*?)>/g
const tagInnerRegexp = /<(.*):(.*?)>/
const extractTag = function(line) {
  const tags = line.match(tagRegexp)
  if (!tags) return;
  const _tags = tags.map((tag) => {
    let m = tag.match(tagInnerRegexp)
    if (!m) m = [tag, tag.slice(1, -1)];
    if (!m) return;
    return {
      tag: m[1],
      attr: m[2]
    }
  })
  return _tags
}

// 格要素 = 格/フラグ/表記/基本句番号/N文前(0,1,2,..)/文ID(指定がない場合は1,2,..)
// 2つ目の「フラグ」は次の6つのうちのいずれかをとります。
// C 直接係り受けをもつ格要素 (格は明示されている)
// N 直接係り受けをもつ格要素 (格は明示されていない:未格,被連体修飾詞)
// O 省略の指示対象
// D 指示詞の指示対象
// E 特殊タグ … 不特定:人,不特定:状況,一人称,前文,後文
// U 格要素の割り当てなし
const kakuRegexp = /<格解析結果::(.*?):(.*?)>/
const extractKakuResult = function(line) {
  let ret = []
  let matches = line.match(kakuRegexp)
  if (!matches) return ret;

  const word = matches[1]
  // const kakuFrameId = matches[2]
  const results = matches[2].split(';')
  results.forEach((result) => {
    const [kaku, flag, word, basicSentenceId, nWords, phraseId] = result.split('/')
    if (flag !== 'U')
      ret.push({kaku, flag, word, basicSentenceId, nWords, phraseId})
  })
  return {
    word, elements: ret
  }

}

const _generateMachine = function() {
  const m = new StateMachine()

  // cargo初期化
  m.addState('start', (cargo, chunk, idx) => {
    cargo.phrases = []
    cargo.sentences = []
    cargo.kaku = []
    cargo.words = []
    return Promise.resolve({next: 'header', cargo, through: true})
  })

  // header読み込み
  m.addState('header', (cargo, chunk, idx) => {
    cargo.header = chunk
    return Promise.resolve({next: 'phrase', cargo})
  })

  // 文節
  m.addState('phrase', (cargo, chunk, idx) => {
    if (chunk[0] === "+") return Promise.resolve({next: 'sentence', cargo, through: true})

    const parts = chunk.split(' ')
    const phrase = new Phrase({
      phrases: cargo.phrases,
      phraseId: parts[1],
      tags: extractTag(parts[2])
    })
    cargo.phrases.push(phrase)
    return Promise.resolve({next: 'phrase', cargo})
  })

  // 基本句
  m.addState('sentence', (cargo, chunk, idx) => {
    if (chunk[0] !== "+") return Promise.resolve({next: 'word', cargo, through: true})

    const parts = chunk.split(' ')
    const sentence = new Sentence({
      basicSentenceId: parts[1],
      tags: extractTag(parts[2]),
      kaku: extractKakuResult(chunk)
    })
    const currentPhrase = cargo.phrases[cargo.phrases.length-1]

    currentPhrase.sentences.push(sentence)
    cargo.sentences.push(sentence)
    cargo.kaku = cargo.kaku.concat(sentence.kaku)

    return Promise.resolve({next: 'sentence', cargo})
  })

  // 単語
  m.addState('word', (cargo, chunk, idx) => {
    if (chunk[0] === '*') return Promise.resolve({next: 'phrase', cargo, through: true})
    if (chunk[0] === '+') return Promise.resolve({next: 'sentence', cargo, through: true})
    if (chunk === 'EOS') return Promise.resolve({next: 'end', cargo})

    const currentSentence = cargo.sentences[cargo.sentences.length-1]
    currentSentence.words.push(chunk)
    cargo.words.push(chunk)
    return Promise.resolve({next: 'word', cargo})
  })

  return m

}

const PostJumanProcess = {
  transform(chunk, encoding, callback) {
    const s = []
    s.push(chunk.toString())
    const words = chunk.toString().split(' ')
    if (words[0] === '明日' && words[5] === '地名') {
      s.push('@ 明日 あした 明日 名詞 6 時相名詞 10 * 0 * 0 "代表表記:明日/あした カテゴリ:時間"\n')
    }
    s.push('')
    callback(null, s.join('\n'))
  }
};

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

const parse = function(src, callback) {
  const {input, output} = buildPipeline()
  let m = _generateMachine()
  let data = []

  output
    .pipe(split())
    .on('data', (line) => {
      data.push(line)
    })
    .on('end', () => {
      m.set(data)
      return m.run()
        .then((cargo) => callback(null, cargo))
        .catch(err => callback(err))
    })

  input.write(src)
  input.end()
}


module.exports = {
 parse: parse
}