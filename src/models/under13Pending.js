const { model, Schema } = require('mongoose')

const U13Schema = new Schema({
  UserId: { type: String },
  Tag: { type: String },
  Avatar: { type: String },
  Timing: {
    rd: { type: Number },
    et: { type: Number },
  },
  Link: { type: String },
})
module.exports = model('u13pendings', U13Schema)
