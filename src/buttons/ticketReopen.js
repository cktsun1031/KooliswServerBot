const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js')
const ticketDB = require('../models/ticket')
const { allButtonDisable } = require('../function/ticketSystem')

module.exports = {
  id: 'ticket_reopen',
  async run(inter) {
    if (!inter.channel.name.startsWith('ticket-')) return
    const tcdb = await ticketDB.findOne({ cId: inter.channelId })
    if (!tcdb) return allButtonDisable(inter, inter.message.id)
    if (tcdb.secErd === false) return inter.deferUpdate()
    const dsddsds = new MessageEmbed()
      .setColor('GREEN')
      .setDescription(
        `此支持開票Ticket已被 <@!${inter.member.user.id}> 重新開啟。`,
      )
    const messageAwDel = await inter.channel.messages
      .fetch(tcdb.seId)
      .catch(() => null)
    if (messageAwDel) messageAwDel.delete()
    inter.channel.send({ embeds: [dsddsds] })
    tcdb.topc = false
    tcdb.secErd = false
    await tcdb.save().catch(() => null)
    const interactionDelete = new MessageButton()
      .setStyle('SECONDARY')
      .setLabel('⛔')
      .setCustomId('panel_press_lockto')
      .setDisabled(false)
    const messageAwEdit = await inter.channel.messages
      .fetch(tcdb.tpId)
      .catch(() => null)
    if (messageAwEdit) {
      messageAwEdit.edit({
        components: [new MessageActionRow().addComponents(interactionDelete)],
      })
    }
    return inter.channel.permissionOverwrites.edit(tcdb.uId, {
      SEND_MESSAGES: true,
      ADD_REACTIONS: true,
    })
  },
}
