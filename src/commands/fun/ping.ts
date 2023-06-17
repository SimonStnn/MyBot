import { SlashCommandBuilder, ChatInputCommandInteraction, Client } from "discord.js";

export default {
   data: new SlashCommandBuilder()
      .setName('ping')
      .setDescription('returns the bots ping.'),
   database: false,
   async execute(client: Client, interaction: ChatInputCommandInteraction) {
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
