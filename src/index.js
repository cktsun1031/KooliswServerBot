const { Client, Intents, Collection } = require('discord.js')

const client = new Client({
  partials: ['GUILD_MEMBER', 'USER', 'MESSAGE', 'CHANNEL', 'REACTION'],
  allowedMentions: { parse: ['users', 'roles'], repliedUser: false },
  intents: new Intents(32_767),
})

module.exports = client
client.config = require('./config.json')

client.commands = new Collection()
client.slashcommands = new Collection()
client.aliases = new Collection()
client.cooldown = new Collection()
client.buttons = new Collection()
client.menus = new Collection()

client.login(process.env.TOKEN)
// 
process.on('uncaughtException', console.error) // eslint-disable-line no-console
process.on('unhandledRejection', console.error) // eslint-disable-line no-console
process.on('SIGTERM', () => client.destroy())
process.on('exit', () => client.destroy())
process.on('SIGINT', () => client.destroy())

const mongoose = require('mongoose')
const StarboardsManager = require('discord-starboards')
const eventDB = require('./models/eventJobs')

mongoose.connect(`${process.env.MONGO_DB}Bot`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: true,
})

const StarboardsManagerCustomDatabase = class extends StarboardsManager {
  async getAllStarboards() {
    const allstb = await eventDB.findOne({
      Name: 'starboardcfg',
    })
    return allstb.Data
  }

  async saveStarboard(data) {
    await eventDB.findOneAndUpdate(
      {
        Name: 'starboardcfg',
      },
      { $push: { Data: data } },
    )
    return true
  }

  async deleteStarboard(channelID, emoji) {
    const allstb = await eventDB.findOne({
      Name: 'starboardcfg',
    })
    const newStarboardsArray = allstb.Data.filter(
      (starboard) => !(
        starboard.channelID === channelID && starboard.options.emoji === emoji
      ),
    )
    allstb.Data = newStarboardsArray
    await allstb.save().catch(() => null)
    return true
  }

  async editStarboard(channelID, emoji, data) {
    const allstb = await eventDB.findOne({
      Name: 'starboardcfg',
    })
    const newStarboardsArray = allstb.Data.filter(
      (starboard) => !(
        starboard.channelID === channelID && starboard.options.emoji === emoji
      ),
    )
    newStarboardsArray.push(data)
    allstb.Data = newStarboardsArray
    await allstb.save().catch(() => null)
    return true
  }
}
client.starboardsManager = new StarboardsManagerCustomDatabase(client, {
  storage: false,
  translateClickHere: '轉跳至這條訊息',
})

require('./robloxClient')
require('./server/index')
require('./handler/loader')(client)
require('./handler/client-event')(client)
