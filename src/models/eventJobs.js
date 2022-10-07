const { model, Schema } = require('mongoose')

const JobsSchema = new Schema({
  Name: { type: String },
  Data: {
    type: Schema.Types.Mixed,
  },
})
JobsSchema.index({ Name: 1 }, { background: true, unique: true })
module.exports = model('Jobs', JobsSchema)
