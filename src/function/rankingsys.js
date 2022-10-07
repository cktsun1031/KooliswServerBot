const Lvl = require('../models/level')
const { msgMathRate } = require('../config.json')

const createOrGetUser = async (usrId, serId) => {
  if (serId !== '687219262406131714') return
  const databaseUser = await Lvl.findOne({ userId: usrId, guildId: serId })
  if (databaseUser) return databaseUser
  const newUser = new Lvl({
    userId: usrId,
    guildId: serId,
  })
  await newUser.save().catch(() => null)
  return newUser
}

const joinOrLeaveAction = async (usrId, serId, mode = 'JOIN') => {
  if (serId !== '687219262406131714') return
  const databaseUser = await Lvl.findOne({ userId: usrId, guildId: serId })
  if (!databaseUser) return
  switch (mode) {
    case 'JOIN': {
      databaseUser.delAfter = null
      await databaseUser.save().catch(() => null)
      return true
    }
    case 'LEAVE': {
      databaseUser.delAfter = Date.now() + 1000 * 60 * 60 * 24 * 60
      await databaseUser.save().catch(() => null)
      return true
    }
  }
}

const solveMessageUsr = async (usrId, serId, add = true) => {
  if (serId !== '687219262406131714') return
  const userDB = await createOrGetUser(usrId, serId)
  let returnS = 'N/A'
  if (add) {
    if (userDB.disabled) return [userDB, 'DBD']
    userDB.weeklyMsg += 1
    userDB.totalMsg += 1
  }
  const thisLevel = Math.floor(msgMathRate * Math.sqrt(userDB.totalMsg))
  if (userDB.level < thisLevel) {
    userDB.level = thisLevel
    returnS = 'LP'
  }
  await userDB.save().catch(() => null)
  return [userDB, returnS]
}

module.exports = {
  solveMsgUsr: solveMessageUsr,
  createOrGetUser,
  joinOrLeaveAction,
}
