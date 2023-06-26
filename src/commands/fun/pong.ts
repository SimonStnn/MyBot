import { SlashCommandBuilder } from 'discord.js';
import Command from '../../protocols/command';
import Response from '../../protocols/response';

const wait = require('util').promisify(setTimeout);

export default new Command({
   data: new SlashCommandBuilder()
      .setName('pong')
      .setDescription('Replies with Ping!'),
   async execute(client, interaction) {
      await interaction.deferReply();
      await wait(500);
      await interaction.editReply(new Response({interaction, content: 'Ping!' }));
   }
})