"use strict"

const {createDate, setUseServiceTimezoneByDefault, setDefaultLocalization} = require('sweet-dates')

setUseServiceTimezoneByDefault(true)
setDefaultLocalization({
  locale: 'ja',
  timezone: 'Asia/Tokyo'
})


function datePrefilter(src) {
  return src
    // 扱いづらいので幾つかの文字を半角化
    .replace(/([０-９／])/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xFEE0))

    // "7/26"を"7月26日"に変換する
    .replace(/([1-2][0-9][0-9][0-9])\s*\/\s*([0-1]?[0-9])\s*\/\s*([0-3]?[0-9])/g, (m, p1, p2, p3) => `${p1}年${p2}月${p3}日`)
    .replace(/([0-1]?[0-9])\s*\/\s*([0-3]?[0-9])/g, (m, p1, p2) => `${p1}月${p2}日`)

    // "2017年7月26"を"2017年7月26日"に変換する
    .replace(/([1-2][0-9][0-9][0-9])\s*年\s*([0-1]?[0-9])\s*月\s*([0-3]?[0-9])([^0-9日])/g, (m, p1, p2, p3, p4) => `${p1}年${p2}月${p3}日${p4}`)

    // "7/26, 27"を"7/26と27"に変換する
    // 並列であると処理されるがparaの扱いにならないため
    .replace(/([0-9]日?)[,、]\s*([0-9])/g, '$1と$2')

    // "26〜30日"を"26から30日"に変換する
    .replace(/([0-9]日?)[〜-]\s*([0-9])/g, '$1から$2')
}

function genDateRange(start, end) {
  const ret = []
  let d = createDate(start).get('今日', 'ja')
  while (d <= end) {
    ret.push(createDate(d))
    d.addDays(1)
  }
  return ret
}

function dateList(timePhrases) {
  // TODO: 来週の、来月の、のようなcontextへの対応

  let contextDate = createDate().get('今日', 'ja')
  let stableContextDate = contextDate
  const dates = timePhrases.map((phrase) => {
    let date
    let ret = phrase.sentences.map((sentence) => {
      return sentence.tag('NE:DATE').attr
    })[0]

    if (phrase.tag('未来句').tag) {
      const v = phrase.normalizedPhrase().split('/')[0]
      date = stableContextDate.get(v, 'ja')
      if (!date.isValid()) return
    }

    else if (ret) {
      date = contextDate.get(ret, 'ja')
      if (!date.isValid()) {
        // 「NE:DATE:あした」への対処
        const v = phrase.normalizedPhrase().split('/')[0]
        date = contextDate.get(v, 'ja')
        if (!date.isValid()) return
      }

      if (phrase.tag('カウンタ').attr === '月' || phrase.tag('カウンタ').attr === '年') {
        contextDate = date
        return
      }
    }

    else if (phrase.tag('カウンタ').attr === '月' || phrase.tag('カウンタ').attr === '年') {
      const v = phrase.normalizedPhrase().split('/')[1].replace('+', '')
      date = contextDate.get(v, 'ja')
      if (!date.isValid()) return
      contextDate = date
      return
    }

    else if (!phrase.tag('カウンタ').attr && phrase.tag('数量').tag) {
      const v = phrase.normalizedPhrase().split('/')[0]
      date = contextDate.get(v+'日', 'ja')
      if (!date.isValid()) return
    }

    else if (phrase.tag('強時間').tag) {
      const v = phrase.normalizedPhrase().split('/')[0]
      date = stableContextDate.get(v, 'ja')
      if (!date.isValid()) return
    }

    if (!date) return

    if (contextDate.getMonth() !== date.getMonth() ||
        contextDate.getFullYear() !== date.getFullYear()) {
      contextDate = date
    }

    return {
      date: date,
      from: (phrase.tag('係').attr === 'カラ格'),
      to: (phrase.tag('係').attr === 'マデ格')
    }

  }).filter((v) => v)

  let _from = null
  let _prev = createDate()
  let _dates = []
  dates.forEach((d) => {
    if (d.from) {
      _prev = _from = d.date
      return
    }
    else if (_from) {
      _dates = _dates.concat(genDateRange(_from, d.date))
    }
    else if (d.to && !_from) {
      _dates = _dates.concat(genDateRange(_prev, d.date))
    }
    else {
      _dates.push(d.date)
    }

    _from = null
    _prev = d.date
  })

  return _dates;
}

function isTimePhrase(phrase) {
  // 独立した日付として解析された
  if (phrase.sentences.some((sentence) => sentence.tag('NE:DATE').attr)) return true

  // 余分な属性を持たない数字は日付とみなす
  if (!phrase.tag('カウンタ').attr && phrase.tag('数量').tag) return true

  // '明日'など
  if (phrase.tag('未来句').tag) return true

  // 'あした'など...
  if (phrase.tag('強時間').tag) return true

  return false
}

module.exports = {
  datePrefilter,
  dateList,
  isTimePhrase
}