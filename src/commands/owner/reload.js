const path = require('path')
const glob = require('glob')
const { cache } = require('../../plugins/globalCache')

module.exports = {
  name: 'reload',
  private: true,
  run: async ({ msg }) => {
    if (msg.author.id !== '611804698856521728') return
    msg.delete()
    const { client } = msg
    client.commands.clear()
    client.buttons.clear()
    client.menus.clear()
    client.slashcommands.clear()
    glob('./commands/**/*', async (error, allFiles) => {
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
          delete require.cache[require.resolve(`.${filePath}`)]
          const command = require(`.${filePath}`)
          command.category = path.basename(path.dirname(filePath))
          client.commands.set(command.name, command)
          if (!command.private) {
            allCmdwCList[command.category].push(command.name)
            allCmdList.push(command.name)
          }
          if (command.aliases) {
            for (const al of command.aliases) client.aliases.set(al, command.name)
          }
        }
      }
      cache.set('cmdL', allCmdList)
      cache.set('cmdLC', allCmdwCList)
    })

    glob('./slcommands/**/*', async (error, allFiles) => {
      for (let index = 0, l = allFiles.length; index < l; index++) {
        const filePath = allFiles[index]
        if (filePath.endsWith('.js')) {
          delete require.cache[require.resolve(`.${filePath}`)]
          const command = require(`.${filePath}`)
          client.slashcommands.set(command.name, command)
        }
      }
    })

    glob('./buttons/**/*', async (error, allFiles) => {
      for (let index = 0, l = allFiles.length; index < l; index++) {
        const filePath = allFiles[index]
        if (filePath.endsWith('.js')) {
          delete require.cache[require.resolve(`.${filePath}`)]
          const button = require(`.${filePath}`)
          client.buttons.set(button.id, button)
        }
      }
    })

    glob('./menus/**/*', async (error, allFiles) => {
      for (let index = 0, l = allFiles.length; index < l; index++) {
        const filePath = allFiles[index]
        if (filePath.endsWith('.js')) {
          delete require.cache[require.resolve(`.${filePath}`)]
          const menu = require(`.${filePath}`)
          client.menus.set(menu.id, menu)
        }
      }
    })
  },
}
