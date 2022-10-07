const { MessageEmbed } = require('discord.js')
const { createCanvas, registerFont, loadImage } = require('canvas')
const {
  fillTextWithTwemoji,
} = require('node-canvas-with-twemoji-and-discord-emoji')
const client = require('../index')
const Lvl = require('../models/level')
const { nameSubtract } = require('./tool')
const {
  iDOf3WbTU,
  nextRankRole,
  iDOf3WBAC,
  rankRolesLP,
  activerole,
} = require('../config/levels.json')
const { dymaticMsg } = require('../config.json')

async function topusr(guildid) {
  const canvas1 = createCanvas(825, 400)
  const context1 = canvas1.getContext('2d')
  registerFont('./src/assets/SourceHanSansHC-Medium.otf', {
    family: 'SourceHanSansHC-Medium',
    weight: 48,
    style: 'Medium',
  })
  context1.fillStyle = '#fffff'
  context1.textAlign = 'center'
  const background1 = await loadImage('./src/assets/discord/topuser.png')
  context1.drawImage(background1, 0, 0, 825, 400)
  context1.font = '19px SourceHanSansHC-Medium'
  const ft = await Lvl.find({ guildId: guildid, weeklyMsg: { $gte: 0 } }).sort([
    ['weeklyMsg', 'descending'],
  ])
  const top3 = ft.splice(0, 3)
  context1.shadowColor = 'black'
  context1.shadowBlur = 5
  context1.shadowOffsetX = 4
  context1.shadowOffsetY = 4
  context1.textAlign = 'center'
  context1.fillStyle = '#ffffff'
  for (let index = 0, l = iDOf3WBAC.length; index < l; index++) {
    context1.beginPath()
    context1.arc(
      iDOf3WBAC[index].x,
      iDOf3WBAC[index].y,
      iDOf3WBAC[index].r,
      0,
      Math.PI * 2,
      true,
    )
    context1.fill()
  }
  context1.save()
  context1.fillStyle = '#fff'
  for (let index = 0, l = top3.length; index < l; index++) {
    const imgData = iDOf3WbTU[index]
    context1.save()
    context1.beginPath()
    context1.arc(
      imgData.image.x + imgData.image.scale / 2,
      imgData.image.y + imgData.image.scale / 2,
      imgData.image.scale / 2,
      0,
      Math.PI * 2,
      true,
    )
    context1.closePath()
    context1.clip()
    const id = top3[index].userId
    const user = await client.users.fetch(id).catch(() => null)
    const wholeName = user
      ? `${nameSubtract(user.username, 10, 6)}#${user.discriminator}`
      : nameSubtract(id, 11, 7)
    if (user) {
      const avatar = await loadImage(
        user.displayAvatarURL({ format: 'png', size: 4096 }),
      )
      context1.drawImage(
        avatar,
        imgData.image.x,
        imgData.image.y,
        imgData.image.scale,
        imgData.image.scale,
      )
      context1.restore()
    }
    context1.restore()
    context1.fillText(
      `${top3[index].weeklyMsg}條訊息`,
      imgData.mT.x,
      imgData.mT.y,
    )
    await fillTextWithTwemoji(
      context1,
      wholeName,
      imgData.usnT.x,
      imgData.usnT.y,
    )
  }
  const messageAwaitEdit = await client.channels.cache
    .get('942950739129557003').send({
      files: [
        { name: `topusr_${Date.now()}`, attachment: canvas1.toBuffer() },
      ],
    }).catch(() => {})
  const messageAwaitEdit1 = await client.channels.cache
    .get('862503977991798804')
    .messages.fetch(dymaticMsg.top3Id)
  if (!messageAwaitEdit1 || !messageAwaitEdit.attachments) return
  return messageAwaitEdit1.edit({
    embeds: [
      new MessageEmbed()
        .setTitle('最高本週活躍 Top Weekly Active!')
        .setImage(messageAwaitEdit.attachments.first().proxyURL),
    ],
    content: null,
  })
}

async function weekylylb(guildid) {
  let firstnum1 = 87
  const canvas2 = createCanvas(659, 600)
  const context2 = canvas2.getContext('2d')
  registerFont('./src/assets/SourceHanSansHC-Medium.otf', {
    family: 'SourceHanSansHC-Medium',
    weight: 48,
    style: 'Medium',
  })
  context2.font = '65px SourceHanSansHC-Medium'
  context2.fillStyle = '#ffffff'
  const background2 = await loadImage('./src/assets/discord/weekly.png')
  context2.drawImage(background2, 0, 0, 659, 600)
  context2.font = '32px SourceHanSansHC-Medium'
  const ft = await Lvl.find({ guildId: guildid, weeklyMsg: { $gte: 0 } }).sort([
    ['weeklyMsg', 'descending'],
  ])
  const top10WLB = ft.splice(0, 10)
  for (let index = 0, l = top10WLB.length; index < l; index++) {
    const { userId, weeklyMsg } = top10WLB[index]
    if (firstnum1 >= 587) break
    if (index + 1 > 10) break
    context2.textAlign = 'left'
    const user = await client.users.fetch(userId).catch(() => null)
    const userName = user
      ? `${nameSubtract(user.username, 17, 12)}#${user.discriminator}`
      : userId
    await fillTextWithTwemoji(context2, userName, 87, firstnum1)
    context2.fillText(`#${index + 1}`, 6, firstnum1)
    context2.textAlign = 'center'
    context2.fillText(weeklyMsg, 592.5, firstnum1)
    firstnum1 += 50
  }
  const messageAwaitEdit = await client.channels.cache
    .get('942950739129557003').send({
      files: [
        { name: `weeklylb_${Date.now()}`, attachment: canvas2.toBuffer() },
      ],
    }).catch(() => {})
  const messageAwaitEdit1 = await client.channels.cache
    .get('862503977991798804')
    .messages.fetch(dymaticMsg.weeklyImageId)
  if (!messageAwaitEdit1 || !messageAwaitEdit.attachments) return
  return messageAwaitEdit1.edit({
    embeds: [
      new MessageEmbed()
        .setTitle('本週訊息排行榜 Weekly Leaderboard')
        .setImage(messageAwaitEdit.attachments.first().proxyURL),
    ],
    content: null,
  })
}

