const Lvl = require('../models/level')

module.exports = {
  id: 'deniedUpgradeNotify',
  async run(inter) {
    await Lvl.findOneAndUpdate(
      {
        userId: inter.user.id,
        guildId: '687219262406131714',
      },
      {
        levelUpNotify: false,
      },
    )
    await inter.deferUpdate()
    return inter.message.edit({
      content:
        '好吧, 你將不會在升等時收到通知! 你隨時可以重新啟動這項通知設定!',
      components: [],
    })
  },
}
