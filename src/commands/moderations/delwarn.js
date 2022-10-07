const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js')
const Warn = require('../../models/warnings')
const { tfEn } = require('../../function/tool')
const { emojis } = require('../../config.json')

module.exports = {
  name: 'delwarn',
  desc: 'delwarn',
  usage: 'k!warn [用戶] [原因]',
  cooldown: 1000 * 25,
  intervalLimit: {
    hour: 15,
  },
  allChannelAccess: true,
  run: async ({ msg, args }) => {
    msg.delete()
    const embed = new MessageEmbed()
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
    if (!msg.member.roles.cache.has('724999998479007847')) {
      return rejectA('你不是管理團隊')
    }
    const fdDatabase = await Warn.findOne({ 'warnings.wId': args[0] })
    if (!fdDatabase) return rejectA('無法尋找此紀錄')
    const warng = fdDatabase.warnings
    const warnFound = warng.find((ob) => ob.wId === args[0])
    if (fdDatabase.userId === msg.author.id) {
      return rejectA('你不能對自己採取管理行動', true)
    }
    const userPun = await msg.guild.members
      .fetch(warnFound.wdBy)
      .catch(() => null)
    const userPund = await msg.guild.members
      .fetch(fdDatabase.userId)
      .catch(() => null)
    const botPsRole = msg.guild.members.cache.get(msg.client.user.id).roles
      .highest.position
    const tgPsRole = userPund.roles.highest.position
    const myPsRole = msg.member.roles.highest.position
    const punPsRole = userPund.roles.highest.position
    if (tgPsRole >= botPsRole) return rejectA('機器人無法對此用戶採取管理行動')
    if (tgPsRole >= myPsRole) return rejectA('你無法對同級用戶採取管理行動')
    if (punPsRole > myPsRole) {
      return rejectA('你不能取消來自上級管理層給予的警告')
    }
    embed.setTitle('請核實是否進行確定進行警告刪除!').addFields(
      {
        name: '目標成員',
        value: `\`${userPund?.user.tag ?? fdDatabase.userId}\``,
        inline: true,
      },
      {
        name: '懲處者',
        value: `\`${userPun?.user.tag ?? warnFound.wdBy}\``,
        inline: true,
      },
      {
        name: '個案編號',
        value: `\`\`\`${warnFound.wId}\`\`\``,
        inline: false,
      },
      {
        name: '日期',
        value: `\`\`\`${tfEn(warnFound.wdAt)}\`\`\``,
        inline: false,
      },
      {
        name: '原因',
        value: `\`\`\`${warnFound.reason}\`\`\``,
        inline: false,
      },
    )
    const int1 = new MessageButton()
      .setStyle('SUCCESS')
      .setLabel('確定')
      .setCustomId('cmdWarnCA')
    const int2 = new MessageButton()
      .setStyle('DANGER')
      .setLabel('取消')
      .setCustomId('cmdWarnCD')
    const messageForW = await msg.channel.send({
      embeds: [embed],
      components: [new MessageActionRow().addComponents(int1, int2)],
    })
    const filter = (ii) => ['cmdWarnCA', 'cmdWarnCD'].includes(ii.customId)
      && ii.user.id === msg.author.id
    const cll = msg.channel.createMessageComponentCollector({
      filter,
      time: 30_000,
    })
    let status = false
    cll.on('collect', async (int) => {
      switch (int.customId) {
        case 'cmdWarnCA': {
          if (status) return
          status = true
          await (warng.length > 1
            ? Warn.findOneAndUpdate(
              {
                userId: fdDatabase.userId,
              },
              {
                $pull: {
                  warnings: {
                    wId: warnFound.wId,
                  },
                },
              },
            )
            : Warn.findOneAndRemove({
              userId: fdDatabase.userId,
            }))
          const embed1 = new MessageEmbed()
            .setColor('GREEN')
            .setDescription(`${emojis.tick} 已刪除警告 \`${warnFound.wId}\``)
          return messageForW.edit({
            embeds: [embed1],
            components: [],
          })
        }
        case 'cmdWarnCD': {
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
