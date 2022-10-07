const { MessageEmbed } = require('discord.js')
const snipe = require('../../models/snipe')
const { globalCmdDisabled } = require('../../config/blocked_channel.json')

module.exports = {
  name: 'snipe',
  aliases: ['s'],
  allChannelAccess: true,
  cooldown: 500,
  desc: '查看這條頻道最後被刪除的一條訊息',
  run: async ({ msg }) => {
    const messageDB = await snipe.findOne({
      cId: msg.channel.id,
    })
    if (!messageDB) {
      return msg.reply({
        content: '這裏沒有被刪除的訊息',
      })
    }
    const embed = new MessageEmbed()
      .setAuthor({ name: messageDB.author.name ?? 'N/A' })
      .setFooter({ text: messageDB.date ?? 'N/A' })
    if (messageDB.content.data) embed.setDescription(messageDB.content.data)
    if (messageDB.content.image) embed.setImage(messageDB.content.image)
    if (globalCmdDisabled.includes(msg.channel.id)) {
      msg.delete()
      msg.author.send({ embeds: [embed] }).catch(() => {})
    } else {
      msg.reply({ embeds: [embed] })
    }
  },
}
