const glob = require('glob')
const { basename, dirname, join } = require('path')
const { cache } = require('../plugins/globalCache')

module.exports = (client) => {
  const pathCmd = join(__dirname, '../commands/**/*')
  glob(pathCmd, (error, allFiles) => {
    const allCmdList = []
    const allCmdwCList = {
      general: [],
      moderations: [],
      rank: [],
      tickets: [],
      tools: [],
    }
    for (let index = 0, l = allFiles.length; index < l; index++) {
      const filePath = allFiles[index]
      if (filePath.endsWith('.js')) {
        const command = require(filePath)
        command.category = basename(dirname(filePath))
        client.commands.set(command.name, command)
        if (!command.private) {
          allCmdwCList[command.category].push(command.name)
          allCmdList.push(command.name)
        }
        if (command.aliases) {
          for (const al of command.aliases) {
            client.aliases.set(al, command.name)
          }
        }
        delete require.cache[require.resolve(filePath)]
      }
    }
    cache.set('cmdL', allCmdList)
    cache.set('cmdLC', allCmdwCList)
    let content = '歡迎使用本機器人, 我的指令開首: `k!`\n使用 `k!help [指令]` 查詢個別內容\n以下將會列出這個機器人的所有指令和某些主要指令的詳細資料。\n\n**__等級 Leveling :__**\n'
    for (const da of allCmdwCList.rank) content += `\`${da}\` `
    content += '\n\n**__特別功能 Special Features :__**\n'
    for (const da of allCmdwCList.tools) content += `\`${da}\` `
    content += '\n\n**__開票功能 Tickets :__**\n'
    for (const da of allCmdwCList.tickets) content += `\`${da}\` `
    content += '\n\n**__管理功能 Moderations :__**\n'
    for (const da of allCmdwCList.moderations) content += `\`${da}\` `
    content += '\n\n**__基本資訊 Basic Bot Infomations :__**\n'
    for (const da of allCmdwCList.general) content += `\`${da}\` `
    content += '\n\n特別注意，某些指令適合在斜線指令的整合使用。'
    cache.set('cmdHelpLC', content)
  })
  const pathButton = join(__dirname, '../buttons/**/*')
  glob(pathButton, (error, allFiles) => {
    for (let index = 0, l = allFiles.length; index < l; index++) {
      if (allFiles[index].endsWith('.js')) {
        const button = require(allFiles[index])
        client.buttons.set(button.id, button)
        delete require.cache[require.resolve(allFiles[index])]
      }
    }
  })
  const pathMenus = join(__dirname, '../menus/**/*')
  glob(pathMenus, (error, allFiles) => {
    for (let index = 0, l = allFiles.length; index < l; index++) {
      if (allFiles[index].endsWith('.js')) {
        const menu = require(allFiles[index])
        client.menus.set(menu.id, menu)
        delete require.cache[require.resolve(allFiles[index])]
      }
    }
  })
}
