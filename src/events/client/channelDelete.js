const ticketDB = require('../../models/ticket')

module.exports = async (client, channel) => {
  if (channel.name.startsWith('ticket-')) {
    await ticketDB.findOneAndRemove({ cId: channel.id })
  }
}
