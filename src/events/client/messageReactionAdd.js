const { MessageEmbed } = require('discord.js')
const toEmoji = require('emoji-name-map')

module.exports = async (client, reaction, user) => {
  if (
    ['835046321953964042', '763747109366792192'].includes(
      reaction.message.channel.id,
    )
  ) {
    if (reaction.partial) await reaction.fetch().catch(() => null)
    if (reaction.message.partial) {
      await reaction.message.fetch().catch(() => null)
    }
    if (reaction.message.author.id !== user.id) return
    if (
      [toEmoji.get(':+1:'), toEmoji.get(':-1:')].includes(reaction.emoji.name)
    ) {
      reaction.users.remove(user)
      return user
        .send({
          embeds: [
            new MessageEmbed()
              .setTitle('<:cross:846642539436310559> 抱歉，發生錯誤！')
              .setDescription('你無法讚好及評價自己提出的建議。')
              .setColor('RED'),
          ],
        })
        .catch(() => null)
    }
  }
}
