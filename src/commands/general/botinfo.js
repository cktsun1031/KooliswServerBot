const { MessageEmbed, version } = require('discord.js')
const pidusage = require('pidusage')
const { promisify } = require('util')
const fastFolderSize = require('fast-folder-size')
const { transferTimeToChinese } = require('../../function/tool')
const { prefix, botBuild } = require('../../config.json')
const Lvl = require('../../models/level')

const toDFS = (time) => {
  let seconds = Math.trunc((time / 1000) % 60)
  let minutes = Math.trunc((time / (1000 * 60)) % 60)
  let hours = Math.trunc(time / (1000 * 60 * 60))
  hours = hours < 10 ? `${hours}` : hours
  minutes = minutes < 10 ? `0${minutes}` : minutes
  seconds = seconds < 10 ? `0${seconds}` : seconds
  return `${hours}小時 ${minutes}分鐘 ${seconds}秒`
}

module.exports = {
  name: 'botinfo',
  desc: '機器人詳細狀況與資料',
  dmAllowed: true,
  run: async ({ msg }) => {
    const allUserDBLength = (await Lvl.find({ guildId: msg.guildId })).length
    const statsOS = await pidusage(process.pid)
    const fastFolderSizeAsync = promisify(fastFolderSize)
    const bytesDisk = await fastFolderSizeAsync('.')
    const embeed = new MessageEmbed()
      .setTitle('機器人資訊 Bot Information')
      .setDescription(
        `我是由「**酷斯軍團 Koolisw Army**」精心設計的機器人，完美度身訂造融合各位成員群組的所需及功能，功能甚多，功效速度也很快速。\n\n指令開首: \`${prefix}\`\n你可以使用附屬的任何指令, 輸入 \`${prefix}help\` 以獲得完整列表\n或使用 \`${prefix}help [指令]\` 查詢個別內容`,
      )
      .addFields(
        {
          name: '機器人版本',
          value: `\`v${botBuild}\``,
          inline: true,
        },
        {
          name: '創立日期',
          value: `\`${transferTimeToChinese(
            msg.client.user.createdAt,
            false,
          )}\``,
          inline: true,
        },
        {
          name: 'Discord框架版本',
          value: `\`v${version}\``,
          inline: true,
        },
        {
          name: 'Node版本',
          value: `\`${process.version}\``,
          inline: true,
        },
        {
          name: 'CPU使用率',
          value: `\`${Math.round(statsOS.cpu.toFixed(2))}%\``,
          inline: true,
        },
        {
          name: '已用記憶體',
          value: `\`${Math.round(statsOS.memory / (1024 * 1024))}MB\``,
          inline: true,
        },
        {
          name: '已用磁盤空間',
          value: `\`${Math.round(bytesDisk / (1024 * 1024))}MB\``,
          inline: true,
        },
        {
          name: '網絡延遲',
          value: `\`${Math.round(msg.client.ws.ping)}ms\``,
          inline: true,
        },
        {
          name: '數據庫',
          value: `\`${allUserDBLength}組用戶等級數據\``,
          inline: true,
        },
        {
          name: '運行時間',
          value: `\`${toDFS(msg.client.uptime)}\``,
          inline: true,
        },
      )
      .setFooter({
        text: `© ${new Date().getFullYear()} 酷斯軍團 Koolisw Army`,
        iconURL: msg.guild.iconURL(),
      })
    return msg.reply({ embeds: [embeed] })
  },
}
