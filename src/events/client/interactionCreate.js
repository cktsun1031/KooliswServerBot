const { parseSec2Word } = require('../../function/tool')
const {
  globalCmdDisabled,
  commandsDisabled,
} = require('../../config/blocked_channel.json')

module.exports = async (client, inter) => {
  if (inter.guild && !inter.member) {
    await inter.guild.members.fetch(inter.user.id)
  }
  const returnOfInter = (message, ep = true) => inter.reply({ content: message, ephemeral: ep })
  let getInto = 'N/A'
  if (inter.isCommand() || inter.isContextMenu()) getInto = 'cmd'
  else if (inter.isButton()) getInto = 'button'
  else if (inter.isSelectMenu()) getInto = 'menu'
  switch (getInto) {
    case 'cmd': {
      const { commandName, options, channelId } = inter
      const slashCMD = client.slashcommands
      if (!slashCMD.has(commandName)) return returnOfInter('發生了錯誤!')
      if (globalCmdDisabled.includes(channelId)) {
        return returnOfInter('你不被允許在這條頻道使用指令!')
      }
      const slCmd = slashCMD.get(commandName)
      if (
        !slCmd?.globalUsage
        && (inter.channel.isThread() || commandsDisabled.includes(channelId))
      ) {
        return returnOfInter('你不被允許在這條頻道使用指令!')
      }
      const cooldowns = client.cooldown
      const keyV = `SLCMD_${inter.user.id}_${commandName}`
      const now = Date.now()
      if (cooldowns.has(keyV)) {
        const eT = cooldowns.get(keyV)
        if (now < eT) {
          const timeLeft = parseSec2Word(eT - now)
          return inter.reply({
            content: `使用這個指令前，請至少等待 **${timeLeft}** 。`,
            ephemeral: true,
          })
        }
      }
      const arguments_ = []
      for (let index = 0, l = options.data.length; index < l; index++) {
        if (options.data[index].type === 'SUB_COMMAND') {
          if (options.data[index].name) arguments_.push(options.data[index].name)
          for (const x of options.data[index].options) {
            if (x.value) arguments_.push(x.value)
          }
        } else if (options.data[index].value) arguments_.push(options.data[index].value)
      }
      const cdAmount = slCmd.cooldown ?? 1500
      cooldowns.set(keyV, now + cdAmount)
      setTimeout(() => cooldowns.delete(keyV), cdAmount)
      try {
        return slCmd.run({ inter, args: arguments_ })
      } catch (error) {
        console.error(error) // eslint-disable-line no-console
      }
      break
    }
    case 'button': {
      const buttonMap = client.buttons
      const { customId } = inter
      if (!buttonMap.has(customId)) return inter.deferUpdate()
      const button = buttonMap.get(customId)
      const cooldowns = client.cooldown
      const cdAmount = button.cooldown ?? 1500
      const keyV = `BTN_${inter.user.id}_${customId}`
      const now = Date.now()
      if (cooldowns.has(keyV)) {
        const eT = cooldowns.get(keyV)
        if (now < eT) {
          const timeLeft = parseSec2Word(eT - now)
          return returnOfInter(`使用這個按鈕前，請至少等待 **${timeLeft}** 。`)
        }
      }
      if (!button?.cooldownBypass) {
        cooldowns.set(keyV, now + cdAmount)
        setTimeout(() => cooldowns.delete(keyV), cdAmount)
      }
      try {
        return button.run(inter)
      } catch (error) {
        console.log(error) // eslint-disable-line no-console
      }
      break
    }
    case 'menu': {
      const menuMap = client.menus
      const { customId, user } = inter
      if (!menuMap.has(customId)) return inter.deferUpdate()
      const menu = menuMap.get(customId)
      const cooldowns = client.cooldown
      const cdAmount = menu.cooldown ?? 1500
      const keyV = `MNU_${user.id}_${customId}`
      const now = Date.now()
      if (cooldowns.has(keyV)) {
        const eT = cooldowns.get(keyV)
        if (now < eT) {
          const timeLeft = parseSec2Word(eT - now)
          return returnOfInter(`使用前，請至少等待 **${timeLeft}** 。`)
        }
      }
      if (!menu?.cooldownBypass) {
        cooldowns.set(keyV, now + cdAmount)
        setTimeout(() => cooldowns.delete(keyV), cdAmount)
      }
      try {
        return menu.run(inter)
      } catch (error) {
        console.err(error) // eslint-disable-line no-console
      }
      break
    }
    default:
      break
  }
}
