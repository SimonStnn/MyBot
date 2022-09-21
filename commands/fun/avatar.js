const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { colors } = require('../../config.json');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('avatar')
      .setDescription(
         'Get the avatar URL of the selected user, or your own avatar.'
      )
      .addUserOption((option) =>
         option.setName('target').setDescription("The user's avatar to show")
      ),
   async execute(interaction) {
      const embed = new EmbedBuilder()
         .setColor(colors.command)
         .setTimestamp()
         .setFooter({
            text: `${interaction.user.tag}`,
            iconURL: `${interaction.user.displayAvatarURL({ dynamic: true })}`,
         });

      var userId = interaction.user.id;
      var userURL = interaction.user.displayAvatarURL({ dynamic: true });

      const user = interaction.options.getUser('target');
      if (user) {
         userURL = user.displayAvatarURL({ dynamic: true });
         userId = user.id;
      }
      embed.setImage(`${userURL}`).setDescription(`<@${userId}>'s avatar.`);

      await interaction.reply({ embeds: [embed] });
   },
};
