const { MessageEmbed } = require('discord.js')

module.exports = {
  name: 'uptime',
  description: '檢查機器人的正常運行時間 Check Bot Uptime Duration!',
  type: 1,
  async run({ inter }) {
    let seconds = Math.trunc((inter.client.uptime / 1000) % 60)
    let minutes = Math.trunc((inter.client.uptime / (1000 * 60)) % 60)
    let hours = Math.trunc((inter.client.uptime / (1000 * 60 * 60)) % 24)
    let days = Math.trunc(inter.client.uptime / (1000 * 60 * 60 * 24))
    days = days < 10 ? `${days}` : days
    hours = hours < 10 ? `${hours}` : hours
    minutes = minutes < 10 ? `0${minutes}` : minutes
    seconds = seconds < 10 ? `0${seconds}` : seconds
    return inter.reply({
      embeds: [
        new MessageEmbed().setDescription(
          `運行時間: \`${days}天 ${hours}小時 ${minutes}分鐘 ${seconds}秒\``,
        ),
      ],
    })
  },
}
