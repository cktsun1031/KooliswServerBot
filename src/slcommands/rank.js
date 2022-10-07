const { MessageEmbed } = require('discord.js')
const { createCanvas, registerFont, loadImage } = require('canvas')
const {
  fillTextWithTwemoji,
} = require('node-canvas-with-twemoji-and-discord-emoji')
const Lvl = require('../models/level')
const { transferTimeToChinese, nameSubtract } = require('../function/tool')
const {
  getNextRankRole,
  getHowManyRoleUserHas,
  howManyActiveRole,
} = require('../function/levelSystem')
const { msgMathRate, emojis } = require('../config.json')
const { solveMsgUsr } = require('../function/rankingsys')
const { cache } = require('../plugins/globalCache')

const countupsym = (number_) => {
  if (number_ >= 1000) return `${Number.parseFloat(number_ / 1000).toFixed(2)}K`
  return number_
}

module.exports = {
  name: 'rank',
  description: '查看用戶在此伺服器的成員等級和所有訊息總共數量!',
  options: [
    {
      name: 'user',
      description: '在此提及你要查看的用戶',
      required: false,
      type: 'USER',
    },
  ],
  cooldown: 5 * 1000,
  type: 1,
  async run({ inter, args }) {
    const embed = new MessageEmbed()
    const user = args[0]
      ? await inter.guild.members.fetch(args[0])
      : inter.member
    if (user.user.bot) {
      embed
        .setAuthor({
          name: `${user.user.username}#${user.user.discriminator} 的成員等級`,
          iconURL: user.user.displayAvatarURL(),
        })
        .setDescription(`${emojis.cross} 此功能不適用於機器人`)
      return inter.reply({ embeds: [embed] })
    }
    const [userDB] = await solveMsgUsr(user.id, inter.guildId, false)
    const {
      totalMsg, disabled, weeklyMsg, prevHasActiveRole, level,
    } = userDB
    const messagerolenext = getNextRankRole(level)
    const hadRankRoles = getHowManyRoleUserHas(user)
    const hadActiveRoles = howManyActiveRole(user)
    const curlvl = Math.floor(msgMathRate * Math.sqrt(totalMsg))
    const remaininglvmsg = Math.round(((curlvl + 1) / msgMathRate) ** 2) - totalMsg
    const percenlvl = Math.round(
      ((totalMsg - (curlvl / msgMathRate) ** 2)
        / (Math.round(((curlvl + 1) / msgMathRate) ** 2)
          - Math.round((curlvl / msgMathRate) ** 2)))
        * 100,
    )
    const filteredServer = await Lvl.find({ guildId: inter.guildId })
      .sort([['totalMsg', 'descending']])
      .exec()
    const userServerRank = filteredServer
      .splice(0, inter.guild.memberCount)
      .findIndex((r) => user.id === r.userId)
    const processbar = ((totalMsg - (curlvl / msgMathRate) ** 2)
        / (Math.round(((curlvl + 1) / msgMathRate) ** 2)
          - Math.round((curlvl / msgMathRate) ** 2)))
      * 590
    const canvas = createCanvas(934, 282)
    const context = canvas.getContext('2d')
    registerFont('./src/assets/SourceHanSansHC-Medium.otf', {
      family: 'SourceHanSansHC-Medium',
    })
    context.font = '65px SourceHanSansHC-Medium'
    context.fillStyle = '#ffffff'
    const background = await loadImage('./src/assets/test1.png')
    context.drawImage(background, 0, 0, canvas.width, canvas.height)
    context.font = '42px SourceHanSansHC-Medium'
    await fillTextWithTwemoji(
      context,
      `${nameSubtract(user.user.username, 11, 7)}#${user.user.discriminator}`,
      280,
      170,
    )
    const requiredxp = Math.round(((curlvl + 1) / msgMathRate) ** 2)
      - Math.round((curlvl / msgMathRate) ** 2)
    const curmsgxp = totalMsg - Math.round((curlvl / msgMathRate) ** 2)
    const thisWeekActive = weeklyMsg > 150 ? '是' : '否'
    const thisTermActive = prevHasActiveRole ? '是' : '否'
    // base bar v
    context.beginPath()
    context.lineWidth = 2
    context.fillStyle = '#fff'
    context.moveTo(280, 220)
    context.quadraticCurveTo(280, 205, 300, 205)
    context.lineTo(870, 205)
    context.quadraticCurveTo(890, 205, 890, 220)
    context.quadraticCurveTo(890, 235, 870, 235)
    context.lineTo(300, 235)
    context.quadraticCurveTo(280, 235, 280, 220)
    context.fill()
    context.closePath()
    // covered bar #4895BB
    context.beginPath()
    context.lineWidth = 2
    context.fillStyle = '#00d138'
    context.moveTo(280, 220)
    context.quadraticCurveTo(280, 205, 300, 205)
    context.lineTo(300 + processbar - 20, 205)
    context.quadraticCurveTo(300 + processbar, 205, 300 + processbar, 220)
    context.quadraticCurveTo(300 + processbar, 235, 300 + processbar - 20, 235)
    context.lineTo(300, 235)
    context.quadraticCurveTo(280, 235, 280, 220)
    context.fill()
    context.fillStyle = '#fff'
    context.textAlign = 'right'
    context.font = '42px SourceHanSansHC-Medium'
    context.fillText(
      `${countupsym(curmsgxp)} / ${countupsym(requiredxp)}`,
      920,
      170,
    )
    context.font = '35px SourceHanSansHC-Medium'
    context.fillText(
      `總訊息 ${countupsym(totalMsg)}  排名 ${
        userServerRank + 1
      }  等級 ${level}`,
      890,
      55,
    )
    context.textAlign = 'left'
    context.font = '15px SourceHanSansHC-Medium'
    context.fillText(`©${inter.guild.name} 等級系統 - 版權所有`, 620, 272)
    context.fillStyle = '#000000'
    context.font = '25px SourceHanSansHC-Medium'
    const percenx = processbar > 50 ? 233 + processbar : 300 + processbar + 6
    context.fillText(`${percenlvl}%`, percenx, 229)
    context.closePath()
    context.shadowColor = 'black'
    context.shadowBlur = 5
    context.shadowOffsetX = 4
    context.shadowOffsetY = 4
    context.fillStyle = '#fff'
    context.beginPath()
    context.arc(142, 142, 110, 0, Math.PI * 2, true)
    context.stroke()
    context.fill()
    context.beginPath()
    context.arc(142, 142, 100, 0, Math.PI * 2, true)
    context.closePath()
    context.clip()
    const avtr = await loadImage(
      user.user.displayAvatarURL({ format: 'png', size: 4096 }),
    )
    context.drawImage(avtr, 42, 42, 200, 200)
    let content = `**總訊息量:** \`${totalMsg}\`\n**每週訊息量:** \`${weeklyMsg}\` (<t:${cache.get(
      'rTM',
    )}:R>重置) \n**等級:** \`${level}\`\n**進度:** \`${percenlvl}%\`, 距離下一級還有 \`${remaininglvmsg}\` 條訊息就能成功晉級\n**排名:** \`${
      userServerRank + 1
    }\`\n**近期活躍:** \`${thisTermActive}\``
    if (user.roles.cache.has('691991846888407071')) {
      content += `\n**活躍達標:** \`${thisWeekActive}\`, <t:${cache.get(
        'cUsA',
      )}:R>進行檢查`
    }
    if (
      disabled !== false
      && disabled.status === true
      && disabled.endTime < Date.now()
    ) {
      content += `\n**已被禁用紀錄訊息, 解凍日期:** \`${transferTimeToChinese(
        disabled.endTime,
      )}\``
    }
    content += `\n**下級身份組:** ${messagerolenext}\n**活躍認證:** ${hadActiveRoles}\n**已擁有的等級身份組:** ${hadRankRoles}`
    embed
      .setAuthor({
        name: `${user.user.username}#${user.user.discriminator} 的成員等級`,
        iconURL: user.user.displayAvatarURL(),
      })
      .setDescription(content)
      .setImage(`attachment://${user.id}_rankcard.png`)
      .setFooter({
        text: `© ${new Date().getFullYear()} ${inter.guild.name}`,
        iconURL: inter.guild.iconURL(),
      })
    return inter.reply({
      embeds: [embed],
      files: [
        { name: `${user.id}_rankcard.png`, attachment: canvas.toBuffer() },
      ],
    })
  },
}
