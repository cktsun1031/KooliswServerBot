const glob = require('glob')

module.exports = (client) => {
  glob('./slcommands/**/*', (error, allFiles) => {
    for (let index = 0, l = allFiles.length; index < l; index++) {
      if (allFiles[index].endsWith('.js')) {
        const command = require(`.${allFiles[index]}`)
        client.slashcommands.set(command.name, command)
        client.guilds.cache.get('687219262406131714').commands.create({
          name: command.name,
          description: command.description,
          options: command.options,
          type: command.type,
          defaultPermission: command.defaultPermission ?? null,
        })
        delete require.cache[require.resolve(`.${allFiles[index]}`)]
      }
    }
  })
}
