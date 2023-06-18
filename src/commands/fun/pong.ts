import { SlashCommandBuilder, ChatInputCommandInteraction, Client } from 'discord.js';
import Embed from '../../protocols/embed';
import Command from '../../protocols/command';

const wait = require('util').promisify(setTimeout);

export default new Command(
   new SlashCommandBuilder()
      .setName('pong')
      .setDescription('Replies with Ping!'),
   async (client, interaction)=> {
      await interaction.deferReply();
      await wait(500);
      await interaction.editReply(new Embed({ content: 'Ping!' }));
   },
)