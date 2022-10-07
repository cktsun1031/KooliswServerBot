const { colour } = require('../config/roles.json')

const matchList = {
  RED: '743398997556985927',
  ORANGE: '743137731554705468',
  YELLOW: '741188609805254757',
  GREEN: '743399491092217964',
  PB: '743400449390149634',
  BLUE: '743399570289066017',
  PURPLE: '743399657085993070',
  BLACK: '743399868793487430',
  WHITE: '743451782243680416',
}
const mtd = new Set([
  'RED',
  'ORANGE',
  'YELLOW',
  'GREEN',
  'PB',
  'BLUE',
  'PURPLE',
  'BLACK',
  'WHITE',
])

module.exports = {
  id: 'colourRoles',
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
        for (let index = 0, l = colour.length; index < l; index++) {
          if (member.roles.cache.has(colour[index][1])) {
            member.roles.remove(colour[index][1])
          }
        }
        return inter.reply({
          content: '移除成功!',
          ephemeral: true,
        })
      }
      case mtd.has(selectedValue): {
        for (let index = 0, l = colour.length; index < l; index++) {
          if (
            member.roles.cache.has(colour[index][1])
            && colour[index][1] !== matchList[selectedValue]
          ) {
            member.roles.remove(colour[index][1])
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
