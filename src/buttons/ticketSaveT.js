const { MessageEmbed } = require('discord.js')
const fetchAll = require('discord-fetch-all')
const fs = require('fs')
const ticketDB = require('../models/ticket')
const { allButtonDisable } = require('../function/ticketSystem')
const { emojis } = require('../config.json')

module.exports = {
  id: 'save_transcript',
  async run(inter) {
    if (!inter.channel.name.startsWith('ticket-')) return
    const tcdb = await ticketDB.findOne({ cId: inter.channelId })
    if (!tcdb) return allButtonDisable(inter, inter.message.id)
    if (tcdb.secErd === false) return inter.deferUpdate()
    const ticketChannel = inter.channel
    const msggs = await fetchAll.messages(ticketChannel, {
      reverseArray: true,
      userOnly: true,
    })
    const content = msggs.map((m) => `${m.author.tag} - ${m.content}`)
    if (content.length === 0) {
      return inter.reply({
        ephemeral: true,
        embeds: [
          new MessageEmbed().setDescription(`${emojis.cross} 找不到任何訊息`),
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
    fs.unlinkSync(`${ticketChannel.id}-ts.txt`)
    return inter.deferUpdate()
  },
}
