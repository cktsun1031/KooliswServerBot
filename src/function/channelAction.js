const eventDB = require('../models/eventJobs')

async function wordsGame(message, aType = 'S') {
  const { content, attachments } = message
  const re = /[^A-Za-z]/
  if (
    !content
    || message.author.bot
    || attachments?.first()
    || re.test(content)
    || content.length < 3
    || content.length > 25
  ) {
    return message.delete()
  }
  const lfgDB = await eventDB.findOne({
    Name: 'letterOfWordsGame',
  })
  if (!lfgDB) return message.delete()
  const re1 = /^[A-Za-z]/
  if (aType === 'S' && lfgDB.Data !== content.match(re1)[0].toLowerCase()) {
    message.delete()
    const messageWaitDel = await message.channel.send({
      content: `詞語錯誤, 請傳送 \`${lfgDB.Data}\` 開頭的詞語!`,
    })
    return setTimeout(() => messageWaitDel.delete(), 4500)
  }
  const re2 = /[A-Za-z]$/
  lfgDB.Data = content.match(re2)[0].toLowerCase()
  await lfgDB.save().catch(() => null)
}

module.exports = {
  wordsGame,
}
