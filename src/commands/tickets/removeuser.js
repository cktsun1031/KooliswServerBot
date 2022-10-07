const { MessageEmbed } = require('discord.js')
const { emojis } = require('../../config.json')

module.exports = {
  name: 'removeuser',
  desc: '撤銷個別用戶開票檢視和聊天存取權',
  usage: 'k!removeuser [用戶]',
  run: async ({ msg, args }) => {
    if (!msg.channel.name.startsWith('ticket-')) return
    const embed = new MessageEmbed()
    let userss
    try {
      userss = msg.mentions.users.first()
        ? msg.mentions.users.first()
        : (args[0]
          ? args[0].length === 18
            ? msg.guild.members.cache.get(args[0]).user
            : msg.guild.members.cache.find((u) => u.user.username
              .toLowerCase()
              .includes(String(args[0]).toLowerCase())).user
          : false)
    } catch {
      embed.setDescription(`${emojis.cross} 無法尋找用戶`).setColor('RED')
      return msg.channel.send({ embeds: [embed] })
    }
    if (!userss) {
      return msg.reply({
        content: '請提及個別用戶來移除該用戶在此頻道的權限',
      })
    }
    await msg.channel.permissionOverwrites.edit(userss.id, {
      VIEW_CHANNEL: false,
    })
    embed
      .setDescription(`已取消 <@!${userss.id}> 查看本支援開票的權利`)
      .setColor('GREEN')
    return msg.reply({ embeds: [embed] })
  },
}
