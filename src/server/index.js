const server = require('express')()
const helmet = require('helmet')
const YtNotify = require('youtube-notify')
const bodyparser = require('body-parser')
const RLM = require('rate-limit-mongo')
const CMONGO = require('connect-mongo')
const rateLimit = require('express-rate-limit')
const { resolve, join } = require('path')
const { customAlphabet } = require('nanoid')
const sessionE = require('express-session')({
  name: 'data',
  domain: 'bot.koolisw.tk',
  rolling: true,
  store: new CMONGO({
    mongoUrl: `${process.env.MONGO_DB}Web`,
    autoRemove: 'interval',
    autoRemoveInterval: 15,
    ttl: 43_200,
  }),
  secret: process.env.SESSION_ENCRYPT_KEY,
  resave: true,
  proxy: true,
  saveUninitialized: true,
  cookie: { maxAge: 60_000 * 60 * 12, secure: true },
})
const notifyAction = require('../function/youtube-notify')

const limiter = rateLimit({
  store: new RLM({
    uri: `${process.env.MONGO_DB}Web`,
    expireTimeMs: 15 * 60 * 1000,
  }),
  max: 50,
  windowMs: 17.5 * 60 * 1000,
  handler(request, res) {
    res.status(429).sendFile(join(__dirname, './html/manyreq.html'))
  },
  keyGenerator(request) {
    return request.headers['x-forwarded-for'].split(',')[0]
  },
})
server.set('trust proxy', 1)
server.engine('html', require('ejs').renderFile)

server.use(bodyparser.urlencoded({ extended: true }))
server.disable('etag').disable('x-powered-by')
server.use(require('compression')())

const notifier = new YtNotify({
  hubCallback: 'https://bot.koolisw.tk/ync',
  secret: customAlphabet('1234567890qwertyuiopasdfghjklzxcvbnm', 7)(),
})
notifier.subscribe('UCJScqEYjfX7E1Ji5irmHIrA')
notifier.on('notified', (dt) => notifyAction(dt))
server.use('/ync', notifier.listener())

server.use(bodyparser.json())
server.use(
  helmet.referrerPolicy({
    policy: 'strict-origin-when-cross-origin',
  }),
)
server.use(
  helmet.permittedCrossDomainPolicies({
    permittedPolicies: 'master-only',
  }),
)
server.use(helmet.xssFilter())
server.use(sessionE)
server.use(require('csurf')({ cookie: false }))

server.use((error, request, res, next) => {
  if (error.code === 'EBADCSRFTOKEN') {
    return res.status(403).sendFile(resolve('./src/server/html/forbidden.html'))
  }
  if (!res.headersSent) return res.status(500).json({ message: 500 })
  return next(error)
})
server.all('/', (request, res) => res.send('OK'))
server.use(limiter)
server.use('/features', require('./features'))
server.use('/verify', require('./verification'))
server.use('/api', require('./api'))

server.use((request, res) => {
  res.setHeader('Cache-Control', 'public, max-age=86400')
  res.status(404).sendFile(resolve('./src/server/html/notfound.html'))
})
server.listen(3000)
