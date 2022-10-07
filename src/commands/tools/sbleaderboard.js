const { MessageEmbed } = require('discord.js')

module.exports = {
  name: 'sbleaderboard',
  desc: '查看本群熱門訊息排行榜',
  run: async ({ msg }) => {
    if (msg.guild.id !== '687219262406131714') return
    const starboard = msg.client.starboardsManager.starboards.find(
      (sb) => sb.guildID === msg.guild.id && sb.options.emoji === '⭐',
    )
    if (!starboard) {
      msg.channel.send('No starboard found.')
      return
    }
    const lb = await starboard.leaderboard()
    const content = lb.map(
      (m, index) => `**${index + 1}.**     ${m.stars} ⭐  -  ${
        m.embeds[0].description || `[Image](${m.embeds[0].image.url})`
      }`,
    )
    const leaderboard = new MessageEmbed()
      .setTitle(`${msg.guild.name}'s starboard`)
      .setDescription(content.join('\n'))
    msg.channel.send({ embeds: [leaderboard] })
  },
}
