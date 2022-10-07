const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js')
const axios = require('axios')
const eventDB = require('../models/eventJobs')
const u13PendingDB = require('../models/under13Pending')
const Lvl = require('../models/level')
const Mute = require('../models/mute')
const Ban = require('../models/ban')
const { cache } = require('../plugins/globalCache')

async function muteCheck(client) {
  const muteFiltered = await Mute.find({ endAt: { $lt: Date.now() } })
  const banFiltered = await Ban.find({ endAt: { $lt: Date.now() } })
  const guildGet = client.guilds.cache.get('687219262406131714')
  if (muteFiltered.length > 0) {
    for (const data of muteFiltered) {
      await Mute.findOneAndRemove({ uId: data.uId })
      if (guildGet.members.cache.has(data.uId)) {
        const member = await guildGet.members.fetch(data.uId).catch(() => {})
        member.roles.remove('760805405730537472')
      }
    }
  }
  if (banFiltered.length > 0) {
    for (const data of muteFiltered) {
      await Ban.findOneAndRemove({ uId: data.uId })
      const user = await client.users.fetch(data.uId).catch(() => {})
      if (user) guildGet.members.unban(guildGet)
    }
  }
}

async function checkAndDeleteInvalidLVUsDB(client) {
  const filtered = await Lvl.find({ delAfter: { $lt: Date.now() } })
  if (filtered.length > 0) {
    const guildGet = client.guilds.cache.get('687219262406131714')
    for (const data of filtered) {
      const uId = data.userId
      const gId = data.guildId
      await (guildGet.members.cache.has(uId)
        ? Lvl.findOneAndUpdate(
          { userId: uId, guildId: gId },
          { delAfter: null },
        )
        : Lvl.findOneAndRemove({
          userId: uId,
          guildId: gId,
        }))
    }
  }
}

async function checkAndRemoveDisabled() {
  const filtered = await Lvl.find({ disabled: { $ne: false } })
  if (filtered.size > 0) {
    filtered.forEach(async (data, index, array) => {
      if (
        index < array.length - 1
        && data.status === true
        && data.endTime < Date.now()
      ) {
        await Lvl.findOneAndUpdate(
          {
            userId: data.userId,
            guildId: data.guildId,
          },
          { disabled: false },
        )
      }
    })
  }
}

