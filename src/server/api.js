const router = require('express').Router()
const client = require('../index')

router.get('/testConnection', async (request, res) => {
  const clientId = '926686424865058876'
  const user = await client.users.fetch(clientId).catch(() => {})
  return res.send({ succeed: user && user.id === clientId })
})

module.exports = router
