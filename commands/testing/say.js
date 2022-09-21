const { SlashCommandBuilder } = require('discord.js');
const { userIds } = require('../../config.json');


const allowedUsers = [userIds.Simon];

module.exports = {
   data: new SlashCommandBuilder()
      .setName('say')
      .setDescription('Tell me what I need to say.')
      .addStringOption(option => option
         .setName('input')
         .setDescription('The thing I need to say.')
         .setRequired(true)),
   async execute(interaction) {
      const input = interaction.options.getString('input');

      if (allowedUsers.includes(interaction.user.id)) {
         await interaction.channel.send(input);
         return await interaction.reply({ content: 'Done', ephemeral: true });
      }

      return await interaction.reply({ content: input, ephemeral: true });
   },
};