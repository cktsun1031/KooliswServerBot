const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js')
const ticketDB = require('../models/ticket')
const { allButtonDisable } = require('../function/ticketSystem')

module.exports = {
  id: 'delete_ticket',
  async run(inter) {
    if (!inter.channel.name.startsWith('ticket-')) return
    const tcdb = await ticketDB.findOne({ cId: inter.channelId })
    if (!tcdb) return allButtonDisable(inter, inter.message.id)
    if (tcdb.secErd === false) return inter.deferUpdate()
    const message = await inter.channel.messages
      .fetch(tcdb.seId)
      .catch(() => null)
    if (message) {
      const interaction1 = new MessageButton()
        .setStyle('SECONDARY')
        .setLabel('📰')
        .setCustomId('save_transcript')
        .setDisabled(true)
      const interaction2 = new MessageButton()
        .setStyle('DANGER')
        .setLabel('🚫')
        .setCustomId('delete_ticket')
        .setDisabled(true)
      const interaction3 = new MessageButton()
        .setStyle('SECONDARY')
        .setLabel('🔓')
        .setCustomId('ticket_reopen')
        .setDisabled(true)
      message.edit({
        components: [
          new MessageActionRow().addComponents(
            interaction1,
            interaction2,
            interaction3,
          ),
        ],
      })
    }
    await ticketDB.findOneAndRemove({ cId: inter.channel.id })
    inter.channel.send({
      embeds: [
        new MessageEmbed()
          .setColor('RED')
          .setDescription('此Ticket開票將在**5**秒內刪除。'),
      ],
    })
    setTimeout(() => inter.channel.delete(), 5000)
    return inter.deferUpdate()
  },
}
