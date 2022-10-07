const { MessageEmbed } = require('discord.js')
const {
  commandsDisabled,
  globalCmdDisabled,
} = require('../../config/blocked_channel.json')
const { parseSec2Word, handleWWCmd } = require('../../function/tool')
const validMessageIsSpam = require('../../function/secure-chat')
const markAsMessage = require('../../function/msg-counter')
const channelFormat = require('../../function/channelformatting')

module.exports = async (client, message) => {
  const {
    channel, guild, author, content,
  } = message
  if (message.webhookID || author.id === client.user.id) return
  if (message.partial) await message.fetch()
  if (guild) {
    if (!message.member) {
      const member = await guild.members.fetch(author.id).catch(() => {})
      if (!member) return
    }
    channelFormat(message)
    if (author.bot) return
    markAsMessage(message)
    validMessageIsSpam(message)
  }
  if (author.bot) return
  const prefixRe = /^(<@!?823929677612712006>|k!|K!)/
  const prefixes = content.match(prefixRe)
  if (prefixes) {
    const [prefix] = prefixes
    const messageCont = prefix === 'k!'
      ? content.slice(prefix.length)
      : content.slice(prefix.length).trim()
    if (!messageCont) return
    const command = messageCont.split(' ')[0]
    let cmd = client.commands.get(command)
      ?? client.commands.get(client.aliases.get(command))
      ?? undefined
    if (
      !cmd?.allChannelAccess
      && (channel.isThread()
        || commandsDisabled.includes(channel.id)
        || globalCmdDisabled.includes(channel.id))
    ) return
    if (!cmd) {
      const guessS = await handleWWCmd(message, command)
      if (!guessS) return
      message.createdTimestamp += guessS[1]
      cmd = client.commands.get(guessS[0])
    }
    const arguments_ = messageCont.split(' ').slice(1)
    if (arguments_[0] === 'help') {
      if (author.id !== '611804698856521728' && cmd.private) return
      const embed1 = new MessageEmbed().setTitle(`指令: ${cmd.name}`).addFields(
        {
          name: '說明',
          value: cmd.desc ?? 'N/A',
          inline: true,
        },
        {
          name: '類別',
          value: cmd.category,
          inline: true,
        },
        {
          name: '冷卻時間',
          value: `${cmd.cooldown / 1000 || '1'}秒`,
          inline: false,
        },
        {
          name: '全局允許使用',
          value: cmd.allChannelAccess ? '是' : '否',
          inline: false,
        },
        {
          name: '使用方法',
          value: `\`\`\`${cmd.usage ?? `k!${cmd.name}`}\`\`\``,
          inline: false,
        },
      )
      return message.reply({ embeds: [embed1] })
    }
    if (!message.guild && !cmd?.dmAllowed) return
    const cooldowns = client.cooldown
    const now = Date.now()
    if (cmd.intervalLimit) {
      const limits = cmd.intervalLimit
      const cdKey1 = cmd.intervalLimit.key ?? cmd.name
      if (limits.hour) {
        const cdKeyHere = `CMDCDHR_${author.id}_${cdKey1}`
        const database_cooldown = cooldowns.get(cdKeyHere) ?? 0
        if (database_cooldown >= limits.hour) {
          return message.reply({
            content: '現在處於指令冷靜期，請等待1小時後再重新嘗試！',
          })
        }
        cooldowns.set(cdKeyHere, database_cooldown + 1)
        if (database_cooldown === 0) setTimeout(() => cooldowns.delete(cdKeyHere), 60 * 60 * 1000)
      }
    }
    const keyV = `CMD_${author.id}_${cmd.name}`
    const cdAmount = cmd.cooldown ?? 1500
    if (cooldowns.has(keyV)) {
      const eT = cooldowns.get(keyV)
      if (now < eT) {
        const tL = parseSec2Word(eT - now)
        const msgwaiDel = await message.reply({
          content: `使用這個指令前，請至少等待 **${tL}**。`,
          allowedMentions: { repliedUser: true },
        })
        setTimeout(() => msgwaiDel.delete().catch(() => {}), 5500)
        return
      }
    }
    cooldowns.set(keyV, now + cdAmount)
    setTimeout(() => cooldowns.delete(keyV), cdAmount)
    try {
      return cmd.run({ msg: message, args: arguments_ })
    } catch (error) {
      console.error(error) // eslint-disable-line no-console
    }
  }
  const re = /^<@!?823929677612712006>( |)$/
  if (re.test(content)) return channel.send('嘿, 我的指令開首: `k!`')
}
