const { MessageEmbed } = require('discord.js')
const { transferTimeToChinese } = require('../function/tool')

module.exports = {
  name: '舉報訊息 Report',
  type: 3,
  globalUsage: true,
  async run({ inter }) {
    if (inter.targetType !== 'MESSAGE') return
    const embed = new MessageEmbed()
    const fetchedmsg = await inter.channel.messages
      .fetch(inter.targetId)
      .catch(() => null)
    if (!fetchedmsg) {
      embed
        .setDescription('<:cross:846642539436310559> 無法獲取訊息!')
        .setColor('RED')
      return inter.reply({
        embeds: [embed],
        ephemeral: true,
      })
    }
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
    embed.setAuthor({
      name: `${inter.user.username}#${inter.user.discriminator}`,
      iconURL: inter.user.displayAvatarURL(),
    })
    embed.setDescription(desc)
    if (atta) embed.setImage(atta)
    await inter.client.channels.cache
      .get('866569677223886888')
      .send({ embeds: [embed] })
    const embedDone = new MessageEmbed()
      .setTitle('<:tick:846643019197448234> 舉報成功 Report Succeed')
      .setDescription(
        `[轉跳到舉報訊息](${fetchedmsg.url})，請等待管理員審核該信息內容，如果發現有違規行為，將會採取行動！`,
      )
      .setColor('GREEN')
    return inter.reply({
      embeds: [embedDone],
      ephemeral: true,
    })
  },
}
