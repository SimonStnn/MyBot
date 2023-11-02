import { SlashCommandBuilder } from "discord.js";
import Command from '../../protocols/command';
import Response from '../../protocols/response';

export default new Command({
   data: new SlashCommandBuilder()
      .setName('ping')
      .setDescription('returns the bots ping.'),
   async execute(client, interaction) {
      const sent = await interaction.reply(new Response({
         interaction,
         content: "Pinging...",
         fetchReply:
            true
      }));
      await interaction.editReply(
         new Response({
            interaction,
            title: 'Ping',
            content: `Websocket heartbeat: ${interaction.client.ws.ping
               }ms.\nRoundtrip latency: ${sent.createdTimestamp - interaction.createdTimestamp
               }ms`
         }
         )
      );
   }
})
