const { MessageEmbed } = require('discord.js')
const Lvl = require('../../models/level')

module.exports = {
  name: 'rankapi',
  desc: '獲取你實時等級訊息資料API',
  usage: 'k!rankapi',
  cooldown: 1000 * 5,
  run: async ({ msg, args }) => {
    const userid = args[0] && args[0].length >= 18 ? args[0] : msg.member.id
    const databaseUser = await Lvl.findOne({
      userId: userid,
      guildId: '687219262406131714',
    })
    return msg.reply({
      embeds: [
        new MessageEmbed().setDescription(`\`\`\`${databaseUser}\`\`\``),
      ],
    })
  },
}
