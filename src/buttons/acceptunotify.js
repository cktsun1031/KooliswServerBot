const Lvl = require('../models/level')

module.exports = {
  id: 'acceptUpgradeNotify',
  async run(inter) {
    await Lvl.findOneAndUpdate(
      {
        userId: inter.user.id,
        guildId: '687219262406131714',
      },
      {
        levelUpNotify: true,
      },
    )
    await inter.deferUpdate()
    return inter.message.edit({
      content:
        '非常感謝, 你將會在聊天升等時持續收到通知!你隨時可以關閉這項通知設定!',
      components: [],
    })
  },
}
