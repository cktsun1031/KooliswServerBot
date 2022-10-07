module.exports = {
  name: 'reboot',
  private: true,
  run: ({ msg }) => {
    if (msg.author.id !== '611804698856521728') return
    msg.delete()
    return process.exit()
  },
}
