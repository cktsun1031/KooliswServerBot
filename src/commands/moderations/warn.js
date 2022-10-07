const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js')
const { customAlphabet } = require('nanoid')
const Warn = require('../../models/warnings')
const { emojis } = require('../../config.json')

module.exports = {
  name: 'warn',
  desc: 'warn',
  usage: 'k!warn [用戶] [原因]',
  cooldown: 1000 * 30,
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
    const resn = args.slice(1).join(' ')
    if (!resn) return rejectA('缺少警告原因')
    embed.setTitle('請核實是否進行確定進行警告!').addFields(
      {
        name: '目標成員',
        value: `\`${userRes.user.tag}\``,
        inline: true,
      },
      {
        name: '懲處者',
        value: `\`${msg.author.tag}\``,
        inline: true,
      },
      {
        name: '原因',
        value: `\`\`\`${resn}\`\`\``,
        inline: false,
      },
    )
    const int1 = new MessageButton()
      .setStyle('SUCCESS')
      .setLabel('確定')
      .setCustomId('cmdWarnA')
    const int2 = new MessageButton()
      .setStyle('DANGER')
      .setLabel('取消')
      .setCustomId('cmdWarnD')
    const messageForW = await msg.channel.send({
      embeds: [embed],
      components: [new MessageActionRow().addComponents(int1, int2)],
    })
    const filter = (ii) => ['cmdWarnA', 'cmdWarnD'].includes(ii.customId)
      && ii.user.id === msg.author.id
    const cll = msg.channel.createMessageComponentCollector({
      filter,
      time: 30_000,
    })
    let status = false
    cll.on('collect', async (int) => {
      switch (int.customId) {
        case 'cmdWarnA': {
          if (status) return
          status = true
          const rIdL = []
          let index = 0
          while (index < 4) {
            const gId = customAlphabet(
              '1234567890qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM',
              6,
            )()
            rIdL.push(gId)
            index += 1
          }
          const gId = rIdL.join('-')
          const hadCurrentUsr = await Warn.findOne({
            userId: userRes.id,
          })
          if (hadCurrentUsr) {
            await Warn.findOneAndUpdate(
              {
                userId: userRes.id,
              },
              {
                $push: {
                  warnings: {
                    wId: gId,
                    wdBy: msg.author.id,
                    wdAt: Date.now(),
                    reason: resn,
                  },
                },
              },
            )
          } else {
            const newDB = new Warn({
              userId: userRes.id,
              warnings: [
                {
                  wId: gId,
                  wdBy: msg.author.id,
                  wdAt: Date.now(),
                  reason: resn,
                },
              ],
            })
            await newDB.save().catch(() => null)
          }
          const embed1 = new MessageEmbed()
            .setColor('GREEN')
            .setDescription(
              `${emojis.tick} 已警告 **${userRes.user.tag}**, **${resn}**`,
            )
          userRes.send(
            `你在 **${msg.guild.name}** 被警告, **${resn}**\n警告個案編號: \`${gId}\``,
          )
          return messageForW.edit({
            embeds: [embed1],
            components: [],
          })
        }
        case 'cmdWarnD': {
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