async function updateLeaderwImg(guildid) {
  let firstnum = 87
  const canvas = createCanvas(825, 600)
  const context = canvas.getContext('2d')
  registerFont('./src/assets/SourceHanSansHC-Medium.otf', {
    family: 'SourceHanSansHC-Medium',
    weight: 48,
    style: 'Medium',
  })
  context.font = '65px SourceHanSansHC-Medium'
  context.fillStyle = '#ffffff'
  const background = await loadImage('./src/assets/Leadersec.png')
  context.drawImage(background, 0, 0, 825, 600)
  context.font = '32px SourceHanSansHC-Medium'
  const ft = await Lvl.find({ guildId: guildid, totalMsg: { $gte: 0 } }).sort([
    ['totalMsg', 'descending'],
  ])
  const top10 = ft.splice(0, 10)
  for (let index = 0, l = top10.length; index < l; index++) {
    const {
      totalMsg, weeklyMsg, prevHasActiveRole, userId,
    } = top10[index]
    if (firstnum >= 587) break
    if (index + 1 > 10) break
    const user = await client.users.fetch(userId).catch(() => null)
    const userName = user
      ? `${nameSubtract(user.username, 17, 12)}#${user.discriminator}`
      : userId
    context.textAlign = 'left'
    await fillTextWithTwemoji(context, userName, 87, firstnum)
    context.fillText(`#${index + 1}`, 6, firstnum)
    const actveIcon = prevHasActiveRole === true
      ? '<:tick:846643019197448234>'
      : '<:crossi:846642539436310559>'
    await fillTextWithTwemoji(context, actveIcon, 778, firstnum)
    context.textAlign = 'center'
    context.fillText(totalMsg, 592.5, firstnum)
    context.fillText(weeklyMsg, 713, firstnum)
    firstnum += 50
  }
  const messageAwaitEdit = await client.channels.cache
    .get('942950739129557003').send({
      files: [
        { name: `Leaderboard_${Date.now()}`, attachment: canvas.toBuffer() },
      ],
    }).catch(() => {})
  const messageAwaitEdit1 = await client.channels.cache
    .get('862503977991798804')
    .messages.fetch(dymaticMsg.totalMsgImageId)
  if (!messageAwaitEdit1 || !messageAwaitEdit.attachments) return
  const embed = new MessageEmbed()
    .setTitle('訊息排行榜 Message Leaderboard')
    .setDescription(
      '這裏是本群每天的活躍排行榜，請記得踴躍聊天，最活躍的十名內將會在此列出，如果你想查詢有關自己的等級和排名，你可使用指令 `k!rank` 進行查詢。\n<a:loading:846645871080898580> **將會每 20 分鐘進行更新 Reloading every 20 Minutes...**',
    )
    .setImage(messageAwaitEdit.attachments.first().proxyURL)
  return messageAwaitEdit1.edit({
    embeds: [embed],
    content: null,
  })
}

function getNextRankRole(level) {
  let mRN = '`N/A`'
  if (level < 30) {
    for (let index = 0, l = nextRankRole.length; index < l; index++) {
      if (level < nextRankRole[index][0]) break
      mRN = `<@&${nextRankRole[index][1]}>`
    }
  }
  return mRN
}

function howManyActiveRole(member) {
  const aRR = []
  for (let index = 0, l = activerole.length; index < l; index++) {
    if (member.roles.cache.has(activerole[index][1])) aRR.push(`<@&${activerole[index][1]}>`)
  }
  return aRR.length > 0 ? aRR.join(', ') : '`N/A`'
}

function getHowManyRoleUserHas(member) {
  const aRR = []
  for (let index = 0, l = rankRolesLP.length; index < l; index++) {
    if (member.roles.cache.has(rankRolesLP[index])) aRR.push(`<@&${rankRolesLP[index]}>`)
  }
  return aRR.length > 0 ? aRR.join(', ') : '`N/A`'
}

async function updateallimg(guildid) {
  await updateLeaderwImg(guildid)
  await weekylylb(guildid)
  await topusr(guildid)
}

module.exports = {
  getNextRankRole,
  getHowManyRoleUserHas,
  updateallimg,
  howManyActiveRole,
}
