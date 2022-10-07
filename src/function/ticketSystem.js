const { MessageButton, MessageActionRow, MessageEmbed } = require('discord.js')
const { emojis } = require('../config.json')

async function allButtonDisable(itr, mId) {
  const message = await itr.channel.messages.fetch(mId).catch(() => null)
  if (!message) return
  const { embeds } = message
  if (embeds[0].footer.text.includes('Koolisw群組官方支援服務')) {
    const intDel = new MessageButton()
      .setStyle('SECONDARY')
      .setLabel('⛔')
      .setCustomId('panel_press_lockto')
      .setDisabled(true)
    await message.edit({
      components: [new MessageActionRow().addComponents(intDel)],
    })
  } else if (message.embeds[0].footer.text.includes('控制板面')) {
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
    await message.edit({
      components: [
        new MessageActionRow().addComponents(
          interaction1,
          interaction2,
          interaction3,
        ),
      ],
    })
  }
  return itr.reply({
    embeds: [
      new MessageEmbed()
        .setTitle(`${emojis.cross} 無法找到此頻道的數據回應`)
        .setDescription(
          '請使用以下指令手動操作:\n`k!delete` - 刪除開票\n`k!transcript` - 保存支持開票訊息對話紀錄',
        ),
    ],
  })
}

module.exports = {
  allButtonDisable,
}
