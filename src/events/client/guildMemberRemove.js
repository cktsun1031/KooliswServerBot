const ticketDB = require('../../models/ticket')
const u13PendingDB = require('../../models/under13Pending')
const { under13Log } = require('../../function/jobs')
const { joinOrLeaveAction } = require('../../function/rankingsys')
const { mbrCountCh } = require('../../config.json')

module.exports = async (client, guildMember) => {
  const { guild, user } = guildMember
  if (guild.id !== '687219262406131714') return
  const channel = guild.channels.cache.get(mbrCountCh)
  channel.setName(`伺服器人數: ${guild.memberCount.toLocaleString()}`)
  const tcdb = await ticketDB.findOne({ uId: guildMember.id })
  const u13pendingDB = await ticketDB.findOne({ UserId: user.id })
  await joinOrLeaveAction(user.id, guild.id, 'LEAVE')
  if (tcdb) {
    await ticketDB.findOneAndRemove({ uId: user.id })
    client.channels.cache.get(tcdb.cId).delete()
  }
  if (u13pendingDB && u13pendingDB.Link && u13pendingDB.id) {
    under13Log({
      client,
      type: 'left',
      avatarUrl: user.displayAvatarURL(),
      tag: user.tag,
      id: user.id,
      link: u13pendingDB.Link,
    })
    await u13PendingDB.findOneAndRemove({ UserId: user.id })
  }
}
