const { MessageButton, MessageActionRow } = require('discord.js')

module.exports = {
  name: 'subscribe',
  dmAllowed: true,
  private: true,
  run: async ({ msg }) => {
    const button = new MessageButton()
      .setStyle('LINK')
      .setLabel('Subscribe to Koolisw!')
      .setURL('https://youtube.com/c/KooliswBrandon')
    return msg.reply({
      content: 'Press HERE!',
      components: [new MessageActionRow().addComponents(button)],
    })
  },
}
