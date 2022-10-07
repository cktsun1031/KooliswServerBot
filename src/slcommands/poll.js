const { MessageEmbed } = require('discord.js')
const toEmoji = require('emoji-name-map')

const allLtr = [
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'keycap_ten',
]

module.exports = {
  name: 'poll',
  description: '創建投票活動!',
  options: [
    {
      name: 'question',
      description: '投票活動問題',
      required: true,
      type: 'STRING',
    },
    {
      name: 'option1',
      description: '投票選項 1',
      required: false,
      type: 'STRING',
    },
    {
      name: 'option2',
      description: '投票選項 2',
      required: false,
      type: 'STRING',
    },
    {
      name: 'option3',
      description: '投票選項 3',
      required: false,
      type: 'STRING',
    },
    {
      name: 'option4',
      description: '投票選項 4',
      required: false,
      type: 'STRING',
    },
    {
      name: 'option5',
      description: '投票選項 5',
      required: false,
      type: 'STRING',
    },
    {
      name: 'option6',
      description: '投票選項 6',
      required: false,
      type: 'STRING',
    },
    {
      name: 'option7',
      description: '投票選項 7',
      required: false,
      type: 'STRING',
    },
    {
      name: 'option8',
      description: '投票選項 8',
      required: false,
      type: 'STRING',
    },
    {
      name: 'option9',
      description: '投票選項 9',
      required: false,
      type: 'STRING',
    },
    {
      name: 'option10',
      description: '投票選項 10',
      required: false,
      type: 'STRING',
    },
  ],
  type: 1,
  async run({ inter, args }) {
    const optionsAll = args
    const [title] = optionsAll
    if (!optionsAll[1]) {
      await inter.reply({
        content: `:bar_chart: **${title}**`,
      })
      const replied = await inter.fetchReply()
      await replied.react(toEmoji.get(':+1:'))
      return replied.react(toEmoji.get(':-1:'))
    }
    optionsAll.shift()
    let content = ''
    for (let index = 0, l = optionsAll.length; index < l; index++) {
      content += `:${allLtr[index]}: ${optionsAll[index]}`
      if (index < optionsAll.length - 1) content += '\n'
    }
    await inter.reply({
      content: `:bar_chart: **${title}**`,
      embeds: [new MessageEmbed().setDescription(content)],
    })
    const replied = await inter.fetchReply()
    for (let index = 0, l = optionsAll.length; index < l; index++) {
      replied.react(toEmoji.get(`:${allLtr[index]}:`))
    }
  },
}
