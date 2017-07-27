
const {comprehend} = require('./libs/index')

const patterns = {
  remote: [
    ['リモート', 'する'],
    ['リモート']
  ],
  rest: [
    ['休み', 'する'],
    ['休み', '思う'],
    ['休む', '予定'],
    ['休む', '思う'],
    ['休む'],
    ['休み']
  ],
  voyage: [
    ['旅行', '*', '行く'],
    ['旅行', '*', '予定']
  ]
}

comprehend("明日は休みたい。", patterns, {debug: true}, (err, commands) => {
  printCommands(commands)
})

comprehend("やっぱり休みます", patterns, {debug: true}, (err, commands) => {
  printCommands(commands)
})

comprehend("明日は遠くに旅行にいく予定なのでリモートです", patterns, {debug: true}, (err, commands) => {
  console.log('RESULT:', commands)
  printCommands(commands)
})

comprehend("明日と、8/1, 2018年7月20-23日と、2017年7月の30, 31日はリモート作業です", patterns, {debug: true}, (err, commands) => {
  printCommands(commands)
})

comprehend("8月1日まで旅行です。その間休みます", patterns, {debug: true}, (err, commands) => {
  printCommands(commands)
})

comprehend("8月1日はリモートです。8月8日はお休みします。", patterns, {debug: true}, (err, commands) => {
  printCommands(commands)
})

comprehend("8月1日までリモートなのでお休みします。", patterns, {debug: true}, (err, commands) => {
  printCommands(commands)
})

comprehend("8月1日はリモートです。お休みします。", patterns, {debug: true}, (err, commands) => {
  printCommands(commands)
})

comprehend("お休みします。8/1に。", patterns, {debug: true}, (err, commands) => {
  printCommands(commands)
})



function printCommands(commands) {
    let zatsudan = true
    if (commands.length === 0) return;

    console.log('------------')

    console.log('input:', commands[0].source)

    commands.forEach((command) => {
      if (command.command === 'voyage') {
        if (command.status.length == 0) {
          zatsudan = false;
          console.log("おお、いいですね。いってらっしゃいマシ！！");
        }
      }

      if (command.command === 'rest') {
        if (command.status.length === 0) {
          zatsudan = false;
          console.log("休暇申請デスネ。了解デス！")

          if (command.days.length > 0) {
            command.days.forEach((day) => {
              console.log(' ', day.format('%Y年%m月%d日'))
            })
            console.log("に休暇を入れますデスヨ");
          }
          if (command.days.length === 0) {
            console.log('いつデスか！？解らなかったデス！')
          }
        }
        else if (command.status.length > 0) {
          zatsudan = false;
          console.log("休暇申請デスカ？ちょっと理解できなかったので、もう一度言ってくださいデスネ。")
        }
      }

      if (command.command === 'remote') {
        if (command.status.length == 0) {
          zatsudan = false;
          console.log("了解デス！");

          if (command.days.length > 0) {
            command.days.forEach((day) => {
              console.log(' ', day.format('%Y年%m月%d日'))
            })
            console.log("にリモート作業日を入れますデスヨ");
          }
          if (command.days.length === 0) {
            console.log('いつデスか！？解らなかったデス！')
          }
        }
        else if (command.status.length > 0) {
          zatsudan = false;
          console.log("リモート申請デスカ？ちょっと理解できなかったので、もう一度言ってくださいデスネ。")
        }
      }

    })

    if (zatsudan) {
      console.log("（雑談モードデスヨ）");
    }

}