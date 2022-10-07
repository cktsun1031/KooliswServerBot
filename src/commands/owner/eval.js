const clean = (text) => {
  if (typeof text === 'string') {
    return text
      .replace(/`/g, `\`${String.fromCodePoint(8203)}`)
      .replace(/@/g, `@${String.fromCodePoint(8203)}`)
  }
  return text
}

module.exports = {
  name: 'eval',
  allChannelAccess: true,
  private: true,
  dmAllowed: true,
  run: async ({ msg, args }) => {
    if (msg.author.id !== '611804698856521728') return
    try {
      const code = args.join(' ')
      let evaled = eval(code)
      if (typeof evaled !== 'string') evaled = require('util').inspect(evaled)
      // eslint-disable-next-line no-console
      if (evaled.length > 1999) return console.log(evaled)
      return msg.channel.send({ content: `\`\`\`${clean(evaled)}\`\`\`` })
    } catch (error) {
      // eslint-disable-next-line no-console
      if (error.length > 1999) return console.log(error)
      return msg.channel.send(`\`ERROR\` \`\`\`xl\n${clean(error)}\n\`\`\``)
    }
  },
}
