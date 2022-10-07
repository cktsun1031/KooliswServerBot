const { model, Schema } = require('mongoose')

const VfSchema = new Schema({
  uId: { type: String },
  eAt: {
    type: Date,
    default: Date.now() + 60_000 * 24 * 183,
  },
})
module.exports = model('verifyusrs', VfSchema)
