const axios = require('axios')
const stringify = require('fast-json-stringify')({
  title: 'dataActivities',
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
  description: '創建不同的語音活動!',
  options: [
    {
      name: 'channel',
      description: '請選擇你想要創建活動的語音頻道',
      required: true,
      type: 'CHANNEL',
      channeTypes: ['GUILD_VOICE'],
    },
    {
      name: 'type',
      description: '選擇活動類型',
      required: true,
      type: 'STRING',
      choices: [
        {
          name: 'YouTube Together 影片播放',
          value: 'youtube',
        },
        {
          name: 'Betrayal.io',
          value: 'betrayal',
        },
        {
          name: 'Poker Night',
          value: 'pokernight',
        },
        {
          name: 'Fishington.io',
          value: 'fishington',
        },
        {
          name: 'ChessDev',
          value: 'chessdev',
        },
        {
          name: 'Chess',
          value: 'chess',
        },
        {
          name: 'lettertile',
          value: 'lettertile',
        },
        {
          name: 'wordsnack',
          value: 'wordsnack',
        },
        {
          name: 'doodlecrew',
          value: 'doodlecrew',
        },
        {
          name: 'awkword',
          value: 'awkword',
        },
        {
          name: 'spellcast',
          value: 'spellcast',
        },
      ],
    },
  ],
  type: 1,
  async run({ inter, args }) {
    const channel = inter.client.channels.cache.get(args[0])
    if (channel.type !== 'GUILD_VOICE') {
      return inter.reply({
        content: '頻道必須是語音頻道。',
        ephemeral: true,
      })
    }
    const activitesTarget = activities[args[1]]
    const header = {
      headers: {
        Authorization: `Bot ${inter.client.token}`,
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
        `https://discord.com/api/v${inter.client.options.http.version}/channels/${channel.id}/invites`,
        jsonData,
        header,
      )
      .catch(() => null)
    if (!data) {
      return inter.reply({
        content: '創建失敗, 請稍後重試!',
      })
    }
    return inter.reply({
      content: `已在 (<#${channel.id}>)\`${channel.name}\` 頻道建立活動: **${activitesTarget[1]}**\nhttps://discord.com/invite/${data.code}`,
    })
  },
}
