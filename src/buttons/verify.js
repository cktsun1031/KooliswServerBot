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
      content: '🔍正在載入驗證程序...',
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
          name: '驗證程序 Verify Program',
          iconURL: user.displayAvatarURL(),
        })
        .setColor('RED')
        .setDescription(
          `你好, **${user.username}**! 你的帳戶未符合自動驗證的基本要求, 你必須登入這個網站, 進行手動驗證。在此查詢[教程及常見問題](https://docs.koolisw.tk/discord-joinverify/advanced)或[教學影片](https://www.youtube.com/watch?v=0yX0umvRMzE)。\n\n**[點擊這裏 Click Here](https://bot.koolisw.tk/verify)**\n\n**必須使用你的Discord帳戶登入，我們只收集您的__電子郵件__，不會存取敏感個人資訊如__IP地址和設備資訊__。**`,
        )
      const resultbracket = user.createdTimestamp < Date.now() - 2_592_000_000
        ? (user.avatarURL()
          ? 'N/A'
          : '可疑用戶-未設定帳戶圖標')
        : '帳戶創建日期未達要求'
      const embedLog = new MessageEmbed()
        .setTitle(`按鈕點擊: ${user.username}#${user.discriminator}`)
        .setThumbnail(
          user.displayAvatarURL({
            size: 4096,
          }),
        )
        .setDescription(
          `<@!${user.id}>\n結果: \`需進行手動驗證 (${resultbracket})\`\nID: \`${
            user.id
          }\`\n加入日期: \`${transferTimeToChinese(
            member.joinedAt,
          )}\`\n帳戶創建日期: \`${transferTimeToChinese(user.createdAt)}\``,
        )
      inter.client.channels.cache.get('852551177560260648').send({
        embeds: [embedLog],
      })
      const button = new MessageButton()
        .setStyle('LINK')
        .setLabel('點擊這裏 Click Here')
        .setURL('https://bot.koolisw.tk/verify')
      return inter.editReply({
        content: null,
        embeds: [embed],
        components: [new MessageActionRow().addComponents(button)],
      })
    }
    embed
      .setTitle(`按鈕點擊: ${user.username}#${user.discriminator}`)
      .setThumbnail(
        user.displayAvatarURL({
          size: 4096,
        }),
      )
      .setDescription(
        `<@!${user.id}>\n結果: \`自動驗證通過，成為成員\`\nID: \`${
          user.id
        }\`\n加入日期: \`${transferTimeToChinese(
          member.joinedAt,
        )}\`\n帳戶創建日期: \`${transferTimeToChinese(user.createdAt)}\``,
      )
    inter.editReply({
      content: undefined,
      embeds: [
        new MessageEmbed()
          .setTitle('👍驗證成功，非常感謝你的配合')
          .setDescription(
            '將會在數秒後自動給予身份組。你現在就可以瀏覽其他頻道了，以及可以參加群組抽獎或遊戲活動等。',
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
