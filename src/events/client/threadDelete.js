const snipe = require('../../models/snipe')

module.exports = async (client, thread) => {
  const data = await snipe.findOne({
    ChannelId: thread.id,
  })
  if (data) {
    await snipe.findOneAndRemove({
      TicketOwner: thread.id,
    })
  }
}
