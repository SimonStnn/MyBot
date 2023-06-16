import { SlashCommandBuilder, ChatInputCommandInteraction, Client } from 'discord.js';

const wait = require('util').promisify(setTimeout);

module.exports = {
   data: new SlashCommandBuilder()
      .setName('pong')
      .setDescription('Replies with Ping!'),
   async execute(client: Client,interaction: ChatInputCommandInteraction) {
      await interaction.deferReply();
      await wait(500);
      await interaction.editReply({ content: 'Ping!' });
   },
};