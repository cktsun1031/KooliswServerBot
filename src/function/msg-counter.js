const { Collection, MessageButton, MessageActionRow } = require('discord.js')
const { createOrGetUser, solveMsgUsr } = require('./rankingsys')
const { rankLeveling } = require('../config/blocked_channel.json')
const { rankRoles, activerole, prefixes } = require('../config/levels.json')

const cdAS = new Collection()
const spamc = async (message) => {
  const { content, author, stickers } = message
  if (stickers.size > 0) return 'F'
  if (!isNaN(content)) {
    const key = `ncd_${author.id}`
    if (cdAS.has(key)) return 'F'
    cdAS.set(key, true)
    setTimeout(() => cdAS.delete(key), 1000 * 4)
  }
  if (content.length <= 4) {
    const key = `wcd_${author.id}`
    if (cdAS.has(key)) return 'F'
    cdAS.set(key, true)
    setTimeout(() => cdAS.delete(key), 1000 * 4)
  }
  const re = /%CC%/
  if (re.test(encodeURIComponent(content))) return 'F'
  for (let index = 0, l = prefixes.length; index < l; index++) {
    if (content.toLowerCase().startsWith(prefixes[index])) return 'F'
  }
  return 'PS'
}

module.exports = async (message) => {
  const {
    author, guildId, client, member, channelId,
  } = message
  if (
    guildId !== '687219262406131714'
    || rankLeveling.includes(channelId)
    || !member.roles.cache.has('687220191121375236')
  ) return
  const { cooldown } = client
  const cooldownKey = `CHAT_${author.id}`
  const userDB = await createOrGetUser(author.id, guildId)
  let { level } = userDB;
  (async () => {
    if (userDB.disabled || cooldown.has(cooldownKey)) return
    cooldown.set(cooldownKey, true)
    const asp = await spamc(message)
    setTimeout(() => cooldown.delete(cooldownKey), 750)
    if (asp !== 'PS') return
    const resultOfPs = await solveMsgUsr(author.id, guildId)
    if (resultOfPs[1] === 'LP') {
      const [resData] = resultOfPs
      level = resData.level
      if (resData.levelUpNotify) {
        const messageAwaitAsk = await author
          .send({
            content: `恭喜你! 你剛剛已升級到 **等級 ${resData.level}** 了, 繼續保持活躍和保持聊天!`,
          })
          .catch(() => null)
        if (messageAwaitAsk && resData.levelUpNotify?.first) {
          const interaction1 = new MessageButton()
            .setStyle('SUCCESS')
            .setLabel('繼續')
            .setEmoji('👍')
            .setCustomId('acceptUpgradeNotify')
          const interaction2 = new MessageButton()
            .setStyle('DANGER')
            .setLabel('拒絕接收')
            .setEmoji('👎')
            .setCustomId('deniedUpgradeNotify')
          userDB.levelUpNotify = true
          await userDB.save().catch(() => null)
          author.send({
            content: '請問是否想繼續收到同類聊天升級通知?',
            reply: {
              messageReference: messageAwaitAsk.id,
            },
            components: [
              new MessageActionRow().addComponents(interaction1, interaction2),
            ],
          })
        }
      }
    }
  })()
  for (let index = 0, l = rankRoles.length; index < l; index++) {
    if (level < rankRoles[index][0]) break
    if (!member.roles.cache.has(rankRoles[index][1])) {
      member.roles.add(rankRoles[index][1]).catch(() => null)
    }
  }
  if (userDB.weeklyMsg >= 150) {
    if (!userDB.prevHasActiveRole) {
      userDB.prevHasActiveRole = true
      await userDB.save().catch(() => null)
    }
    for (let index = 0, l = activerole.length; index < l; index++) {
      if (userDB.weeklyMsg < activerole[index][0]) break
      if (!member.roles.cache.has(activerole[index][1])) {
        member.roles.add(activerole[index][1]).catch(() => null)
      }
    }
  }
}