async function updateYoutubeChannel(client, channelid) {
  const countupsym = (_number) => {
    if (_number >= 1000) return `${Number.parseFloat(_number / 1000).toFixed(1)}K`
    return _number
  }
  const { data } = await axios
    .get(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=UCJScqEYjfX7E1Ji5irmHIrA&key=${process.env.YT_KEY}`,
    )
    .catch(() => {})
  if (data?.items) {
    client.channels.cache
      .get(channelid)
      .setName(
        `訂閱人數: ${countupsym(data.items[0].statistics.subscriberCount)}`,
      )
  }
}

function updateStatus(client, serverid) {
  client.user.setActivity(
    `${client.guilds.cache.get(serverid).memberCount}位軍團成員`,
    { type: 'WATCHING' },
  )
}

async function checkUserStillActive(client) {
  const cusdb = await eventDB.findOne({ Name: 'checkUserStillActive' })
  if (cusdb && cusdb.Data < Date.now()) {
    const filtered = await Lvl.find({
      weeklyMsg: { $lt: 150 },
      prevHasActiveRole: true,
      guildId: '687219262406131714',
    })
    const guildGet = client.guilds.cache.get('687219262406131714')
    filtered.forEach(async (data, index, array) => {
      if (index < array.length - 1) {
        await Lvl.findOneAndUpdate(
          {
            userId: data.userId,
            guildId: data.guildId,
          },
          { prevHasActiveRole: false },
        )
        if (guildGet.members.cache.has(data.userId)) {
          const member = await guildGet.members
            .fetch(data.userId)
            .catch(() => {})
          if (member) {
            if (member.roles.cache.has('691991846888407071')) {
              member.roles.remove('691991846888407071').catch(() => {})
            }
            if (member.roles.cache.has('898215126853902396')) {
              member.roles.remove('898215126853902396').catch(() => {})
            }
          }
        }
      }
    })
    cusdb.Data += 604_800_000
    await cusdb.save().catch(() => {})
  }
}

async function removeAllTemporaryMessage() {
  const rtdb = await eventDB.findOne({ Name: 'removeTempMessages' })
  if (!rtdb) return false
  if (rtdb.Data < Date.now()) {
    const filtered = await Lvl.find({
      weeklyMsg: { $gt: 0 },
      guildId: '687219262406131714',
    }).exec()
    for (const data of filtered) {
      data.weeklyHis.push({
        date: rtdb.Data - 604_800_000,
        num: data.weeklyMsg,
      })
      data.weeklyMsg = 0
      await data.save().catch(() => {})
    }
    rtdb.Data += 604_800_000
    await rtdb.save().catch(() => {})
  }
}

async function checkTicketChannelTiming(client, messageId) {
  const datedTimezone = new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Hong_Kong',
  })
  const datedMs = new Date(datedTimezone)
  const channel = client.channels.cache.get('763722350494613545')
  const button = new MessageButton()
  const tchm = await eventDB.findOne({ Name: 'ticketchModify_status' })
  if (!tchm) return
  if (datedMs.getHours() <= 9) {
    if (tchm.Data === 'nightTimeModified') return true
    button
      .setStyle('SECONDARY')
      .setLabel('📩創建開票 Create Ticket')
      .setCustomId('press_create_ticket')
      .setDisabled(true)
    tchm.Data = 'nightTimeModified'
    await tchm.save().catch(() => {})
    const messageAwEdit = await channel.messages
      .fetch(messageId)
      .catch(() => {})
    if (!messageAwEdit) return
    return messageAwEdit.edit({
      components: [new MessageActionRow().addComponents(button)],
    })
  }
  if (tchm.Data === 'dayTimeModified') return true
  button
    .setStyle('SECONDARY')
    .setLabel('📩創建開票 Create Ticket')
    .setCustomId('press_create_ticket')
    .setDisabled(false)
  tchm.Data = 'nightTimeModified'
  await tchm.save().catch(() => {})
  const messageAwEdit = await channel.messages.fetch(messageId).catch(() => {})
  if (!messageAwEdit) return
  return messageAwEdit.edit({
    components: [new MessageActionRow().addComponents(button)],
  })
}

function under13Log({
  client,
  type,
  avatarUrl,
  tag,
  message,
  id,
  link = 'N/A',
}) {
  const embed = new MessageEmbed()
  const logChannel = client.channels.cache.get('882159582422642688')
  switch (type) {
    case 'notify': {
      embed
        .setAuthor({ name: tag, iconURL: avatarUrl })
        .setTitle('可疑年齡用戶已通知!')
        .setTimestamp()
        .setDescription(
          `**截止日期:** ${message}\nID: ${id}\n訊息提示連結: [點擊這裏](${link})`,
        )
      return logChannel.send({ embeds: [embed] })
    }
    case 'proofed': {
      embed
        .setAuthor({ name: tag, iconURL: avatarUrl })
        .setTitle('用戶年齡已證明!')
        .setTimestamp()
        .setDescription(`**ID:** ${id}`)
      return logChannel.send({ embeds: [embed] })
    }
    case 'timeout': {
      embed
        .setAuthor({ name: tag, iconURL: avatarUrl })
        .setTitle('可疑年齡用戶證明期限即將完結!')
        .setTimestamp()
        .setDescription(
          `**截止日期:** ${message}\nID: ${id}\n訊息提示連結: [點擊這裏](${link})`,
        )
      return logChannel.send({ embeds: [embed] })
    }
    case 'ended': {
      embed
        .setAuthor({ name: tag, iconURL: avatarUrl })
        .setTitle('可疑年齡用戶證明期限已結束!')
        .setTimestamp()
        .setDescription(
          `**截止日期:** ${message}\nID: ${id}\n訊息提示連結: [點擊這裏](${link})`,
        )
      return logChannel.send({ embeds: [embed] })
    }
    case 'proofedRemove': {
      embed
        .setAuthor({ name: tag, iconURL: avatarUrl })
        .setTitle('已移除已核實年齡的群組!')
        .setTimestamp()
        .setDescription(`**ID:** ${id}`)
      return logChannel.send({ embeds: [embed] })
    }
    case 'left': {
      embed
        .setAuthor({ name: tag, iconURL: avatarUrl })
        .setTitle('可疑年齡用戶已離開!')
        .setTimestamp()
        .setDescription(`**ID:** ${id}\n訊息提示連結: [點擊這裏](${link})`)
      return logChannel.send({ embeds: [embed] })
    }
    default:
  }
}

async function checkAllU13Pending(client) {
  const allData = await u13PendingDB.find()
  for (const data of allData) {
    const now = Date.now()
    const endT = data.Timing.et
    const guildGet = client.guilds.cache.get('687219262406131714')
    const member = await guildGet.members.fetch(data.UserId).catch(() => {})
    if (!member) {
      await u13PendingDB.findOneAndRemove({
        UserId: data.UserId,
      })
      under13Log({
        client,
        type: 'left',
        avatarUrl: data.Avatar,
        tag: data.Tag,
        id: data.UserId,
        link: data.Link,
      })
    } else {
      const targetDated = new Date(endT).toLocaleString('en-US', {
        timeZone: 'Asia/Hong_Kong',
      })
      const targetDate = new Date(targetDated)
      targetDate.setDate(targetDate.getDate() + 2)
      const dateString = `${targetDate.getFullYear()}年${
        targetDate.getMonth() + 1
      }月${targetDate.getDate()}日${targetDate.getHours()}時${targetDate.getMinutes()}分`
      if (endT - now <= 10_800_000 && endT - now >= 3_600_000) {
        await u13PendingDB.findOneAndRemove({
          UserId: data.UserId,
        })
        under13Log({
          client,
          type: 'timeout',
          avatarUrl: member.user.displayAvatarURL(),
          tag: member.user.tag,
          message: dateString,
          id: member.user.id,
          link: data.Link,
        })
      }
      if (endT - now <= 0) {
        await u13PendingDB.findOneAndRemove({ UserId: data.UserId })
        under13Log({
          client,
          type: 'ended',
          avatarUrl: member.user.displayAvatarURL(),
          tag: member.user.tag,
          message: dateString,
          id: member.user.id,
          link: data.Link,
        })
      }
    }
  }
}

async function initBotServices() {
  const cusdb = await eventDB.findOne({
    Name: 'checkUserStillActive',
  })
  const stcusdb = String(cusdb.Data)
  const cdr = stcusdb.slice(0, -3)
  if (cache.get('cUsA') !== cdr) cache.set('cUsA', cdr)
  const rtdb = await eventDB.findOne({
    Name: 'removeTempMessages',
  })
  const strtdb = String(rtdb.Data)
  const rwd = strtdb.slice(0, -3)
  if (cache.get('rTM') !== rwd) cache.set('rTM', rwd)
  const lbdb = await eventDB.findOne({
    Name: 'linkBlacklisted',
  })
  if (cache.get('linkBlacklisted') !== lbdb.Data) cache.set('linkBlacklisted', lbdb.Data)
}

module.exports = {
  checkAndRemoveDisabled,
  updateYoutubeChannel,
  checkAndDeleteInvalidLVUsDB,
  checkTicketChannelTiming,
  updateStatus,
  checkUserStillActive,
  removeAllTempMsg: removeAllTemporaryMessage,
  under13Log,
  checkAllU13Pending,
  initBotServices,
  muteCheck,
}
