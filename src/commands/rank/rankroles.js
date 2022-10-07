const { MessageEmbed } = require('discord.js')

module.exports = {
  name: 'rankroles',
  desc: '獲取本伺服器的各個等級身份組',
  dmAllowed: true,
  run: async ({ msg }) => msg.reply({
    embeds: [
      new MessageEmbed()
        .setTitle('等級身份組 Rank Roles')
        .setDescription(
          '由 <@!823929677612712006> 制定的點數為準\n請使用指令 `k!rank` 查詢個人等級\n每週活躍: <@&691991846888407071> - `150`條每週訊息\n\n等級1: <@&856930170921287721> - `17`條總訊息\n等級2: <@&723457302996189245> - `69`條總訊息\n等級3: <@&732578012037513247> - `156`條總訊息\n等級4: <@&857178256663117865> - `278`條總訊息\n等級5: <@&858621785993510912> - `434`條總訊息\n等級10: <@&871032698444058624> - `1736`條總訊息\n等級15: <@&871033697871204382> - `3906`條總訊息\n等級20: <@&871035128527327252> - `6944`條總訊息\n等級25: <@&871034525432565861> - `10851`條總訊息\n等級30: <@&871036513499091004> - `15625`條總訊息',
        ),
    ],
  }),
}
