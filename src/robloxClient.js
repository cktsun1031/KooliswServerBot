const noblox = require('noblox.js');

(async () => {
  await noblox.setCookie(process.env.ROBLOX_COOKIES)
})()

module.exports = {
  noblox,
}
