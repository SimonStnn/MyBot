const { SlashCommandBuilder } = require("discord.js");

module.exports = {
   data: new SlashCommandBuilder()
      .setName('timeout')
      .setDescription('Tell me what I need to say.')
      .addUserOption((option) =>
         option
            .setName('target')
            .setDescription('Person to timeout.')
            .setRequired(true)
      )
      .addNumberOption((option) =>
         option
            .setName('length')
            .setDescription('Enter length of timeout in ms.')
            .setRequired(true)
      ),
   reqPerms: ['MODERATE_MEMBERS'],
   async execute(interaction) {
      const member = interaction.options.getMember('target');
      const time = interaction.options.getNumber('num');
      if (!member.kickable) {
         return await interaction.reply({
            content: `You can't time out ${member}`,
            ephemeral: true,
         });
      }

      member.timeout(time);
      return await interaction.reply({
         content: `Timed out ${member}`,
         ephemeral: true,
      });
   },
};
