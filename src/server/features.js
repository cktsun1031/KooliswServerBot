const router = require('express').Router()
const path = require('path')
const eventDB = require('../models/eventJobs')

router.get('/countingGame', async (request, res) => {
  const cg = await eventDB.findOne({
    Name: 'countingGame',
  })
  if (!cg) return res.send('404')
  return res.render(path.resolve('./src/server/html/counting.html'), {
    num: cg.Data,
  })
})

router.get('/wordsGame', async (request, res) => {
  const lowg = await eventDB.findOne({
    Name: 'letterOfWordsGame',
  })
  if (!lowg) return res.send('404')
  return res.render(path.resolve('./src/server/html/wordsGame.html'), {
    lr: lowg.Data,
  })
})

module.exports = router
