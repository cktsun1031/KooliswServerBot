module.exports = {
  id: 'reboot',
  async run(inter) {
    await inter.deferUpdate()
    return process.exit()
  },
}
