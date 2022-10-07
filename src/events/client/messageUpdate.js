const validMessageIsSpam = require('../../function/secure-chat')
const { wordsGame } = require('../../function/channelAction')

module.exports = async (client, oMessage, nMessage) => {
  if (oMessage.partial) await oMessage.fetch().catch(() => null)
  if (
    ['DEFAULT', 'REPLY'].includes(nMessage.type)
    && !nMessage.webhookID
    && nMessage.author.id !== client.user.id
    && nMessage.guild
  ) validMessageIsSpam(nMessage, 'E')
  if (nMessage.channel.id === '858356212302741535') {
    const re = /[^A-Za-z]/
    if (re.test(nMessage.content)) return nMessage.delete()
    if (
      oMessage.content !== nMessage.content
      && nMessage.channel.lastMessageId === nMessage.id
    ) wordsGame(nMessage, 'E')
  }
}
