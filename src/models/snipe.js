const { model, Schema } = require('mongoose')

const SnipeSchema = new Schema({
  content: {
    data: { type: String, default: null },
    image: { type: String, default: null },
  },
  date: { type: String, default: null },
  author: {
    name: { type: String, default: null },
    id: { type: String, default: null },
  },
  cId: { type: String, index: true },
})
SnipeSchema.index({ ChannelId: 1 }, { background: true, unique: true })
module.exports = model('Snipes', SnipeSchema)
