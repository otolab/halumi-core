
const {comprehend} = require('../libs')
const patterns = require('./patterns')
const {buildReply} = require('./reply')

function printCommands(commands) {
  console.log('------------')
  if (commands.length > 0) console.log('input:', commands[0].source)
  console.log(buildReply(commands))
}

const text = process.argv.slice(2).join()

if(text) {
  comprehend(text, patterns, {}, (err, commands) => {
    printCommands(commands)
  })
}

else {
  comprehend("明日は休みたい。", patterns, {}, (err, commands) => {
    printCommands(commands)
  })

  comprehend("やっぱり休みます", patterns, {}, (err, commands) => {
    printCommands(commands)
  })

  comprehend("明日は遠くに旅行にいく予定なのでリモートです", patterns, {}, (err, commands) => {
    printCommands(commands)
  })

  comprehend("明日と、8/1, 2018年7月20-23日と、2017年7月の30, 31日はリモート作業です", patterns, {}, (err, commands) => {
    printCommands(commands)
  })

  comprehend("8月1日まで旅行です。その間休みます", patterns, {}, (err, commands) => {
    printCommands(commands)
  })

  comprehend("8月1日はリモートです。8月8日はお休みします。", patterns, {}, (err, commands) => {
    printCommands(commands)
  })

  comprehend("8月1日までリモートなのでお休みします。", patterns, {}, (err, commands) => {
    printCommands(commands)
  })

  comprehend("8月1日はリモートです。お休みします。", patterns, {}, (err, commands) => {
    printCommands(commands)
  })

  comprehend("お休みします。8/1に。", patterns, {}, (err, commands) => {
    printCommands(commands)
  })
}