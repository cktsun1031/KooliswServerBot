const { model, Schema } = require('mongoose')

const TicketSchema = new Schema({
  cId: { type: String },
  uId: { type: String },
  topc: { type: Boolean, default: false },
  secErd: { type: Boolean, default: false },
  tpId: { type: String },
  seId: { type: String, default: 0 },
})
module.exports = model('tickets', TicketSchema)
