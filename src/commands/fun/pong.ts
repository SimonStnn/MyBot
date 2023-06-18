import { SlashCommandBuilder, ChatInputCommandInteraction, Client } from 'discord.js';
import Message from '../../protocols/message';

const wait = require('util').promisify(setTimeout);

export default {
   data: new SlashCommandBuilder()
      .setName('pong')
      .setDescription('Replies with Ping!'),
   async execute(client: Client,interaction: ChatInputCommandInteraction) {
      await interaction.deferReply();
      await wait(500);
      await interaction.editReply(new Message({ content: 'Ping!' }));
   },
};