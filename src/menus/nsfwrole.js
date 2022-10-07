module.exports = {
  id: 'nsfwRole',
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
    const roleId = '829968961206222878'
    switch (selectedValue) {
      case 'rm': {
        if (member.roles.cache.has(roleId)) member.roles.remove(roleId)
        return inter.reply({
          content: '移除成功!',
          ephemeral: true,
        })
      }
      case 'add': {
        if (!member.roles.cache.has(roleId)) member.roles.add(roleId)
        return inter.reply({
          content: `已成功添加身份組: <@&${roleId}>!`,
          ephemeral: true,
        })
      }
      default:
    }
  },
}
