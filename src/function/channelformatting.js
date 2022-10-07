const { WebhookClient } = require('discord.js')

const webhook1 = new WebhookClient({ url: process.env.webhookUrl })
const eventDB = require('../models/eventJobs')
const { wordsGame } = require('./channelAction')

let tpPlace = false

module.exports = async (message) => {
  const { channel, content } = message
  switch (channel.id) {
    case '764384109799407636': {
      if (message.author.bot) return message.delete()
      const rtnMessage = async (desc) => {
        await message.delete()
        const mad = await message.channel.send({
          content: `<@${message.author.id}>, ${desc}`,
        })
        return setTimeout(() => mad.delete(), 10_000)
      }
      if (
        Date.now() - new Date(message.member.joinedAt).getTime()
        < 604_800_000
      ) {
        return rtnMessage('你至少需要加入本群 **7天** 才能夠發佈宣傳內容!')
      }
      const re = /(www.\S+|https?:\/\/\S+)|([\w-]+[.:]\w(([#&./=?]?[\w-]+))*\/?)/g
      const re1 = /\\u([\dA-Fa-f]{4})/g
      const re2 = /[^\s\w%./:|-]/gi
      const unescapeUnicode = (string_) => string_.replace(re1, (g, wd) => String.fromCharCode(Number.parseInt(wd, 16)))
      const contentOfMessage = unescapeUnicode(
        content.toLowerCase().replace(re2, ''),
      ).normalize()
      const allLinks = contentOfMessage.match(re)
      if (!allLinks || allLinks.length < 3) return
      return rtnMessage('你的信息包含了超過兩個超連結的允許上限!')
    }
    case '763747109366792192': {
      if (message.author.bot) return message.delete()
      const re = /^(群組建議:|suggestion:|影片建議:|youtube suggestion:|video suggestion:)/
      if (!re.test(content.toLowerCase())) return
      await message.react('👍')
      return message.react('👎')
    }
    case '803279940312760320': {
      const re = /\D/
      if (!content || isNaN(content) || re.test(content)) return message.delete()
      const cGDB = await eventDB.findOne({ Name: 'countingGame' })
      if (message.webhookId) return
      if (!cGDB || message.author.bot || cGDB.Data + 1 !== Number(content)) return message.delete()
      if (tpPlace) return message.delete()
      tpPlace = true
      await message.delete()
      cGDB.Data = Number(content)
      await cGDB.save().catch(() => null)
      webhook1.send({
        content,
        username: message.author.username,
        avatarURL: message.author.displayAvatarURL(),
      })
      tpPlace = false
      return
    }
    case '858356212302741535':
      return wordsGame(message)
    case '807284722484117605': {
      if (message.author.bot) return message.delete()
      const re = /https:\/\/(|www.|web.)roblox.com\/games\/\d+\?privateServerLinkCode=[\s\w]+/
      return re.test(content) ? undefined : message.delete()
    }
    default:
  }
}
