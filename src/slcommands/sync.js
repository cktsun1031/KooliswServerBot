const { MessageEmbed } = require('discord.js')
const { getLinkedUser } = require('../function/roblox')
const {
  robloxRanksDiscord,
  shouldBeAddedToRole,
} = require('../config/matchRankRole.json')
const { noblox } = require('../robloxClient')

module.exports = {
  name: 'sync',
  description: '與ROBLOX群組同步Discord身份組和群組等級',
  type: 1,
  cooldown: 1000 * 60,
  async run({ inter }) {
    const embed = new MessageEmbed()
    let rank = 0
    const { member } = inter
    await inter.reply({
      content: `<@${member.user.id}>, 🔍現在正在獲取數據`,
    })
    let desc = '**身份組同步:**'
    let rolesInfo = ''
    for (let index = 0, l = shouldBeAddedToRole.length; index < l; index++) {
      if (!member.roles.cache.has(shouldBeAddedToRole[index][0])) continue
      if (!member.roles.cache.has(shouldBeAddedToRole[index][1])) {
        rolesInfo += `\n<@&${shouldBeAddedToRole[index][0]}> -> <@&${shouldBeAddedToRole[index][1]}>`
        member.roles.add(shouldBeAddedToRole[index][1])
      }
    }
    desc += `${
      rolesInfo !== '' ? rolesInfo : ' `無需同步`'
    }\n\n**ROBLOX群組等級:**.`
    const robloxUserid = await getLinkedUser(member.id, inter.guildId)
    if (robloxUserid) {
      for (let index = 0, l = robloxRanksDiscord.length; index < l; index++) {
        if (member.roles.cache.has(robloxRanksDiscord[index][0])) {
          rank = robloxRanksDiscord[index][1]
        }
      }
      let kooNumber = 0
      let dracNumber = 0
      const groups = await noblox.getGroups(robloxUserid)
      for (let index = 0, l = groups.length; index < l; index++) {
        if (groups[index].Id === 7_177_496) kooNumber += 1
        else if (groups[index].Id === 4_764_660) dracNumber += 1
        if (kooNumber === 1 && dracNumber === 1) break
      }
      if (kooNumber !== 0 || dracNumber !== 0) {
        desc += `\n帳戶: [點擊這裏](https://www.roblox.com/users/${robloxUserid}/profile)\n[酷斯軍團 Koolisw Army](https://www.roblox.com/groups/7177496/Koolisw-Army)`
        if (kooNumber === 1) {
          const rankId = await noblox.getRankInGroup(7_177_496, robloxUserid)
          if (rankId === rank || rankId > rank) {
            desc += '\n***無需更改群組等級***'
          } else {
            const result = await noblox.setRank(7_177_496, robloxUserid, rank)
            desc += `\n***已將你的等級同步至*** \`${result.name}\``
          }
        } else desc += '\n***未加入群組***'
        desc
          += '\n[Draconian Workshop](https://www.roblox.com/groups/4764660/Draconian-Workshop)'
        if (dracNumber === 1) {
          const rankId = await noblox.getRankInGroup(4_764_660, robloxUserid)
          if (rankId === rank || rankId > rank) {
            desc += '\n***無需更改群組等級***'
          } else {
            const result = await noblox.setRank(4_764_660, robloxUserid, rank)
            desc += `\n***已將你的等級同步至*** \`${result.name}\``
          }
        } else desc += '\n***未加入群組***'
      } else desc += '\n`未加入任何群組`'
    } else {
      desc
        += '\n`未找到連結ROBLOX帳戶`\n請使用其中一個的網站進行驗證: [BloxLink](https://blox.link/verification/687219262406131714) 或者 [RoVer](https://rover.link/login)'
    }
    embed.setTitle('😀 同步成功 Sync Succeed!').setDescription(desc)
    return inter.editReply({
      content: null,
      embeds: [embed],
    })
  },
}
