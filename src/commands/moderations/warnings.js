const { MessageEmbed } = require('discord.js')
const { tfEn } = require('../../function/tool')
const Warn = require('../../models/warnings')
const { emojis } = require('../../config.json')

module.exports = {
  name: 'warnings',
  desc: 'warnings',
  usage: 'k!warn [用戶] [原因]',
  cooldown: 1000 * 10,
  allChannelAccess: true,
  run: async ({ msg, args }) => {
    msg.delete()
    const embed = new MessageEmbed()
    let userRes = msg.mentions.members.first()
    if (!userRes) {
      try {
        userRes = args[0] && args[0].length >= 18
          ? await msg.guild.members.fetch(args[0]).catch(() => {})
          : undefined
      } catch {
        embed
          .setColor('RED')
          .setTitle(`${emojis.cross} 無法尋找用戶`)
          .setDescription(`請使用正確方式: \`${module.exports.usage}\``)
        return msg.channel.send({ embeds: [embed] })
      }
    }
    const rejectA = async (desc, usage = false) => {
      embed.setColor('RED').setTitle(`${emojis.cross} ${desc}`)
      if (usage) {
        embed.setDescription(
          `請使用正確方式: \`\`\`${module.exports.usage}\`\`\``,
        )
      }
      const messageAwaitDel = await msg.channel.send({ embeds: [embed] })
      return setTimeout(() => messageAwaitDel.delete(), 7500)
    }
    if (!userRes) return rejectA('你必須提供目標成員', true)
    const hadCurrentUsr = await Warn.findOne({
      userId: userRes.id,
    })
    if (!hadCurrentUsr) {
      embed
        .setColor('GREEN')
        .setTitle(`${emojis.tick} 這位用戶沒有任何警告紀錄!`)
      return msg.channel.send({
        embeds: [embed],
      })
    }
    let content = ''
    const warng = hadCurrentUsr.warnings
    const { length } = warng
    for (let index = 0; index < length; index++) {
      if (index !== 0 || index !== length - 1) content += '\n\n'
      const user = await msg.client.users
        .fetch(warng[index].wdBy)
        .catch(() => null)
      const time = tfEn(warng[index].wdAt, false)
      content += `**ID:** \`${warng[index].wId}\` | 警告者: **${user.tag}**\n${time} - ${warng[index].reason}`
    }
    embed
      .setAuthor({
        name: `${userRes.user.username}#${userRes.user.discriminator} 的警告紀錄`,
        iconURL: userRes.user.displayAvatarURL(),
      })
      .setDescription(content)
    return msg.channel.send({
      embeds: [embed],
    })
  },
}
