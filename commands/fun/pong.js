const { SlashCommandBuilder } = require('discord.js');

const wait = require('util').promisify(setTimeout);

module.exports = {
   data: new SlashCommandBuilder().setName('pong').setDescription('Replies with Ping!'),
   async execute(interaction) {
      await interaction.deferReply();
      await wait(500);
      await interaction.editReply({ content: 'Ping!' });
   },
};