const { parse, join } = require('path')
const glob = require('glob')

module.exports = (client) => {
  const paa = join(__dirname, '../events/client/*')
  glob(paa, (error, allFiles) => {
    for (let index = 0, l = allFiles.length; index < l; index++) {
      const filePath = allFiles[index]
      if (filePath.endsWith('.js')) {
        const file = require(filePath)
        const fileName = parse(filePath).name
        if (file?.once === true) client.once(fileName, file.bind(null, client))
        else client.on(fileName, file.bind(null, client))
        delete require.cache[require.resolve(filePath)]
      }
    }
  })
}
