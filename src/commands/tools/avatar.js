const { MessageEmbed } = require('discord.js')
const { emojis } = require('../../config.json')

module.exports = {
  name: 'avatar',
  aliases: ['av'],
  usage: 'k!avatar [用戶(可選)]',
  cooldown: 1500,
  desc: '抓取用戶頭像',
  dmAllowed: true,
  run: async ({ msg, args }) => {
    const embed = new MessageEmbed()
    let userRes = msg.mentions.users.first()
    if (!userRes) {
      try {
        userRes = args[0]
          ? (args[0].length === 18
            ? msg.guild.members.cache.get(args[0]).user
            : msg.guild.members.cache.find((ur) => ur.user.username
              .toLowerCase()
              .includes(String(args[0]).toLowerCase())).user)
          : msg.author
        if (!userRes && args[0] && args[0].length >= 18) {
          userRes = await msg.guild.members.fetch(args[0]).user
        } else if (!userRes) {
          userRes = await msg.guild.members.fetch(msg.author.id).user
        }
      } catch {
        embed
          .setColor('RED')
          .setTitle(`${emojis.cross} 無法尋找用戶`)
          .setDescription(`請使用正確方式: \`\`\`${module.exports.usage}\`\`\``)
        return msg.reply({ embeds: [embed] })
      }
    }
    const avatarUrl = userRes.displayAvatarURL({
      dynamic: false,
      format: 'png',
      size: 4096,
    })
    embed
      .setTitle(`${userRes.tag} 的用戶頭像`)
      .setDescription(`圖片鏈接: [點擊這裡](${avatarUrl})`)
      .setImage(avatarUrl)
    return msg.channel.send({ embeds: [embed] })
  },
}
