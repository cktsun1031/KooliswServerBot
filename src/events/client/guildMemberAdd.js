const { createCanvas, loadImage, registerFont } = require('canvas')
const {
  fillTextWithTwemoji,
} = require('node-canvas-with-twemoji-and-discord-emoji')
const Mute = require('../../models/mute')
const { joinOrLeaveAction } = require('../../function/rankingsys')
const { nameSubtract } = require('../../function/tool')
const { mbrCountCh } = require('../../config.json')

module.exports = async (client, gm) => {
  const { user, guild } = gm
  if (guild.id !== '687219262406131714') return
  if (user.bot && user.flags.bitfield === 0) {
    return gm.kick({
      reason: '未經驗證的機器人是不允許的!',
    })
  }
  const channel = guild.channels.cache.get(mbrCountCh)
  channel.setName(`伺服器人數: ${guild.memberCount.toLocaleString()}`)
  await joinOrLeaveAction(user.id, guild.id, 'JOIN')
  const muteUsrDB = await Mute.findOne({ uId: user.id })
  if (muteUsrDB) gm.roles.add('760805405730537472')
  const canvas = createCanvas(1024, 500)
  const x = canvas.width / 2
  const context = canvas.getContext('2d')
  registerFont('./src/assets/SourceHanSansHC-Medium.otf', {
    family: 'SourceHanSansHC-Medium',
    weight: 48,
    style: 'Medium',
  })
  context.font = '65px SourceHanSansHC-Medium'
  context.fillStyle = '#ffffff'
  context.textAlign = 'center'
  context.shadowColor = 'black'
  context.shadowBlur = 5
  context.shadowOffsetX = 4
  context.shadowOffsetY = 4
  const background = await loadImage('./src/assets/discord/welcome2.png')
  context.drawImage(background, 0, 0, 1024, 500)
  context.fillText('歡迎光臨', x, 360)
  context.beginPath()
  context.arc(512, 155, 128, 0, Math.PI * 2, true)
  context.stroke()
  context.fill()
  context.font = '42px SourceHanSansHC-Medium'
  await fillTextWithTwemoji(
    context,
    `${nameSubtract(user.username, 31, 19)}#${user.discriminator}`,
    x,
    420,
  )
  context.font = '32px SourceHanSansHC-Medium'
  context.fillText(`你是第${guild.memberCount}位成員`, x, 470)
  context.beginPath()
  context.arc(512, 155, 119, 0, Math.PI * 2, true)
  context.closePath()
  context.clip()
  const av = await loadImage(
    user.displayAvatarURL({ format: 'png', size: 4096 }),
  )
  context.drawImage(av, 393, 36, 238, 238)
  return client.channels.cache.get('763711481346260992').send({
    content: `<a:wavehand:848204779707695104>歡迎, <@!${user.id}>!`,
    files: [
      {
        name: `${user.id}_Welcome.png`,
        attachment: canvas.toBuffer(),
      },
    ],
  })
}
