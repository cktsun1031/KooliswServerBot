const { MessageEmbed } = require('discord.js')
const { cache } = require('../plugins/globalCache')
const { emojis } = require('../config.json')

module.exports = {
  name: 'help',
  description: '這是我所執行的所有命令的列表',
  options: [
    {
      name: 'command',
      description: '在此輸入你要查看的指令',
      required: false,
      type: 'STRING',
    },
  ],
  type: 1,
  run({ inter, args }) {
    if (!args[0]) {
      const content = cache.get('cmdHelpLC')
      return inter.reply({
        embeds: [
          new MessageEmbed()
            .setAuthor({
              name: `${inter.client.user.username}的協助清單`,
              iconURL: inter.client.user.displayAvatarURL(),
            })
            .setDescription(content)
            .setFooter({
              text: `© ${new Date().getFullYear()} 酷斯軍團 Koolisw Army`,
              iconURL: inter.guild.iconURL(),
            }),
        ],
      })
    }
    const cmd = inter.client.slashcommands.get(args[0])
      ?? inter.client.commands.get(args[0])
      ?? inter.client.commands.get(inter.client.aliases.get(args[0]))
      ?? null
    const embed = new MessageEmbed()
    if (!cmd || cmd.private) {
      embed.setColor('RED').setTitle(`${emojis.cross} 無法尋找指令或發生錯誤`)
      return inter.reply({ embeds: [embed], ephemeral: true })
    }
    let descOfCmd = `\n**說明:** \`${cmd.desc ?? 'N/A'}\`\n**類別:** \`${
      cmd.category
    }\``
    if (cmd.usage) descOfCmd += `\n**使用方法:** \`${cmd.usage}\``
    descOfCmd += `\n**冷卻時間:** \`${
      cmd.cooldown / 1000 || '1'
    }秒\`\n**全局允許使用:** \`${cmd.allChannelAccess ? '是' : '否'}\``
    embed.setTitle(`指令: ${cmd.name}`).setDescription(descOfCmd)
    return inter.reply({
      embeds: [embed],
    })
  },
}
