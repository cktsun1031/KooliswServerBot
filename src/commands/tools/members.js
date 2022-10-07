const { MessageEmbed } = require('discord.js')
const Lvl = require('../../models/level')
const { emojis } = require('../../config.json')

module.exports = {
  name: 'members',
  desc: '搜尋伺服器成員列表',
  cooldown: 5000,
  run: async ({ msg, args }) => {
    if (!args[0]) return
    switch (true) {
      case args[0] === 'level' || args[0] === 'lvl': {
        const embed = new MessageEmbed()
        const searchW = args[1]
        if (!searchW || isNaN(searchW) || searchW <= 0 || searchW > 100) {
          embed
            .setDescription(`${emojis.cross} 無法處理您的搜尋要求!`)
            .setColor('RED')
          return msg.reply({
            embeds: [embed],
          })
        }
        const filtered = await Lvl.find({
          guildID: msg.guild.id,
          level: Number(searchW),
        })
        if (!filtered) {
          embed.setDescription(`${emojis.cross} 無搜尋結果!`).setColor('RED')
          return msg.reply({
            embeds: [embed],
          })
        }
        let content = ''
        for (let index = 0, l = filtered.length; index < l; index++) {
          if (index > 25) {
            content += '\n**... ...**'
            break
          }
          const usrId = filtered[index].userId
          let userGot = (await msg.client.users.fetch(usrId).catch(() => null))
            .tag
          if (!userGot) userGot = usrId
          content += `<@!${usrId}> **${userGot}**`
          if (index < filtered.length - 1) content += '\n'
        }
        if (content.length > 4000) return
        embed
          .setTitle(`用戶等級列表: ${searchW} (${filtered.length})`)
          .setDescription(content)
        return msg.reply({
          embeds: [embed],
        })
      }
      case args[0] === 'search' || args[0] === 's': {
        const embed = new MessageEmbed()
        const searchW = args.slice(1).join(' ').toLowerCase()
        if (!searchW || searchW.length > 30) {
          embed
            .setDescription(`${emojis.cross}  無法處理您的搜尋要求!`)
            .setColor('RED')
          return msg.reply({
            embeds: [embed],
          })
        }
        const result = msg.guild.members.cache.filter((member) => member.user.username.toLowerCase().includes(searchW))
        if (!result) {
          embed.setDescription(`${emojis.cross} 無搜尋結果!`).setColor('RED')
          return msg.reply({
            embeds: [embed],
          })
        }
        let content = ''
        let index = 0
        result.some((user) => {
          if (index > 25) {
            content += '\n**... ...**'
            return true
          }
          content += `<@!${user.user.id}> **${user.user.tag}**`
          if (index < result.size - 1) content += '\n'
          index += 1
        })
        if (content.length > 4000) return
        embed
          .setTitle(`用戶搜尋列表: ${searchW} (${result.size})`)
          .setDescription(content)
        return msg.reply({
          embeds: [embed],
        })
      }
      default:
    }
  },
}
