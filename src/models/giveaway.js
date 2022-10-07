const { model, Schema } = require('mongoose')

const sch = new Schema({
  mId: { type: String },
  cId: { type: String },
  hrId: { type: String },
  ctAt: { type: Number },
  endAt: { type: Number },
  jrs: { type: Array, default: [] },
  bl: { type: Array, default: [] },
  reqirement: {
    roleId: { type: String, default: null },
    msgTl: { type: Number, default: 0 },
    msgWy: { type: Number, default: 0 },
    lvl: { type: Number, default: 0 },
  },
})

module.exports = model('giveaways', sch)
