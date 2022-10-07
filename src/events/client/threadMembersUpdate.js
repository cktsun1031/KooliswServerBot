module.exports = async (client, oldMembers) => {
  if (oldMembers.first()?.id === client.user.id) {
    const thread = client.channels.cache
      .get(oldMembers.first().thread.parentId)
      .threads.cache.find((trd) => trd.id === oldMembers.first().thread.id)
    thread.join(',')
  }
}
