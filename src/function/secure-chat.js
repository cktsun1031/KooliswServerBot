const safebul = require('safe-browse-url-lookup')({
  apiKey: process.env.safeBrowseAPI,
})
const { cache } = require('../plugins/globalCache')
const { enabledFormat } = require('../config/antiRaid.json')
const {
  whitelistedBots,
  inviteWhitelistedChannel,
  generalWhitelistedChannel,
} = require('../config.json')

const uneUnicode = (string_) => string_.replace(/\\u([\dA-Fa-f]{4})/g, (g, word) => String.fromCodePoint(Number.parseInt(word, 16)))

const checkFormat = (pu) => {
  const re = /\.\w+$/
  const re1 = /\w+$/
  const fileEnd = pu.match(re)
  if (!fileEnd || !enabledFormat.includes(fileEnd[0].match(re1)[0])) return 'DFF'
}

const messageFAction = async (message, types) => {
  const replyAndDel = async (desc) => {
    await message.delete().catch(() => {})
    const messageAwaidDel = await message.channel.send({
      content: `<@!${message.author.id}>, ${desc}`,
    })
    return setTimeout(() => messageAwaidDel.delete().catch(() => {}), 6500)
  }
  switch (types) {
    case 'ILLINV':
      return replyAndDel('你不允許傳送邀請連結!')
    case 'MSSMEN':
      return replyAndDel('你傳送的訊息多次提及用戶!')
    case 'MENR':
      return replyAndDel('你不能在短時間內同時傳送多條提及用戶的信息!')
    case 'DFF':
      return replyAndDel('未批准的檔案格式!')
    case 'REPMSG':
      return replyAndDel('你多次傳送重複訊息!')
    case 'PUBMEN':
      return replyAndDel('你是不允許提及公開身份組!')
    case 'MSSAT':
      return replyAndDel('過多上傳檔案!')
    case 'SL':
      return replyAndDel('檢測到危險連結!')
    case 'BL':
      return replyAndDel('這條訊息包含的連結被黑名單, 你被禁止傳送!')
    case 'TML':
      return replyAndDel('這條訊息包含了太多連結, 因此已被禁止!')
    default:
  }
}

const messageCheck = async (message) => {
  if (!generalWhitelistedChannel.includes(message.channelId)) {
    const {
      member, content, channel, author, guild, client, attachments,
    } = message
    if (!member) {
      const mc = await guild.members.fetch(author.id).catch(() => {})
      if (!mc) return 'ERR'
    }
    if (!member.roles.cache.has('724999998479007847')) {
      if (author.id === client.user.id) return 'WL'
      const re1 = /((|https?:\/\/)(discord\.gg|discord\.com\/invite|discordapp\.com\/invite))\/\S+/
      while (re1.test(content)) {
        if (channel.name.startsWith('ticket-')) break
        if (inviteWhitelistedChannel.includes(channel.id)) break
        return 'ILLINV'
      }
      const re2 = /(((<@!?)|(<@&)))\d+>/g
      if (content.match(re2)?.length >= 6) return 'MSSMEN'
      if (attachments?.size >= 6) return 'MSSAT'
      if (content.length > 350) {
        const comsg = content.length > 750 ? `${content.slice(0, 750).trim()}...` : content
        const databaseKey = `${channel.id}-${author.id}`
        if (cache.get(databaseKey) === comsg) return 'REPMSG'
        cache.set(databaseKey, comsg, 1000 * 120)
      }
    }
  }
  return 'OK'
}

const linkChecking = async (content) => {
  const re = /(www.\S+|https?:\/\/\S+)|([\w-]+[.:]\w(([#&./=?]?[\w-]+))*\/?)/g
  const re2 = /[^\s\w%./:|-]/gi
  const comsg = uneUnicode(content.toLowerCase().replace(re2, '')).normalize()
  const allLinkS = comsg.match(re)
  const links = [...new Set(allLinkS)]
  if (!links) return 'OK'
  if (links.length > 7) return 'TML'
  if (links.length > 0) {
    const linkcbl = []
    const linksBlackListed = cache.get('linkBlacklisted')
    const checkblacklist = (link) => {
      for (let index = 0, l = linksBlackListed.length; index < l; index++) {
        const ree = /(((https:\/\/)|(http:\/\/))([\d.A-Za-z]+))/
        const eachCheckL = ree.test(linksBlackListed[index])
          ? linksBlackListed[index].match(ree)[5]
          : linksBlackListed[index]
        if (eachCheckL.includes(link)) return 'BL'
      }
    }
    for (let index = 0, l = links.length; index < l; index++) {
      const ree = /(((https:\/\/)|(http:\/\/))([\d.A-Za-z]+))/
      if (ree.test(links[index])) linkcbl.push(checkblacklist(links[index].match(ree)[5]))
      else {
        const re1 = /^[\w-]+[.:]\w(([#&./=?]?[\w-]+))*\/?$/
        const mtd = links[index].match(re1)
        if (mtd?.length > 0) linkcbl.push(checkblacklist(mtd[0]))
      }
    }
    if (linkcbl.length > 0) {
      const resultOfBL = await Promise.all(linkcbl)
      if (resultOfBL.includes('BL')) return 'BL'
    }
    const resultLinks = await safebul.checkMulti(links).catch(() => null)
    if (resultLinks && Object.keys(resultLinks).length > 0) {
      for (let index = 0, l = links.length; index < l; index++) {
        if (resultLinks[links[index]] === true) return 'SL'
      }
    }
  }
  return 'OK'
}

const mediaCheck = async (att) => {
  const acp = []
  att.map((at) => acp.push(checkFormat(at.proxyURL.toLowerCase())))
  const rf = await Promise.all(new Set(acp))
  if (rf.includes('DFF')) return 'DFF'
  return 'OK'
}

module.exports = async (message, tf = 'S') => {
  if (!whitelistedBots.includes(message.author.id)) {
    const t1 = await messageCheck(message)
    if (t1 !== 'OK') return messageFAction(message, t1)
    if (message.content.length > 0) {
      const t2 = await linkChecking(message.content)
      if (t2 !== 'OK') return messageFAction(message, t2)
    }
    if (tf === 'S' && (message.embeds || message.attachments.size >= 0)) {
      const t3 = await mediaCheck(message.attachments)
      return messageFAction(message, t3)
    }
  }
}
