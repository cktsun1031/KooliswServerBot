const { MessageEmbed } = require('discord.js')
const { ensureDB } = require('../../function/levelSystem')
const { msgMathRate, prefix, emojis } = require('../../config.json')

module.exports = {
  name: 'rankinfo',
  desc: '獲取或請求計算現時定下的所有等級訊息數量要求',
  usage: 'k!rankinfo [等級數字(可選)]',
  dmAllowed: true,
  run: async ({ msg, args }) => {
    const lvlreq = args[0]
    const embed = new MessageEmbed()
    if (lvlreq) {
      if (isNaN(lvlreq)) {
        embed
          .setTitle(`${emojis.cross} 請輸入正確數字`)
          .setDescription(`請使用正確方式: \`\`\`${module.exports.usage}\`\`\``)
        return msg.reply({ embeds: [embed] })
      }
      if (lvlreq <= 0) {
        embed
          .setTitle(`${emojis.cross} 請求等級數字過小!`)
          .setDescription(`請使用正確方式: \`\`\`${module.exports.usage}\`\`\``)
        return msg.reply({ embeds: [embed] })
      }
      const { totalMsg } = await ensureDB(msg.guild.id, msg.author.id)
      const requestLvMN = Math.round((lvlreq / msgMathRate) ** 2)
      let content = `等級${lvlreq}: 你需要 \`${requestLvMN}\` 條信息`
      if (requestLvMN - totalMsg > 0) {
        content += ` (需要更多傳送 \`${requestLvMN - totalMsg}\` 條訊息)`
      }
      embed.setTitle('等級資料 Level Information').setDescription(content)
      return msg.reply({ embeds: [embed] })
    }
    let content = ''
    for (let index = 0; index < 15; index++) {
      if (index > 0 || index < 14) content += '\n'
      content += `等級${index + 1}: \`${Math.round(
        ((index + 1) / msgMathRate) ** 2,
      )}\`條信息`
    }
    embed
      .setTitle('等級資料 Level Information')
      .setDescription(
        `${content}\n\n如此類推, 如果想查詢更高級別, 請使用指令 \`${prefix}${module.exports.name} <等級數字>\``,
      )
    return msg.reply({ embeds: [embed] })
  },
}
