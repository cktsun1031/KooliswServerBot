const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js')
const { customAlphabet } = require('nanoid')
const TDB = require('../models/ticket')
const { transferTimeToChinese } = require('../function/tool')
const { emojis } = require('../config.json')

module.exports = {
  id: 'press_create_ticket',
  cooldown: 30 * 60 * 1000,
  async run(inter) {
    if (inter.channel.id !== '763722350494613545') return
    await inter.reply({ content: '🔍現在正在獲取數據', ephemeral: true })
    const embed = new MessageEmbed()
    const { member, guild } = inter
    if (member.roles.cache.has('807080114419662848')) {
      embed
        .setTitle(`${emojis.cross} 抱歉，支援開票創建失敗`)
        .setDescription(
          '本群已將你列入支援開票黑名單，可能你先前濫用了這個服務或者使用這個服務時違反規則。如想繼續使用，請私自聯絡管理層人員。',
        )
        .setColor('RED')
      return inter.editReply({ content: null, embeds: [embed] })
    }
    const hCR = await TDB.findOne({ uId: member.user.id })
    if (hCR) {
      embed
        .setTitle(`${emojis.cross} 抱歉，支援開票創建失敗`)
        .setDescription(
          '由於你已經創建了至少一個支援開票，防止洗版及濫用，你無法創建超過一個支援開票頻道，並且緊記好好使用現有支援開票的服務。',
        )
        .setColor('RED')
      return inter.editReply({ content: null, embeds: [embed] })
    }
    const generatedId = customAlphabet(
      '1234567890qwertyuiopasdfghjklzxcvbnm',
      7,
    )()
    const channel = await guild.channels
      .create(`ticket-${generatedId}`, {
        permissionOverwrites: [
          {
            id: member.user.id,
            allow: [
              'SEND_MESSAGES',
              'VIEW_CHANNEL',
              'ATTACH_FILES',
              'EMBED_LINKS',
              'READ_MESSAGE_HISTORY',
              'USE_EXTERNAL_EMOJIS',
            ],
          },
          {
            id: guild.roles.everyone,
            allow: ['SEND_MESSAGES'],
            deny: [
              'VIEW_CHANNEL',
              'USE_PUBLIC_THREADS',
              'USE_PRIVATE_THREADS',
              'MANAGE_THREADS',
            ],
          },
          {
            id: '724999998479007847',
            allow: [
              'VIEW_CHANNEL',
              'SEND_MESSAGES',
              'ATTACH_FILES',
              'EMBED_LINKS',
              'READ_MESSAGE_HISTORY',
              'USE_EXTERNAL_EMOJIS',
            ],
          },
          {
            id: '710076828894887967',
            allow: [
              'VIEW_CHANNEL',
              'SEND_MESSAGES',
              'ATTACH_FILES',
              'EMBED_LINKS',
              'READ_MESSAGE_HISTORY',
              'USE_EXTERNAL_EMOJIS',
              'MANAGE_MESSAGES',
              'MANAGE_CHANNELS',
            ],
          },
        ],
        parent: '836621157725110372',
        rateLimitPerUser: 2,
        type: 'text',
        topic: `開票創建擁有者: ${
          member.user.tag
        }\n開票創建日期: ${transferTimeToChinese(Date.now())}`,
        reason: '用戶創建了一條開票頻道',
      })
      .catch(() => null)
    if (!channel) return
    embed
      .setDescription(
        '對於你的支援服務將很快獲得。\n管理層人員會在最快 **10分鐘 **內回覆你，請耐心等待。\n\n如果需要關閉這張開票頻道，請按⛔',
      )
      .setColor('00f8ff')
      .setFooter({ text: 'Koolisw群組官方支援服務', iconURL: guild.iconURL() })
      .setTimestamp()
    const interDelete = new MessageButton()
      .setStyle('SECONDARY')
      .setLabel('⛔')
      .setCustomId('panel_press_lockto')
    const panelTop = await inter.client.channels.cache.get(channel.id).send({
      content: `<@${member.user.id}> 你好! 歡迎使用這項服務!`,
      embeds: [embed],
      components: [new MessageActionRow().addComponents(interDelete)],
    })
    const ntd = new TDB({
      cId: channel.id,
      uId: member.user.id,
      topc: false,
      secErd: false,
      tpId: panelTop.id,
      seId: 0,
    })
    await ntd.save().catch(() => null)
    return inter.editReply({
      content: `已成功創建開票頻道, (代號: **${generatedId}** ):\n前往這個頻道 -> <#${channel.id}> 並快速讓管理員知道需要協助的問題`,
    })
  },
}
