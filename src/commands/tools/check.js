const { MessageEmbed } = require('discord.js')
const { transferTimeToChinese } = require('../../function/tool')
const { solveMsgUsr } = require('../../function/rankingsys')
const { emojis } = require('../../config.json')

module.exports = {
  name: 'check',
  aliases: ['c'],
  desc: '查看你在本群的用戶和等級系統分析數據',
  usage: 'k!check [用戶(可選)]',
  run: async ({ msg, args }) => {
    let user
    const embed = new MessageEmbed()
    const rankuser = msg.mentions.members.first()
    try {
      if (!rankuser) {
        user = args[0]
          ? (args[0].length === 18
            ? msg.guild.members.cache.get(args[0])
            : msg.guild.members.cache.find((u) => u.user.username
              .toLowerCase()
              .includes(String(args[0]).toLowerCase())))
          : msg.member
      } else user = rankuser
      if (!user && args[0] && args[0].length >= 18) {
        user = await msg.guild.members.fetch(args[0])
      } else if (!user) user = await msg.guild.members.fetch(msg.author.id)
    } catch {
      embed
        .setColor('RED')
        .setTitle(`${emojis.cross} 無法尋找用戶`)
        .setDescription(`請使用正確方式: \`\`\`${module.exports.usage}\`\`\``)
      return msg.reply({ embeds: [embed] })
    }
    if (user.user.bot) {
      embed
        .setAuthor({
          name: `${user.user.username}#${user.user.discriminator} 的用戶數據`,
          iconURL: user.user.displayAvatarURL(),
        })
        .setDescription(`${emojis.cross} 此功能不適用於機器人`)
      return msg.reply({ embeds: [embed] })
    }
    const [userDB] = await solveMsgUsr(user.id, msg.guild.id, false)
    embed
      .setAuthor({
        name: `${user.user.username}#${user.user.discriminator} 的用戶數據`,
        iconURL: user.user.displayAvatarURL(),
      })
      .setDescription(
        `**總訊息量:** \`${userDB.totalMsg}\`\n**每週訊息量:** \`${
          userDB.weeklyMsg
        }\`\n**等級:** \`${
          userDB.level
        }\`\n**加入日期:** \`${transferTimeToChinese(
          user.joinedAt,
        )}\`\n**帳戶創建日期:** \`${transferTimeToChinese(
          user.user.createdAt,
        )}\``,
      )
    return msg.reply({ embeds: [embed] })
  },
}
