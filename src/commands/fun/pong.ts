import { SlashCommandBuilder, ChatInputCommandInteraction, Client } from 'discord.js';

const wait = require('util').promisify(setTimeout);

export default {
   data: new SlashCommandBuilder()
      .setName('pong')
      .setDescription('Replies with Ping!'),
   async execute(client: Client,interaction: ChatInputCommandInteraction) {
      await interaction.deferReply();
      await wait(500);
      await interaction.editReply({ content: 'Ping!' });
   },
};