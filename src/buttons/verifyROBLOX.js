const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js')
const { getLinkedUser } = require('../function/roblox')
const { noblox } = require('../robloxClient')
const { emojis } = require('../config.json')

module.exports = {
  id: 'robloxVerify',
  cooldown: 900_000,
  async run(inter) {
    const { member, guild } = inter
    if (!member) await guild.members.fetch(inter.user.id)
    if (member.roles.cache.has('802789415100874765')) {
      return inter.deferUpdate()
    }
    await inter.reply({ content: '🔍現在正在獲取數據', ephemeral: true })
    const result = await getLinkedUser(member.id, guild.id)
    if (!result) {
      const button = new MessageButton()
        .setStyle('LINK')
        .setLabel('RoVer驗證')
        .setURL('https://rover.link/login')
      const button1 = new MessageButton()
        .setStyle('LINK')
        .setLabel('BloxLink驗證')
        .setURL('https://blox.link/verification/687219262406131714')
      const embed = new MessageEmbed()
        .setTitle(`${emojis.cross} 發生問題!`)
        .setDescription(
          '無法從你的Discord帳戶中搜尋你的ROBLOX帳戶\n請從以下其中一個網站進行ROBLOX帳戶連結Discord帳戶的驗證',
        )
      return inter.editReply({
        content: null,
        embeds: [embed],
        components: [new MessageActionRow().addComponents(button, button1)],
      })
    }
    const usernameRBX = await noblox.getUsernameFromId(result).catch(() => null)
    if (!usernameRBX) return
    inter.editReply({
      content: `😀歡迎來到本群, 感謝你的驗證, **${usernameRBX}**! 數秒後將會自動給予身份組!`,
    })
    await new Promise((res) => setTimeout(res, 3500))
    return member.roles.add('802789415100874765')
  },
}
