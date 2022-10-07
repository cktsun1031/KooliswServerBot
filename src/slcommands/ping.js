const { MessageEmbed } = require('discord.js')

module.exports = {
  name: 'ping',
  description: '查看機器人的網絡動作延遲等狀態',
  type: 1,
  async run({ inter }) {
    return inter.reply({
      embeds: [
        new MessageEmbed().setDescription(
          `動作延遲: \`${
            Date.now() - inter.createdTimestamp
          }ms\`\nAPI延遲: \`${Math.round(inter.client.ws.ping)}ms\``,
        ),
      ],
    })
  },
}
