const axios = require('axios')
const { noblox } = require('../robloxClient')

async function getLinkedUser(id, guildId) {
  const bloxlinkData = await axios
    .get(`https://api.blox.link/v1/user/${id}?guild=${guildId}`)
    .catch(() => null)
  if (bloxlinkData?.data?.status === 'ok') return bloxlinkData.primaryAccount
  const roverData = await axios
    .get(`https://verify.eryn.io/api/user/${id}`)
    .catch(() => null)
  if (roverData?.data?.status !== 'ok') return null
  return roverData.robloxId
}

const updateRankBothGroup = async (id, guildId) => {
  const robloxUserID = await getLinkedUser(id, guildId).catch(() => null)
  if (!robloxUserID) return false
  const groups = await noblox.getGroups(robloxUserID).catch(() => null)
  if (!groups) return
  let kooNumber = 0
  let dracNumber = 0
  for (let index = 0, l = groups.length; index < l; index++) {
    if (groups[index].Id === 7_177_496) kooNumber += 1
    else if (groups[index].Id === 4_764_660) dracNumber += 1
    if (kooNumber >= 1 && dracNumber >= 1) break
  }
  if (kooNumber === 0 && dracNumber === 0) return false
  if (kooNumber === 1) {
    const rankId = await noblox
      .getRankInGroup(7_177_496, robloxUserID)
      .catch(() => null)
    if (rankId < 2) {
      await noblox.setRank(7_177_496, robloxUserID, 2).catch(() => null)
    }
  }
  if (dracNumber === 1) {
    const rankId = await noblox
      .getRankInGroup(4_764_660, robloxUserID)
      .catch(() => null)
    if (rankId < 2) {
      await noblox.setRank(4_764_660, robloxUserID, 2).catch(() => null)
    }
  }
  return true
}

module.exports = {
  getLinkedUser,
  updateRankBothGroup,
}
