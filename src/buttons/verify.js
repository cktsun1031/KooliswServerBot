const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js')
const { updateRankBothGroup } = require('../function/roblox')
const { transferTimeToChinese } = require('../function/tool')
const VfDB = require('../models/verification')

module.exports = {
  id: 'verify_get_role',
  cooldown: 25_000,
  async run(inter) {
    const { member } = inter
    if (member.roles.cache.has('687220191121375236')) {
      return inter.deferUpdate()
    }
    await inter.reply({
      content: 'ðæ­£å¨è¼å¥é©è­ç¨åº...',
      ephemeral: true,
    })
    const { user } = member
    const embed = new MessageEmbed()
    const preUserDB = await VfDB.findOne({ uId: member.id })
    if (
      preUserDB
      || user.createdTimestamp > Date.now() - 2_592_000_000
      || !user.avatarURL()
    ) {
      if (!preUserDB) {
        await new VfDB({ uId: member.id }).save()
      }
      embed
        .setAuthor({
          name: 'é©è­ç¨åº Verify Program',
          iconURL: user.displayAvatarURL(),
        })
        .setColor('RED')
        .setDescription(
          `ä½ å¥½, **${user.username}**! ä½ çå¸³æ¶æªç¬¦åèªåé©è­çåºæ¬è¦æ±, ä½ å¿é ç»å¥éåç¶²ç«, é²è¡æåé©è­ãå¨æ­¤æ¥è©¢[æç¨åå¸¸è¦åé¡](https://docs.koolisw.tk/discord-joinverify/advanced)æ[æå­¸å½±ç](https://www.youtube.com/watch?v=0yX0umvRMzE)ã\n\n**[é»æéè£ Click Here](https://bot.koolisw.tk/verify)**\n\n**å¿é ä½¿ç¨ä½ çDiscordå¸³æ¶ç»å¥ï¼æååªæ¶éæ¨ç__é»å­éµä»¶__ï¼ä¸æå­åææåäººè³è¨å¦__IPå°ååè¨­åè³è¨__ã**`,
        )
      const resultbracket = user.createdTimestamp < Date.now() - 2_592_000_000
        ? (user.avatarURL()
          ? 'N/A'
          : 'å¯çç¨æ¶-æªè¨­å®å¸³æ¶åæ¨')
        : 'å¸³æ¶åµå»ºæ¥ææªéè¦æ±'
      const embedLog = new MessageEmbed()
        .setTitle(`æéé»æ: ${user.username}#${user.discriminator}`)
        .setThumbnail(
          user.displayAvatarURL({
            size: 4096,
          }),
        )
        .setDescription(
          `<@!${user.id}>\nçµæ: \`éé²è¡æåé©è­ (${resultbracket})\`\nID: \`${
            user.id
          }\`\nå å¥æ¥æ: \`${transferTimeToChinese(
            member.joinedAt,
          )}\`\nå¸³æ¶åµå»ºæ¥æ: \`${transferTimeToChinese(user.createdAt)}\``,
        )
      inter.client.channels.cache.get('852551177560260648').send({
        embeds: [embedLog],
      })
      const button = new MessageButton()
        .setStyle('LINK')
        .setLabel('é»æéè£ Click Here')
        .setURL('https://bot.koolisw.tk/verify')
      return inter.editReply({
        content: null,
        embeds: [embed],
        components: [new MessageActionRow().addComponents(button)],
      })
    }
    embed
      .setTitle(`æéé»æ: ${user.username}#${user.discriminator}`)
      .setThumbnail(
        user.displayAvatarURL({
          size: 4096,
        }),
      )
      .setDescription(
        `<@!${user.id}>\nçµæ: \`èªåé©è­ééï¼æçºæå¡\`\nID: \`${
          user.id
        }\`\nå å¥æ¥æ: \`${transferTimeToChinese(
          member.joinedAt,
        )}\`\nå¸³æ¶åµå»ºæ¥æ: \`${transferTimeToChinese(user.createdAt)}\``,
      )
    inter.editReply({
      content: undefined,
      embeds: [
        new MessageEmbed()
          .setTitle('ðé©è­æåï¼éå¸¸æè¬ä½ çéå')
          .setDescription(
            'å°æå¨æ¸ç§å¾èªåçµ¦äºèº«ä»½çµãä½ ç¾å¨å°±å¯ä»¥çè¦½å¶ä»é »éäºï¼ä»¥åå¯ä»¥åå ç¾¤çµæ½çæéæ²æ´»åç­ã',
          )
          .setColor('GREEN'),
      ],
    })
    updateRankBothGroup(member.id, inter.guildId)
    inter.client.channels.cache.get('852551177560260648').send({
      embeds: [embed],
    })
    await new Promise((rs) => setTimeout(rs, 3500))
    return member.roles.add('687220191121375236').catch(() => {})
  },
}
