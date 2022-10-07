const { MessageEmbed } = require('discord.js')

module.exports = {
  name: 'uptime',
  desc: '查看機器人上線時間',
  dmAllowed: true,
  run: async ({ msg }) => {
    let seconds = Math.trunc((msg.client.uptime / 1000) % 60)
    let minutes = Math.trunc((msg.client.uptime / (1000 * 60)) % 60)
    let hours = Math.trunc((msg.client.uptime / (1000 * 60 * 60)) % 24)
    const days = Math.trunc(msg.client.uptime / (1000 * 60 * 60 * 24))
    hours = hours < 10 ? `${hours}` : hours
    minutes = minutes < 10 ? `0${minutes}` : minutes
    seconds = seconds < 10 ? `0${seconds}` : seconds
    return msg.reply({
      embeds: [
        new MessageEmbed().setDescription(
          `運行時間: \`${days}天 ${hours}小時 ${minutes}分鐘 ${seconds}秒\``,
        ),
      ],
    })
  },
}
