const { MessageEmbed } = require('discord.js')

module.exports = {
  name: 'ping',
  desc: '查看機器人網絡延遲',
  dmAllowed: true,
  run: async ({ msg }) => msg.reply({
    embeds: [
      new MessageEmbed().setDescription(
        `動作延遲: \`${
          Date.now() - msg.createdTimestamp
        }ms\`\nAPI延遲: \`${Math.round(msg.client.ws.ping)}ms\``,
      ),
    ],
  }),
}
