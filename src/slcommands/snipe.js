const { MessageEmbed } = require('discord.js')
const snipe = require('../models/snipe')

module.exports = {
  name: 'snipe',
  description: '查詢被刪除的訊息',
  options: [
    {
      type: 'CHANNEL',
      name: 'channel',
      description: '選擇你想查看最近刪除訊息的頻道',
      required: false,
    },
  ],
  type: 1,
  globalUsage: true,
  async run({ inter, args }) {
    const message = await snipe.findOne({
      cId: args[0] ? args[0] : inter.channelId,
    })
    if (!message) {
      return inter.reply({
        content: '這裏沒有被刪除的訊息',
      })
    }
    const embed = new MessageEmbed()
      .setAuthor({ name: message.author.name ?? 'N/A' })
      .setFooter({ text: message.date ?? 'N/A' })
    if (message.content.data) embed.setDescription(message.content.data)
    if (message.content.image) embed.setImage(message.content.image)
    return inter.reply({ embeds: [embed] })
  },
}
