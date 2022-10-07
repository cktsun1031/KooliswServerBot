const { sNickname } = require('../../function/secure-server')

module.exports = async (client, om, gm) => {
  if (om.nickname !== gm.nickname) sNickname(gm)
}
