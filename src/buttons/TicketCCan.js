const { MessageButton, MessageActionRow } = require('discord.js')
const ticketDB = require('../models/ticket')
const { allButtonDisable } = require('../function/ticketSystem')

module.exports = {
  id: 'panel_cancel_action',
  async run(inter) {
    if (!inter.channel.name.startsWith('ticket-')) return
    const tcdb = await ticketDB.findOne({ cId: inter.channelId })
    if (!tcdb) return allButtonDisable(inter, inter.message.id)
    if (tcdb.topc !== true) return inter.deferUpdate()
    const interDelete = new MessageButton()
      .setStyle('SECONDARY')
      .setLabel('⛔')
      .setCustomId('panel_press_lockto')
    const messageAwEdit = await inter.channel.messages
      .fetch(tcdb.tpId)
      .catch(() => null)
    if (messageAwEdit) {
      messageAwEdit.edit({
        components: [new MessageActionRow().addComponents(interDelete)],
      })
    }
    tcdb.topc = false
    await tcdb.save().catch(() => null)
    return inter.deferUpdate()
  },
}
