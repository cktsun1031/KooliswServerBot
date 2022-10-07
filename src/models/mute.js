const { model, Schema } = require('mongoose')

const ModuleSchema = new Schema({
  uId: { type: String },
  endAt: { type: Number },
  reason: { type: String },
  by: { type: String },
})
module.exports = model('mute', ModuleSchema)
