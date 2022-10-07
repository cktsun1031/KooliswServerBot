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
      .setLabel('⛔')
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
        '📰 - 保存支持開票訊息對話紀錄\n🚫 - 刪除支持開票\n🔓 - 重新開啟支持開票',
      )
      .setFooter({ text: '控制板面 Control Panel' })
    const dsddsds = new MessageEmbed()
      .setColor('YELLOW')
      .setDescription(`此支持開票Ticket已被 <@!${inter.member.user.id}> 關閉。`)
    const interaction1 = new MessageButton()
      .setStyle('SECONDARY')
      .setLabel('📰')
      .setCustomId('save_transcript')
    const interaction2 = new MessageButton()
      .setStyle('DANGER')
      .setLabel('🚫')
      .setCustomId('delete_ticket')
    const interaction3 = new MessageButton()
      .setStyle('SECONDARY')
      .setLabel('🔓')
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
