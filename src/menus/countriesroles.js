const { countries } = require('../config/roles.json')

const matchList = {
  HK: '782541534322098216',
  CN: '888016072257716254',
  TW: '782541838652669964',
  MO: '782541936426614814',
  MY: '782541663082905631',
  UK: '892336913426571284',
}
const mtd = new Set(['HK', 'CN', 'TW', 'MO', 'MY', 'UK'])

module.exports = {
  id: 'countriesRoles',
  cooldown: 1000 * 25,
  async run(inter) {
    const { member, values } = inter
    if (!member.roles.cache.has('687220191121375236')) {
      return inter.reply({
        content: '缺少獲取身份組的資格權限!',
        ephemeral: true,
      })
    }
    const [selectedValue] = values
    switch (true) {
      case selectedValue === 'rmALL': {
        for (let index = 0, l = countries.length; index < l; index++) {
          if (member.roles.cache.has(countries[index][1])) {
            member.roles.remove(countries[index][1])
          }
        }
        return inter.reply({
          content: '移除成功!',
          ephemeral: true,
        })
      }
      case mtd.has(selectedValue): {
        for (let index = 0, l = countries.length; index < l; index++) {
          if (
            member.roles.cache.has(countries[index][1])
            && countries[index][1] !== matchList[selectedValue]
          ) {
            member.roles.remove(countries[index][1])
          }
        }
        await member.roles.add(matchList[selectedValue])
        return inter.reply({
          content: `已成功添加身份組: <@&${matchList[selectedValue]}>!`,
          ephemeral: true,
        })
      }
      default:
    }
  },
}
