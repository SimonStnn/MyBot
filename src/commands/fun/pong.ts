import { SlashCommandBuilder } from 'discord.js';
import Embed from '../../protocols/embed';
import Command from '../../protocols/command';

const wait = require('util').promisify(setTimeout);

export default new Command({
   data: new SlashCommandBuilder()
      .setName('pong')
      .setDescription('Replies with Ping!'),
   async execute(client, interaction) {
      await interaction.deferReply();
      await wait(500);
      await interaction.editReply(new Embed({ content: 'Ping!' }));
   }
})