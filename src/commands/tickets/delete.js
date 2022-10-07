const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js')
const ticketDB = require('../../models/ticket')

module.exports = {
  name: 'delete',
  desc: '刪除開票頻道',
  run: async ({ msg }) => {
    if (!msg.channel.name.startsWith('ticket-')) return
    const tcdb = await ticketDB.findOne({ cId: msg.channelId })
    if (tcdb) {
      const panelTopMessage = tcdb.tpId
      const secmsgid = tcdb.seId
      const interactionDelete = new MessageButton()
        .setStyle('SECONDARY')
        .setLabel('⛔')
        .setCustomId('panel_press_lockto')
        .setDisabled(true)
      const messageAwaitDisable = await msg.channel.messages
        .fetch(panelTopMessage)
        .catch(() => null)
      if (messageAwaitDisable) {
        messageAwaitDisable.edit({
          components: [new MessageActionRow().addComponents(interactionDelete)],
        })
      }
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
      const messageAwDis1 = await msg.channel.messages
        .fetch(secmsgid)
        .catch(() => null)
      if (messageAwDis1) {
        messageAwDis1.edit({
          components: [
            new MessageActionRow().addComponents(
              interaction1,
              interaction2,
              interaction3,
            ),
          ],
        })
      }
      await ticketDB.findOneAndRemove({ cId: msg.channelId })
    }
    msg.channel.send({
      embeds: [
        new MessageEmbed()
          .setColor('RED')
          .setDescription('此Ticket開票將在**5**秒內刪除。'),
      ],
    })
    await new Promise((res) => setTimeout(res, 5000))
    return msg.channel.delete()
  },
}
