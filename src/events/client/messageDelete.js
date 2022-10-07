const Snipe = require('../../models/snipe')
const eventDB = require('../../models/eventJobs')
const { tfEn } = require('../../function/tool')
const { snipeWord } = require('../../config/blockedwords.json')

const getCrDB = async (cId) => {
  const data = await Snipe.findOne({ cId })
  if (data) return data
  const newData = new Snipe({ cId })
  await newData.save().catch(() => null)
  return newData
}

module.exports = async (client, message) => {
  const {
    author, content, channel, attachments,
  } = message
  if (
    !author
    || author.id === client.user.id
    || (content && snipeWord.includes(content))
  ) return
  const sDB = await getCrDB(channel.id)
  const dateMS = tfEn(Date.now())
  const insCt = content.length > 1250 ? `${content.slice(0, 1247)}...` : content ?? null
  sDB.content = {
    data: insCt,
    image: attachments.first() ? attachments.first().proxyURL : null,
  }
  sDB.date = dateMS
  sDB.author = {
    name: `${author.username}#${author.discriminator}`,
    id: author.id,
  }
  await sDB.save().catch(() => null)
  if (channel.id === '858356212302741535') {
    if (author.bot === true || message.id !== channel.lastMessageId) return
    const allMessage = await channel.messages
      .fetch({ limit: 1 })
      .catch(() => null)
    if (!allMessage) return
    allMessage.map(async (message) => {
      const re = /[^A-Za-z]/
      if (re.test(message.content)) return
      const re1 = /[A-Za-z]$/
      const enLtr = message.content.match(re1)[0]
      const lowg = await eventDB.findOne({ Name: 'letterOfWordsGame' })
      if (lowg.Data === enLtr.toLowerCase()) return
      lowg.Data = enLtr.toLowerCase()
      await lowg.save().catch(() => null)
    })
  }
}
