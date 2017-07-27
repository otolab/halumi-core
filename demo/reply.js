
function buildReply(commands) {
    let zatsudan = true
    const reply = []

    commands.forEach((command) => {
      if (command.command === 'voyage') {
        if (command.status.length == 0) {
          zatsudan = false;
          reply.push("おお、いいですね。いってらっしゃいマシ！！")
        }
      }

      if (command.command === 'rest') {
        if (command.status.length === 0) {
          zatsudan = false;
          reply.push("休暇申請デスネ。了解デス！")

          if (command.days.length > 0) {
            command.days.forEach((day) => {
              reply.push('  ' + day.format('%Y年%m月%d日'))
            })
            reply.push("に休暇を入れますデスヨ");
          }
          if (command.days.length === 0) {
            reply.push('いつデスか！？解らなかったデス！')
          }
        }
        else if (command.status.length > 0) {
          zatsudan = false;
          reply.push("休暇申請デスカ？ちょっと理解できなかったので、もう一度言ってくださいデスネ。")
        }
      }

      if (command.command === 'remote') {
        if (command.status.length == 0) {
          zatsudan = false;
          reply.push("了解デス！");

          if (command.days.length > 0) {
            command.days.forEach((day) => {
              reply.push('  ' + day.format('%Y年%m月%d日'))
            })
            reply.push("にリモート作業日を入れますデスヨ");
          }
          if (command.days.length === 0) {
            reply.push('いつデスか！？解らなかったデス！')
          }
        }
        else if (command.status.length > 0) {
          zatsudan = false;
          reply.push("リモート申請デスカ？ちょっと理解できなかったので、もう一度言ってくださいデスネ。")
        }
      }

    })

    if (zatsudan) {
      reply.push("むずかしい言葉はワカンナイデス。雑談モードとかあったら楽しいデスヨ");
    }

    return reply.join('\n')
}

module.exports = {
  buildReply: buildReply
}