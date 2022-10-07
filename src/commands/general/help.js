const { MessageEmbed } = require('discord.js')
const { cache } = require('../../plugins/globalCache')
const { emojis } = require('../../config.json')

module.exports = {
  name: 'help',
  desc: '查看機器人可用指令的列表',
  usage: 'k!help [指令(可選)]',
  dmAllowed: true,
  run: async ({ msg, args }) => {
    if (!args[0]) {
      const content = cache.get('cmdHelpLC')
      return msg.reply({
        embeds: [
          new MessageEmbed()
            .setAuthor({
              name: `${msg.client.user.username}的指令協助&清單`,
              iconURL: msg.client.user.displayAvatarURL(),
            })
            .setDescription(content)
            .setFooter({
              text: `© ${new Date().getFullYear()} 酷斯軍團 Koolisw Army`,
              iconURL: msg.guild.iconURL(),
            }),
        ],
      })
    }
    const cmd = msg.client.commands.get(args[0])
      ?? msg.client.commands.get(msg.client.aliases.get(args[0]))
      ?? undefined
    const embed = new MessageEmbed()
    if (!cmd || cmd.private) {
      embed
        .setColor('RED')
        .setTitle(`${emojis.cross} 無法尋找指令或發生錯誤`)
        .setDescription(`請使用正確方式: \`${module.exports.usage}\``)
      return msg.reply({ embeds: [embed] })
    }
    embed.setTitle(`指令: ${cmd.name}`).addFields(
      {
        name: '說明',
        value: cmd.desc ?? 'N/A',
        inline: true,
      },
      {
        name: '類別',
        value: cmd.category,
        inline: true,
      },
      {
        name: '冷卻時間',
        value: `${cmd.cooldown / 1000 || '1'}秒`,
        inline: false,
      },
      {
        name: '全局允許使用',
        value: cmd.allChannelAccess ? '是' : '否',
        inline: false,
      },
      {
        name: '使用方法',
        value: `\`\`\`${cmd.usage ?? `k!${cmd.name}`}\`\`\``,
        inline: false,
      },
    )
    return msg.reply({
      embeds: [embed],
    })
  },
}
