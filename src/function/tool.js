const dayjs = require('dayjs')
const stringSimilarity = require('string-similarity')
const { MessageButton, MessageActionRow } = require('discord.js')
const { cache } = require('../plugins/globalCache')
dayjs.extend(require('dayjs/plugin/timezone'))
dayjs.extend(require('dayjs/plugin/utc'))

function transferTimeToChinese(ts, wT = true) {
  const forSty = wT ? 'YYYY年MM月DD日 HH時mm分ss秒' : 'YYYY年MM月DD日'
  return dayjs.tz(ts, 'Asia/Hong_Kong').format(forSty)
}

function tfEn(ts, ti = true) {
  const frm = ti ? 'YYYY/MM/DD HH:mm:ss' : 'YYYY/MM/DD'
  return dayjs.tz(ts, 'Asia/Hong_Kong').format(frm)
}

function tfcA(ts) {
  return dayjs.tz(ts, 'Asia/Hong_Kong').format('YYYY年MM月DD日 HH時mm分')
}

function parseSec2Word(ms) {
  if (ms < 1000) return '1秒'
  let seconds = Math.trunc((ms / 1000) % 60)
  let minutes = Math.trunc((ms / (1000 * 60)) % 60)
  let hours = Math.trunc((ms / (1000 * 60 * 60)) % 24)
  seconds = seconds > 0 ? `${seconds} 秒` : ''
  minutes = minutes > 0 ? `${minutes} 分鐘 ` : ''
  hours = hours > 0 ? `${hours} 小時 ` : ''
  return `${hours}${minutes}${seconds}`
}

function nameSubtract(name, numberMax, numberCh) {
  const re = /([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g
  const re1 = /%CC(%[\dA-Z]{2})+%20/g
  const re2 = /%CC(%[\dA-Z]{2})+(\w)/g
  const re3 = /[\u4E00-\u9FA5]+/
  const fdn = decodeURIComponent(
    encodeURIComponent(`${name} `).replace(re1, ' ').replace(re2, '$2'),
  )
    .trim()
    .replace(re, '')
  const mn = re3.test(fdn) ? numberCh : numberMax
  return name.length > mn ? `${name.slice(0, Math.max(0, mn)).trim()}..` : name
}

async function handleWWCmd(message, tWord) {
  return new Promise((resolve) => {
    const startD = Date.now()
    const cmdList = cache.get('cmdL')
    const { bestMatch } = stringSimilarity.findBestMatch(tWord, cmdList)
    if (bestMatch.rating < 0.65) return resolve(false)
    const int1 = new MessageButton()
      .setStyle('SUCCESS')
      .setEmoji('👍')
      .setCustomId('accCMD')
    const int2 = new MessageButton()
      .setStyle('DANGER')
      .setEmoji('👎')
      .setCustomId('denCMD')
    return message
      .reply({
        content: `請問你是否想輸入 \`k!${bestMatch.target}\`? (相似度: \`${
          bestMatch.rating.toFixed(2) * 100
        }%\`)`,
        components: [new MessageActionRow().addComponents(int1, int2)],
      })
      .then((message_) => {
        const filter = (ii) => ['accCMD', 'denCMD'].includes(ii.customId)
          && ii.user.id === message.author.id
        const cll = message.channel.createMessageComponentCollector({
          filter,
          time: 15_000,
        })
        let status = false
        cll.on('collect', async (int) => {
          switch (int.customId) {
            case 'accCMD': {
              await int.message.delete().catch(() => null)
              status = true
              return resolve([bestMatch.target, startD - Date.now()])
            }
            case 'denCMD': {
              await int.message.delete().catch(() => null)
              status = true
              return resolve(false)
            }
          }
        })
        cll.on('end', () => {
          if (!status) message_.delete()
        })
      })
  })
}

module.exports = {
  transferTimeToChinese,
  tfEn,
  tfcA,
  parseSec2Word,
  nameSubtract,
  handleWWCmd,
}
