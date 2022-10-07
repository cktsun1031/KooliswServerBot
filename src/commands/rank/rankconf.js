const { MessageEmbed } = require('discord.js')
const { createOrGetUser } = require('../../function/rankingsys')

module.exports = {
  name: 'rankconf',
  desc: '在此配置個人等級系統設定',
  usage: 'k!rankconf [設定名稱] [設定參數]',
  private: true,
  run: async ({ msg, args }) => {
    switch (args[0]) {
      case 'upgradeNotify': {
        if (!args[1] || !['true', 'false'].includes(args[1].toLowerCase())) {
          return msg.reply({
            embeds: [
              new MessageEmbed()
                .setTitle('請輸入正確配置名稱: **upgradeNotify**')
                .setDescription('使用方法: `k!upgradeNotify [true|false]`'),
            ],
          })
        }
        const userDB = await createOrGetUser(msg.author.id, msg.guildId)
        const isTrueSet = args[1] === 'true'
        if (isTrueSet === userDB.levelUpNotify) {
          return msg.reply({
            embeds: [
              new MessageEmbed()
                .setTitle('無需更改設置: **upgradeNotify**')
                .setDescription(`已設定為: \`${userDB.levelUpNotify}\``),
            ],
          })
        }
        userDB.levelUpNotify = isTrueSet
        await userDB.save().catch(() => {})
        return msg.reply({
          embeds: [
            new MessageEmbed()
              .setTitle('已更改設置: **upgradeNotify**')
              .setDescription(`設定為: \`${isTrueSet}\``),
          ],
        })
      }
      default: {
        const userDB = await createOrGetUser(msg.author.id, msg.guildId)
        const statusNotifyWUp = userDB.levelUpNotify ? '已啟動' : '已關閉'
        const disabled = userDB.disabled ? '是' : '不適用'
        return msg.reply({
          embeds: [
            new MessageEmbed()
              .setTitle('請輸入正確配置名稱')
              .setDescription(
                `**使用方法:** \`${module.exports.usage}\`\n**可用配置:**\n\`upgdeNotify\`: 升級等級時的私人訊息通知\n\n**配置:**\n升級訊息通知: \`${statusNotifyWUp}\`\n強制禁用: \`${disabled}\``,
              ),
          ],
        })
      }
    }
  },
}
