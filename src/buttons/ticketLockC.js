const { MessageButton, MessageActionRow } = require('discord.js')
const ticketDB = require('../models/ticket')
const { allButtonDisable } = require('../function/ticketSystem')

module.exports = {
  id: 'panel_press_lockto',
  async run(inter) {
    if (!inter.channel.name.startsWith('ticket-')) return
    const tcdb = await ticketDB.findOne({ cId: inter.channelId })
    if (!tcdb) return allButtonDisable(inter)
    const panelTopMessage = tcdb.tpId
    if (panelTopMessage !== inter.message.id || tcdb.topc === true) {
      return inter.deferUpdate()
    }
    const accept = new MessageButton()
      .setStyle('SECONDARY')
      .setLabel('✅')
      .setCustomId('panel_confirm_action')
    const cancel = new MessageButton()
      .setStyle('SECONDARY')
      .setLabel('❎')
      .setCustomId('panel_cancel_action')
    const fetchedMessage = await inter.channel.messages
      .fetch(panelTopMessage)
      .catch(() => null)
    if (fetchedMessage) {
      fetchedMessage.edit({
        components: [new MessageActionRow().addComponents(accept, cancel)],
      })
    }
    tcdb.topc = true
    await tcdb.save().catch(() => null)
    return inter.deferUpdate()
  },
}
