const { MessageEmbed } = require('discord.js')
const axios = require('axios')
const stringify = require('fast-json-stringify')({
  title: 'js',
  type: 'object',
  properties: {
    max_age: { type: 'number' },
    max_uses: { type: 'number' },
    target_application_id: { type: 'string' },
    target_type: { type: 'number' },
    temporary: { type: 'boolean' },
    validate: { type: 'null' },
  },
})

const activities = {
  youtube: ['755600276941176913', 'YouTube Together 影片播放'],
  betrayal: ['773336526917861400', 'Betrayal.io'],
  pokernight: ['755827207812677713', 'Poker Night'],
  fishington: ['814288819477020702', 'Fishington.io'],
  chessdev: ['832012586023256104', 'ChessDev'],
  chess: ['832012774040141894', 'Chess'],
  lettertile: ['879863686565621790', 'lettertile'],
  wordsnack: ['879863976006127627', 'wordsnack'],
  doodlecrew: ['878067389634314250', 'doodlecrew'],
  awkword: ['879863881349087252', 'awkword'],
  spellcast: ['852509694341283871', 'spellcast'],
}

module.exports = {
  name: 'activities',
  desc: '在語音頻道創建Discord Together語音活動',
  usage: 'k!activities [頻道ID] [活動名稱]',
  run: async ({ msg, args }) => {
    const activitesTarget = activities[args[1]]
    const channel = msg.client.channels.cache.get(args[0])
    if (!args[1] || !channel || !activitesTarget) {
      return msg.reply({
        embeds: [
          new MessageEmbed()
            .setTitle('<:crossi:846642539436310559> 錯誤用法 Wrong Usage!')
            .setDescription(
              `用法: ${module.exports.usage}\n活動: \`youtube\`, \`betrayal\`, \`pokernight\`, \`fishington\`, \`chessdev\`, \`chess\`, \`lettertile\`, \`wordsnack\`, \`doodlecrew\``,
            ),
        ],
      })
    }
    if (channel.type !== 'GUILD_VOICE') {
      return msg.reply({
        content: '頻道必須是語音頻道。',
      })
    }
    const header = {
      headers: {
        Authorization: `Bot ${msg.client.token}`,
        'Content-Type': 'application/json',
      },
    }
    const jsonData = stringify({
      max_age: 86_400,
      max_uses: 0,
      target_application_id: activitesTarget[0],
      target_type: 2,
      temporary: false,
      validate: null,
    })
    const { data } = await axios
      .post(
        `https://discord.com/api/v${msg.client.options.http.version}/channels/${channel.id}/invites`,
        jsonData,
        header,
      )
      .catch(() => null)
    if (data) {
      return msg.reply({
        content: `已在 (<#${channel.id}>)\`${channel.name}\` 頻道建立活動: **${activitesTarget[1]}**\nhttps://discord.com/invite/${data.code}`,
      })
    }
    return msg.reply({
      content: '創建失敗, 請稍後重試!',
    })
  },
}
