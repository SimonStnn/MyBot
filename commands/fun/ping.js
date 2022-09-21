const { SlashCommandBuilder } = require("discord.js");

module.exports = {
   data: new SlashCommandBuilder()
      .setName('ping')
      .setDescription('returns the bots ping.'),
   database: false,
   async execute(interaction) {
      const sent = await interaction.reply({
         content: 'Pinging...',
         fetchReply: true,
      });
      await interaction.editReply(
         `Websocket heartbeat: ${interaction.client.ws.ping
         }ms.\nRoundtrip latency: ${sent.createdTimestamp - interaction.createdTimestamp
         }ms`
      );
   },
};
