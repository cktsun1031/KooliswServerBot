const eventDB = require('../models/eventJobs')
const client = require('../index')

module.exports = async (data) => {
  if (data.channel.id !== 'UCJScqEYjfX7E1Ji5irmHIrA') return
  const checkTime = await eventDB.findOne({ Name: 'youtubeNotify_Time' })
  if (checkTime.Data && checkTime.Data >= new Date(data.published).getTime()) return
  const checkIDs = await eventDB.findOne({ Name: 'youtubeNotify_ID' })
  if (checkIDs.Data.includes(data.video.id)) return
  checkTime.Data = new Date(data.published).getTime()
  checkIDs.Data.push(data.video.id)
  await checkTime.save().catch(() => null)
  await checkIDs.save().catch(() => null)
  return client.channels.cache.get('716109543259766814').send({
    content: `<@&868142041320783882>, **${data.channel.name}** 剛剛上傳了的一條全新的YouTube影片, 馬上觀看影片以及訂閱我的YouTube頻道吧!!\n**${data.video.link}**`,
  })
}
