const { MessageEmbed } = require('discord.js')
const { transferTimeToChinese } = require('../../function/tool')
const { emojis } = require('../../config.json')

module.exports = {
  name: 'report',
  desc: '舉報用戶訊息，只限該訊息對應的頻道',
  usage: 'k!report [舉報訊息ID]',
  run: async ({ msg, args }) => {
    msg.delete()
    const embed = new MessageEmbed()
    const msgid = args[0]
    const fetchedmsg = await msg.channel.messages.fetch(msgid).catch(() => null)
    if (!fetchedmsg) {
      embed
        .setColor('RED')
        .setTitle(`${emojis.cross} 無法獲取訊息!`)
        .setDescription(`請使用正確方式: \`${module.exports.usage}\``)
      const messageAwaitDel = await msg.channel.send({ embeds: [embed] })
      return setTimeout(() => messageAwaitDel.delete(), 5000)
    }
    const reason = args.slice(1).join(' ') || 'N/A'
    const {
      content, id, channel, author, attachments,
    } = fetchedmsg
    const contentMessage = content ?? 'N/A'
    let desc = `**訊息 ID:** \`${id}\` [轉跳到訊息](${
      fetchedmsg.url
    })\n**頻道:** <#${channel.id}>\n**被舉報用戶:** <@!${
      author.id
    }> (${`${author.username}#${author.discriminator}`})\n**用戶 ID:** \`${
      author.id
    }\`\n**發送於:** \`${transferTimeToChinese(
      fetchedmsg.createdTimestamp,
    )}\`\n**内容:** \n\`\`\`${contentMessage}\`\`\`\n`
    let number_ = 1
    const atta = attachments.first() ? attachments.first().proxyURL : null
    if (fetchedmsg._edits) {
      for (const message of [...fetchedmsg._edits].reverse()) {
        let timed = ''
        if (message.editedTimestamp > 0) {
          timed = transferTimeToChinese(message.editedTimestamp)
        }
        desc += `**編輯(${number_}):** ${timed}\n\`\`\`${message.content}\`\`\`\n`
        number_ += 1
      }
    }
    if (atta) {
      desc += '**附件:**\n'
      for (const attachment of attachments) {
        desc += `${desc + attachment.proxyURL}\n`
      }
    }
    desc += `原因: \`\`\`${reason}\`\`\``
    embed
      .setAuthor({
        name: `${msg.author.username}#${msg.author.discriminator}`,
        iconURL: msg.author.displayAvatarURL(),
      })
      .setDescription(desc)
    if (atta) embed.setImage(atta)
    return msg.client.channels.cache
      .get('866569677223886888')
      .send({ embeds: [embed] })
  },
}
