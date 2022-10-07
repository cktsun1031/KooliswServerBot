const schedule = require('node-schedule')
const slashCommandH = require('../../handler/slashcommands')
const {
  checkTicketChannelTiming,
  removeAllTempMsg,
  checkUserStillActive,
  initBotServices,
  updateYoutubeChannel,
  checkAndDeleteInvalidLVUsDB,
  checkAndRemoveDisabled,
  muteCheck,
} = require('../../function/jobs')
const { checkAllU13Pending, updateStatus } = require('../../function/jobs')
const { updateallimg } = require('../../function/levelSystem')
const { mainSerId } = require('../../config.json')

module.exports.once = true
module.exports = async (client) => {
  console.log('Bot is in ready status!') // eslint-disable-line no-console
  initBotServices()
  slashCommandH(client)
  client.user.setPresence({
    status: 'idle',
    activities: [
      {
        name: `${client.guilds.cache.get(mainSerId).memberCount}位軍團成員`,
        type: 'WATCHING',
      },
    ],
  })
  schedule.scheduleJob('*/15 * * * *', () => {
    checkAndRemoveDisabled(client)
    checkAndDeleteInvalidLVUsDB(client)
  })
  schedule.scheduleJob('*/10 * * * *', () => updateallimg('687219262406131714'))
  schedule.scheduleJob('*/5 * * *', () => {
    checkTicketChannelTiming(client, '860911240317632552')
    removeAllTempMsg(client)
    checkUserStillActive(client)
  })
  schedule.scheduleJob('*/3 * * *', () => {
    checkAllU13Pending(client)
    initBotServices()
  })
  schedule.scheduleJob('*/2 * * *', () => {
    updateYoutubeChannel(client, '853965844237647902')
    updateStatus(client, mainSerId)
  })
  schedule.scheduleJob('* * * *', () => muteCheck(client))
}
