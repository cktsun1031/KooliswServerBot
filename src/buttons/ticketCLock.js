const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js')
const ticketDB = require('../models/ticket')
const { allButtonDisable } = require('../function/ticketSystem')

module.exports = {
  id: 'panel_confirm_action',
  async run(inter) {
    if (!inter.channel.name.startsWith('ticket-')) return
    const tcdb = await ticketDB.findOne({ cId: inter.channelId })
    if (!tcdb) return allButtonDisable(inter, inter.message.id)
    if (tcdb.topc !== true) return inter.deferUpdate()
    const interDelete = new MessageButton()
      .setStyle('SECONDARY')
      .setLabel('β')
      .setCustomId('panel_press_lockto')
      .setDisabled(true)
    inter.deferUpdate()
    const messageAwEdit = await inter.channel.messages
      .fetch(tcdb.tpId)
      .catch(() => null)
    messageAwEdit.edit({
      components: [new MessageActionRow().addComponents(interDelete)],
    })
    const embedSecPanel = new MessageEmbed()
      .setColor('RED')
      .setDescription(
        'π° - δΏε­ζ―ζιη₯¨θ¨ζ―ε°θ©±η΄ι\nπ« - εͺι€ζ―ζιη₯¨\nπ - ιζ°ιεζ―ζιη₯¨',
      )
      .setFooter({ text: 'ζ§εΆζΏι’ Control Panel' })
    const dsddsds = new MessageEmbed()
      .setColor('YELLOW')
      .setDescription(`ζ­€ζ―ζιη₯¨Ticketε·²θ’« <@!${inter.member.user.id}> ιιγ`)
    const interaction1 = new MessageButton()
      .setStyle('SECONDARY')
      .setLabel('π°')
      .setCustomId('save_transcript')
    const interaction2 = new MessageButton()
      .setStyle('DANGER')
      .setLabel('π«')
      .setCustomId('delete_ticket')
    const interaction3 = new MessageButton()
      .setStyle('SECONDARY')
      .setLabel('π')
      .setCustomId('ticket_reopen')
    inter.channel.send({ embeds: [dsddsds] })
    const panelSecId = await inter.channel.send({
      embeds: [embedSecPanel],
      components: [
        new MessageActionRow().addComponents(
          interaction1,
          interaction2,
          interaction3,
        ),
      ],
    })
    tcdb.seId = panelSecId.id
    tcdb.secErd = true
    await tcdb.save().catch(() => null)
    return inter.channel.permissionOverwrites.edit(tcdb.uId, {
      SEND_MESSAGES: false,
      ADD_REACTIONS: false,
    })
  },
}
