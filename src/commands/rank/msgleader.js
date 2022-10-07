const { MessageEmbed } = require('discord.js')
const { createCanvas, registerFont, loadImage } = require('canvas')
const {
  fillTextWithTwemoji,
} = require('node-canvas-with-twemoji-and-discord-emoji')
const Lvl = require('../../models/level')
const { nameSubtract } = require('../../function/tool')
const { emojis } = require('../../config.json')

module.exports = {
  name: 'messageleaderboard',
  aliases: ['msgleader', 'messagelb', 'msglb'],
  desc: '獲取本伺服器實時訊息活躍排名',
  usage: 'k!msglb [頁數(可選)]',
  run: async ({ msg, args }) => {
    msg.channel.sendTyping()
    let firstnum = 87
    let startfrom = 0
    let endat = 10
    let number = 1
    const embed = new MessageEmbed()
    if (args[0]) {
      if (isNaN(args[0])) {
        embed
          .setColor('RED')
          .setTitle(`${emojis.cross} 參數必須是一個數字`)
          .setDescription(`請使用正確方式: \`\`\`${module.exports.usage}\`\`\``)
        return msg.reply({ embeds: [embed] })
      }
      if (args[0] >= 2) {
        endat = 10 * args[0]
        startfrom = 10 * args[0] - 10
        number = startfrom + 1
      }
    }
    const canvas = createCanvas(825, 600)
    const context = canvas.getContext('2d')
    registerFont('./src/assets/SourceHanSansHC-Medium.otf', {
      family: 'SourceHanSansHC-Medium',
      weight: 48,
      style: 'Medium',
    })
    context.font = '65px SourceHanSansHC-Medium'
    context.fillStyle = '#ffffff'
    const background = await loadImage('./src/assets/Leadersec.png')
    context.drawImage(background, 0, 0, 825, 600)
    context.font = '32px SourceHanSansHC-Medium'
    const userServerRank = await Lvl.find({
      guildId: msg.guildId,
      totalMsg: { $gte: 0 },
    }).sort([['totalMsg', 'descending']])
    const top10 = userServerRank.splice(startfrom, endat)
    if (top10.length === 0) {
      embed.setColor('RED')
      embed.setDescription(`${emojis.cross} 未能尋找相關紀錄/發生了錯誤`)
      return msg.reply({ embeds: [embed] })
    }
    let index = 0
    while (index < top10.length) {
      if (firstnum >= 587 || number > endat) break
      const {
        userId, prevHasActiveRole, totalMsg, weeklyMsg,
      } = top10[index]
      let userName
      if (msg.guild.members.cache.has(userId)) {
        const user = await msg.client.users.fetch(userId)
        userName = `${nameSubtract(user.username, 17, 12)}#${
          user.discriminator
        }`
      } else {
        userName = userId
      }
      context.textAlign = 'left'
      await fillTextWithTwemoji(context, userName, 87, firstnum)
      context.fillText(`#${number}`, 6, firstnum)
      const actveIcon = prevHasActiveRole === true
        ? '<:tick:846643019197448234>'
        : '<:crossi:846642539436310559>'
      await fillTextWithTwemoji(context, actveIcon, 778, firstnum)
      context.textAlign = 'center'
      context.fillText(totalMsg ?? 'N/A', 592.5, firstnum)
      context.fillText(weeklyMsg ?? 'N/A', 713, firstnum)
      firstnum += 50
      number += 1
      index += 1
    }
    embed
      .setTitle('訊息排行榜 Message Leaderboard')
      .setImage('attachment://leaderboard.png')
      .setColor('GREEN')
    return msg.reply({
      embeds: [embed],
      files: [{ name: 'leaderboard.png', attachment: canvas.toBuffer() }],
    })
  },
}
