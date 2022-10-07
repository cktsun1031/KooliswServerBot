const { model, Schema } = require('mongoose')

const ModuleSchema = new Schema({
  userId: { type: String },
  warnings: { type: Array },
})

module.exports = model('warns', ModuleSchema)

/*
warnings:
{
  wId: String,
  wdBy: String,
  wdAt: Number,
  reason: String
}
*/
