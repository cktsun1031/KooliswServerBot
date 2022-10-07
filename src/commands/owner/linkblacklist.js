const eventDB = require('../../models/eventJobs')
const { cache } = require('../../plugins/globalCache')

module.exports = {
  name: 'linkblacklist',
  aliases: ['linkb'],
  private: true,
  allChannelAccess: true,
  run: async ({ msg, args }) => {
    if (msg.author.id !== '611804698856521728') return
    msg.delete()
    let linksBlackListed = cache.get('linkBlacklisted')
    const lbdb = await eventDB.findOne({ Name: 'linkBlacklisted' })
    switch (args[0]) {
      case 'c':
        linksBlackListed.push(args[1])
        cache.set('linkBlacklisted', linksBlackListed)
        lbdb.Data = linksBlackListed
        await lbdb.save().catch(() => {})
        msg.channel.send('Link Stored')
        break
      case 'd':
        linksBlackListed = linksBlackListed.filter((index) => index !== args[1])
        cache.set('linkBlacklisted', linksBlackListed)
        lbdb.Data = linksBlackListed
        await lbdb.save().catch(() => {})
        msg.channel.send('Link Deleted')
        break

      default:
        msg.channel.send('Args Not Defined')
        break
    }
  },
}
