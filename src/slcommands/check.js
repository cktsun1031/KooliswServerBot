const { MessageEmbed } = require('discord.js')
const { transferTimeToChinese } = require('../function/tool')
const { solveMsgUsr } = require('../function/rankingsys')
const { emojis } = require('../config.json')

module.exports = {
  name: 'check',
  description: '查看用戶在此伺服器的資訊和使用情況!',
  options: [
    {
      name: 'user',
      description: '在此輸入你要查看的用戶',
      required: false,
      type: 'USER',
    },
  ],
  type: 1,
  async run({ inter, args }) {
    const user = args[0]
      ? await inter.guild.members.fetch(args[0])
      : inter.member
    const embed = new MessageEmbed()
    if (user.user.bot) {
      embed.setAuthor({
        name: `${user.user.username}#${user.user.discriminator} 的用戶數據`,
        iconURL: user.user.displayAvatarURL(),
      })
      embed.setDescription(`${emojis.cross} 此功能不適用於機器人`)
      return inter.reply({
        embeds: [embed],
      })
    }
    const [userDB] = await solveMsgUsr(user.id, inter.guildId, false)
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
    return inter.reply({ embeds: [embed] })
  },
}
