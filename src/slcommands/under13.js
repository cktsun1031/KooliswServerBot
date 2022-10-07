const { MessageEmbed } = require('discord.js')
const u13PendingDB = require('../models/under13Pending')
const { under13Log } = require('../function/jobs')
const { tfcA } = require('../function/tool')

module.exports = {
  name: 'under13',
  description: 'Action to under 13 user!',
  options: [
    {
      name: 'type',
      description: 'Type',
      required: true,
      type: 'STRING',
      choices: [
        {
          name: 'Notify',
          value: 'notify',
        },
        {
          name: 'Proofed Add',
          value: 'proofedAdd',
        },
        {
          name: 'Proofed Remove',
          value: 'proofedRemove',
        },
        { name: 'Check Status', value: 'statusCheck' },
        { name: 'Take Action', value: 'takeAction' },
      ],
    },
    {
      name: 'user',
      description: 'Tag user who is under13',
      required: true,
      type: 'USER',
    },
  ],
  defaultPermission: true,
  type: 1,
  async run({ inter, args }) {
    const { client } = inter
    if (!inter.member.roles.cache.has('724999998479007847')) {
      return inter.reply({
        content: `<@!${inter.member.user.id}>, missing perms`,
        ephemeral: true,
      })
    }
    switch (args[0]) {
      case 'notify': {
        if (inter.channelId !== '784073537174372412') {
          return inter.reply({
            content: `<@!${inter.member.user.id}>, 你只能夠在<#784073537174372412> 運行這個指令`,
            ephemeral: true,
          })
        }
        const member = inter.guild.members.cache.get(args[1])
        if (member.user.bot || member.roles.cache.has('881551711913795584')) {
          return inter.reply({
            content: '所提及的用戶年齡已核實',
            ephemeral: true,
          })
        }
        const userdb = await u13PendingDB.findOne({
          UserId: args[1].toString(),
        })
        if (userdb) {
          return inter.reply({
            content: '用戶已經被通知和列入紀錄內, 無須在此通知!',
            ephemeral: true,
          })
        }
        const user = await client.users.fetch(args[1])
        const endTimeMs = Date.now() + 172_800_000
        await inter.reply({
          content: `<@!${
            args[1]
          }>\n\n由於本群管理層團隊在你的身上的資料或證據發現你的年齡是低於13歲。根據Discord服務條款，低於13歲以下的用戶是不容許使用Discord。\n假如你是13歲或以上，煩請證明相關的證明，包括使用的實質證明。\n\n若你未能於 **${tfcA(
            endTimeMs,
          )}** 提交相關證明，本群組將會採取行動，謝謝。\n\n提供相關證明，請私訊 <@!${
            inter.member.user.id
          }> 或其他管理層人員，並會保障你的私隱，不會盜取或者窺視你的個人資料。\n詳細證明方法與說明: https://discord.com/channels/687219262406131714/784073537174372412/889899695000928357`,
        })
        user
          .send({
            content: `由於本群管理層團隊在你的身上的資料或證據發現你的年齡是低於13歲。根據Discord服務條款，低於13歲以下的用戶是不容許使用Discord。\n若果你是13歲或以上，煩請證明相關的證明，包括使用的實質證明。\n\n若你未能於 **${tfcA(
              endTimeMs,
            )}** 提交相關證明，本群組將會採取行動，謝謝。\n\n若可提供證明，請私訊 <@!${
              inter.member.user.id
            }> 或其他管理層人員，並會保障你的私隱，不會盜取或者窺視你的個人資料。\n詳細證明方法與說明: https://discord.com/channels/687219262406131714/784073537174372412/889899695000928357`,
          })
          .catch(() => null)
        const replied = await inter.fetchReply()
        await new u13PendingDB({
          UserId: args[1].toString(),
          Tag: member.user.tag,
          Avatar: member.user.displayAvatarURL(),
          Timing: {
            rd: Date.now(),
            et: endTimeMs,
          },
          Link: replied.url,
        }).save()
        return under13Log({
          client,
          type: 'notify',
          avatarUrl: member.user.displayAvatarURL(),
          tag: member.user.tag,
          message: tfcA(endTimeMs),
          id: member.user.id,
          link: replied.url,
        })
      }
      case 'takeAction': {
        const member = inter.guild.members.cache.get(args[1])
        if (member.roles.cache.has('881551711913795584')) {
          return inter.reply({
            content: '無法採取行動, 這個用戶已經驗證年齡!',
          })
        }
        const userdb = await u13PendingDB.findOne({
          UserId: args[1],
        })
        if (!userdb) {
          return inter.reply({
            content: '無法採取行動, 無法尋找通知該用戶的相關紀錄!',
          })
        }
        if (userdb.Timing.et > Date.now()) {
          return inter.reply({
            content: '無法採取行動, 未夠截止時間和日期!',
          })
        }
        if (!member.bannable) return
        await member.send({
          content: `你好 **${member.username}**! 由於本群管理層團隊在你的身上的資料或者證據發現你的年齡是低於13歲。根據Discord服務條款，低於13歲以下的用戶是不容許使用Discord。本群在兩日前已通知你進行年齡驗證，驗證期限已逾時。本群務必現在採取行動，並且擔當起執行官方服務條款的責任。\n\n如果你想上訴結果，請填妥這個表格，並等待核實結果。\nhttps://forms.gle/wvQhhpBhCF93nkPH6\n任何虛假或惡作劇行為，會被永久終止其上訴資格。`,
        })
        member.ban({ reason: 'Under 13 採取行動' })
        return inter.reply({
          embeds: [
            new MessageEmbed().setDescription(
              `<:tick:846643019197448234> ***由於 ${member.user.tag} 未能及時提供達標年齡證據, 因此以採取行動!***`,
            ),
          ],
        })
      }
      case 'statusCheck': {
        const member = inter.guild.members.cache.get(args[1])
        if (member.roles.cache.has('881551711913795584')) {
          return inter.reply({
            content: '這個用戶年齡已驗證, 沒有任何問題!',
          })
        }
        const userdb = await u13PendingDB.findOne({
          UserId: args[1],
        })
        if (!userdb) {
          return inter.reply({
            content: '這個用戶十分清爽, 沒有任何問題!',
          })
        }
        return inter.reply({
          content: `這個用戶正在處於等待驗證階段, 結束日期: ${tfcA(
            Number(userdb.Timing.et),
          )}`,
        })
      }
      case 'proofedRemove': {
        const member = inter.guild.members.cache.get(args[1])
        member.roles.remove('881551711913795584')
        under13Log({
          client,
          type: 'proofedRemove',
          avatarUrl: member.user.displayAvatarURL(),
          tag: member.user.tag,
          id: member.user.id,
        })
        return inter.reply({
          content: `成功! 已移除 **${member.user.tag}** 來自年齡已核實組別!`,
        })
      }
      case 'proofedAdd': {
        const member = inter.guild.members.cache.get(args[1])
        const userdb = await u13PendingDB.findOne({
          UserId: args[1],
        })
        if (userdb) {
          await u13PendingDB.findOneAndRemove({
            UserId: args[1],
          })
        }
        under13Log({
          client,
          type: 'proofed',
          avatarUrl: member.user.displayAvatarURL(),
          tag: member.user.tag,
          id: member.user.id,
        })
        member.roles.add('881551711913795584')
        return inter.reply({
          content: `成功! 已添加 **${member.user.tag}** 至年齡已核實組別!`,
        })
      }
      default:
    }
  },
}
