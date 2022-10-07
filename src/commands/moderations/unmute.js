const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js')
const Mute = require('../../models/mute')
const { emojis } = require('../../config.json')

module.exports = {
  name: 'unmute',
  desc: '解除靜音成員聊天權限功能',
  usage: 'k!unmute [用戶]',
  cooldown: 1000 * 20,
  intervalLimit: {
    hour: 15,
  },
  allChannelAccess: true,
  run: async ({ msg, args }) => {
    msg.delete()
    const embed = new MessageEmbed()
    let userRes = msg.mentions.members.first()
    if (!userRes) {
      try {
        userRes = args[0] && args[0].length >= 18
          ? await msg.guild.members.fetch(args[0]).catch(() => null)
          : null
      } catch {
        embed
          .setColor('RED')
          .setTitle(`${emojis.cross} 無法尋找用戶`)
          .setDescription(`請使用正確方式: \`${module.exports.usage}\``)
        return msg.channel.send({ embeds: [embed] })
      }
    }
    const rejectA = async (desc, usage = false) => {
      embed.setColor('RED').setTitle(`${emojis.cross} ${desc}`)
      if (usage) {
        embed.setDescription(
          `請使用正確方式: \`\`\`${module.exports.usage}\`\`\``,
        )
      }
      const messageAwaitDel = await msg.channel.send({ embeds: [embed] })
      return setTimeout(() => messageAwaitDel.delete(), 7500)
    }
    if (!msg.member.roles.cache.has('724999998479007847')) return rejectA('你不是管理團隊')
    if (!userRes) return rejectA('你必須提供目標成員', true)
    if (!msg.guild.members.cache.has(userRes.id)) return rejectA('這位用戶不是本群成員')
    if (userRes.id === msg.author.id) return rejectA('你不能對自己採取管理行動', true)
    const botPsRole = msg.guild.members.cache.get(msg.client.user.id).roles
      .highest.position
    const tgPsRole = userRes.roles.highest.position
    const myPsRole = msg.member.roles.highest.position
    if (tgPsRole >= botPsRole) return rejectA('機器人無法對此用戶採取管理行動')
    if (tgPsRole >= myPsRole) return rejectA('你無法對同級用戶採取管理行動')
    const muteRole = msg.guild.roles.cache.find((rl) => rl.name === 'Muted')
    if (!muteRole) return
    const muteUsrDB = await Mute.findOne({ uId: userRes.id })
    if (!userRes.roles.cache.has(muteRole.id) && !muteUsrDB) return rejectA('用戶未被靜音!')
    embed.setTitle('請核實是否進行確定解除靜音!').addFields({
      name: '目標成員',
      value: `\`${userRes.user.tag}\``,
      inline: true,
    })
    const int1 = new MessageButton()
      .setStyle('SUCCESS')
      .setLabel('確定')
      .setCustomId('cmdUnmuteA')
    const int2 = new MessageButton()
      .setStyle('DANGER')
      .setLabel('取消')
      .setCustomId('cmdUnmuteD')
    const messageForW = await msg.channel.send({
      embeds: [embed],
      components: [new MessageActionRow().addComponents(int1, int2)],
    })
    let status = false
    const filter = (ii) => ['cmdUnmuteA', 'cmdUnmuteD'].includes(ii.customId)
      && ii.user.id === msg.author.id
    const cll = msg.channel.createMessageComponentCollector({
      filter,
      time: 30_000,
    })
    cll.on('collect', async (int) => {
      switch (int.customId) {
        case 'cmdUnmuteA': {
          if (userRes.roles.cache.has(muteRole.id)) userRes.roles.remove(muteRole.id)
          if (muteUsrDB) {
            await Mute.findOneAndRemove({ uId: muteRole.id })
          }
          const embed1 = new MessageEmbed()
            .setColor('GREEN')
            .setDescription(`${emojis.tick} 已解除靜音 **${userRes.user.tag}**`)
          return messageForW.edit({ embeds: [embed1], components: [] })
        }
        case 'cmdUnmuteD': {
          if (status) return
          status = true
          return messageForW.delete()
        }
      }
    })
    cll.on('end', () => {
      if (!status) messageForW.delete()
    })
  },
}
