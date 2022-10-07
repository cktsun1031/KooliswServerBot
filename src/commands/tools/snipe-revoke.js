const snipe = require('../../models/snipe')

module.exports = {
  name: 'snipe-revoke',
  aliases: ['sr', 'rs'],
  allChannelAccess: true,
  desc: '撤銷條頻道最後被刪除的一條訊息，只有該訊息主人才能撤銷',
  run: async ({ msg }) => {
    const { channel, author } = msg
    const messageDB = await snipe.findOne({
      cId: channel.id,
    })
    if (
      author.id !== '611804698856521728'
      && (!messageDB || messageDB.author.id !== author.id)
    ) return msg.delete()
    messageDB.content = {
      data: '```已撤销 Revoked```',
      image: null,
    }
    await messageDB.save().catch(() => {})
    return msg.delete()
  },
}
