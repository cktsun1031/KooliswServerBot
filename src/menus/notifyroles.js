const { NOTIFY_ROLES } = require('../config/roles.json')

const matchList = {
  AN: '698383228041691166',
  GN: '698386947013607434',
  YN: '868142041320783882',
  RN: '752849675643650058',
  EN: '796991027735035914',
  PN: '751673319916437514',
}

module.exports = {
  id: 'notifyRoles',
  cooldown: 1000 * 25,
  async run(inter) {
    const { member, values } = inter
    if (!member.roles.cache.has('687220191121375236')) {
      return inter.reply({
        content: '缺少獲取身份組的資格權限!',
        ephemeral: true,
      })
    }
    switch (true) {
      case values.includes('rmALL'): {
        for (let index = 0, l = NOTIFY_ROLES.length; index < l; index++) {
          if (member.roles.cache.has(NOTIFY_ROLES[index][1])) {
            member.roles.remove(NOTIFY_ROLES[index][1])
          }
        }
        return inter.reply({
          content: '身份組移除成功!',
          ephemeral: true,
        })
      }
      default: {
        if (!values && values.length === 0) return
        const allRolesAdded = []
        for (let index = 0, l = values.length; index < l; index++) {
          if (!member.roles.cache.has(matchList[values[index]])) {
            member.roles.add(matchList[values[index]])
            allRolesAdded.push(`<@&${matchList[values[index]]}>`)
          }
        }
        if (allRolesAdded.length === 0) {
          return inter.reply({
            content: '你已經擁有所選取的身份組!',
            ephemeral: true,
          })
        }
        return inter.reply({
          content: `已成功添身份組: ${allRolesAdded.join(' ,')}!`,
          ephemeral: true,
        })
      }
    }
  },
}
