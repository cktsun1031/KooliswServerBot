const { MessageEmbed } = require('discord.js')
const fetchAll = require('discord-fetch-all')
const fs = require('fs')

module.exports = {
  name: 'transcript',
  desc: '請求開票頻道所有訊息紀錄',
  run: async ({ msg }) => {
    if (!msg.channel.name.startsWith('ticket-')) return
    const ticketChannel = msg.channel
    const msggs = await fetchAll.messages(ticketChannel, {
      reverseArray: true,
      userOnly: true,
    })
    const content = msggs.map((m) => `${m.author.tag} - ${m.content}`)
    if (content.length === 0) {
      return msg.reply({
        embeds: [
          new MessageEmbed().setDescription(
            '<:cross:846642539436310559> 找不到任何訊息',
          ),
        ],
      })
    }
    fs.writeFileSync(`${ticketChannel.id}-ts.txt`, content.join('\n'))
    await ticketChannel.send({
      files: [
        {
          name: `${ticketChannel.id}-ts.txt`,
          attachment: `${ticketChannel.id}-ts.txt`,
        },
      ],
    })
    return fs.unlinkSync(`${ticketChannel.id}-ts.txt`)
  },
}
