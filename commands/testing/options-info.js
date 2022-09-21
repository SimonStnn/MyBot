const { SlashCommandBuilder } = require("discord.js");

module.exports = {
   data: new SlashCommandBuilder()
      .setName('options-info')
      .setDescription('Information about the options provided.')
      .addStringOption((option) =>
         option
            .setName('input')
            .setDescription('The input to echo back')
            .setRequired(true)
      )
      .addStringOption((option) =>
         option
            .setName('input2')
            .setDescription('The second input to echo back')
            .setRequired(false)
      ),
   reqPerms: ['ADMINISTRATOR'],
   async execute(interaction) {
      const value = interaction.options.getString('input');
      const value2 = interaction.options.getString('input2');
      return await interaction.reply(
         `The options value is: \`${value}\`, ${value2}`
      );
   },
};