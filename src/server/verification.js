const router = require('express').Router()
const { MessageEmbed } = require('discord.js')
const axios = require('axios')
const { resolve } = require('path')
const { updateRankBothGroup } = require('../function/roblox')
const { transferTimeToChinese } = require('../function/tool')
const VfDB = require('../models/verification')
const client = require('../index')
const {
  discordRedirecturl,
  mainSerId,
  verifiedRole,
  emojis,
} = require('../config.json')

const returnOauth = (res) => res.redirect(
  `https://discord.com/oauth2/authorize?client_id=${client.application.id}&redirect_uri=${discordRedirecturl}&response_type=code&scope=guilds.join%20email%20identify`,
)

router.get('/', async (request, res) => {
  const { session, query } = request
  if (session.vui) {
    return res.render(resolve('./src/server/html/verification/captcha.html'), {
      csrfToken: request.csrfToken(),
      recaptcha_sitekey: process.env.RECAPTCHA_SITEKEY,
    })
  }
  const requestData = new URLSearchParams()
  requestData.append('client_id', client.application.id)
  requestData.append('client_secret', process.env.DISCORD_CLIENT_SECRET)
  requestData.append('grant_type', 'authorization_code')
  requestData.append('redirect_uri', discordRedirecturl)
  requestData.append('scope', ['identify', 'email', 'guilds.join'])
  requestData.append('code', query.code)
  const resToken = await axios
    .post('https://discord.com/api/oauth2/token', requestData, {
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
    })
    .catch(() => null)
  if (!resToken?.data) return returnOauth(res)
  const response = await axios
    .get('https://discord.com/api/users/@me', {
      headers: {
        authorization: `Bearer ${resToken.data.access_token}`,
      },
    })
    .catch(() => null)
  if (!response?.data) return returnOauth(res)
  const {
    id, email, username, discriminator, verified, locale,
  } = response.data
  const getGuild = await client.guilds.fetch(mainSerId)
  let guildMember
  if (!getGuild.members.cache.has(id)) {
    const fetchedUser = await client.users.fetch(id).catch(() => null)
    guildMember = await getGuild.members.add(fetchedUser, {
      accessToken: resToken.data.access_token,
    })
  } else {
    guildMember = await getGuild.members.fetch(id).catch(() => null)
  }
  if (!guildMember) return
  if (guildMember.roles.cache.has('687220191121375236')) {
    await session.destroy()
    return res.render(resolve('./src/server/html/success.html'), {
      success_msg: '你已經是正式成員了，無須再次驗證。',
    })
  }
  session.vui = id
  const useremail = email ?? 'N/A'
  const verifyembed = new MessageEmbed()
    .setTitle(
      `<:list:847383789788200991> 登錄驗證: ${username}#${discriminator}`,
    )
    .setThumbnail(guildMember.user.displayAvatarURL())
    .setDescription(
      `<@!${id}>\nID: \`${id}\`\n驗證了嗎: \`${verified}\`\n電子郵件: \`${useremail}\`\n語言: \`${locale}\`\n加入日期: \`${transferTimeToChinese(
        guildMember.joinedAt,
      )}\`\n帳戶創建日期: \`${transferTimeToChinese(
        guildMember.user.createdAt,
      )}\``,
    )
  client.channels.cache.get('852551177560260648').send({
    embeds: [verifyembed],
  })
  if (!verified) {
    await session.destroy()
    return res.render(resolve('./src/server/html/error.html'), {
      error_msg: '你尚未驗證您的電子郵件',
    })
  }
  session.vt = 'pend'
  return res.render(resolve('./src/server/html/verification/captcha.html'), {
    csrfToken: request.csrfToken(),
    recaptcha_sitekey: process.env.RECAPTCHA_SITEKEY,
  })
})

router.get('/cookieNotEnabled', async (request, res) => res.sendFile(resolve('./src/server/html/noCookie.html')))

router.post('/solve/', async (request, res) => {
  const { session, body } = request
  if (
    !session.vui
    || !body['g-recaptcha-response']
    || Boolean(body.acceptRulesCB) === false
  ) return res.redirect('/verify')
  const { data } = await axios
    .post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${body['g-recaptcha-response']}`,
      {},
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        },
      },
    )
    .catch(() => null)
  if (!data?.success) return res.redirect('/verify')
  const getGuild = await client.guilds.fetch(mainSerId)
  if (!getGuild.members.cache.has(session.vui)) {
    return returnOauth(res)
  }
  const guildMember = await getGuild.members
    .fetch(session.vui)
    .catch(() => null)
  if (!guildMember) return
  const preUserDB = await VfDB.findOne({ uId: session.vui })
  if (preUserDB) {
    await VfDB.findOneAndRemove({ uId: session.vui })
  }
  const verifyembed = new MessageEmbed()
    .setTitle(
      `${emojis.tick} 成功驗證: ${guildMember.user.username}#${guildMember.user.discriminator}`,
    )
    .setThumbnail(guildMember.user.displayAvatarURL())
    .setDescription(
      `<@!${session.vui}>\nID: \`${
        session.vui
      }\`\n加入日期: \`${transferTimeToChinese(
        guildMember.joinedAt,
      )}\`\n帳戶創建日期: \`${transferTimeToChinese(
        guildMember.user.createdAt,
      )}\``,
    )
  updateRankBothGroup(guildMember.id, mainSerId)
  guildMember.roles.add(verifiedRole, '用戶已驗證')
  client.channels.cache.get('852551177560260648').send({
    embeds: [verifyembed],
  })
  session.vt = 'done'
  guildMember
    .send({
      embeds: [
        new MessageEmbed()
          .setTitle(`${emojis.tick} 驗證成功，非常感謝你的配合`)
          .setDescription(
            '你現在就可以瀏覽整個伺服器了，你也可以聊天與其他成員進行互動。',
          )
          .setColor('GREEN'),
      ],
    })
    .catch(() => null)
  return res.redirect('/verify/succeed')
})

router.get('/succeed', async (request, res) => {
  const { session } = request
  if (!session.vui) {
    return res.status(404).sendFile(resolve('./src/server/html/notfound.html'))
  }
  if (session.vt !== 'done') return res.redirect('/verify')
  await session.destroy()
  return res.sendFile(resolve('./src/server/html/verified.html'))
})

router.post('/logout', async (request, res) => {
  const { session } = request
  if (!session.vui) {
    return res.status(404).sendFile(resolve('./src/server/html/notfound.html'))
  }
  await session.destroy()
  return res.render(resolve('./src/server/html/sucess.html'), {
    success_msg: '成功登出, 你現在可以關掉這個頁面',
  })
})

module.exports = router
