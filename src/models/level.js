const { model, Schema } = require('mongoose')

const LevelSchema = new Schema({
  userId: { type: String, index: true },
  guildId: { type: String, index: true },
  totalMsg: { type: Number, default: 0 },
  weeklyMsg: { type: Number, default: 0 },
  level: { type: Number, default: 0 },
  prevHasActiveRole: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  delAfter: { type: Schema.Types.Mixed, default: null },
  levelUpNotify: { type: Schema.Types.Mixed, default: { first: true } },
  weeklyHis: { type: Array, default: [] },
})
LevelSchema.index({ userId: 1, guildId: 1 }, { background: true, unique: true })
module.exports = model('ranks', LevelSchema)
