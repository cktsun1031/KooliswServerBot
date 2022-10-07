const sNickname = (gm) => {
  const re1 = /((|https?:\/\/)(discord\.gg|discord\.com\/invite|discordapp\.com\/invite))\/\S+/
  if (!re1.test(gm.nickname)) return
  return gm.setNickname(null)
}

module.exports = {
  sNickname,
}
