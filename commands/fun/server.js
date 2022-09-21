const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { colors } = require('../../config.json');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('server')
      .setDescription('Display info about this server.'),
   async execute(interaction) {
      const serverEmbed = new EmbedBuilder()
         .setColor(colors.command)
         .setTitle(`Info about ${interaction.guild.name}.`)
         .addFields({
            name: `Total members: `,
            value: `This server has ${interaction.guild.memberCount} members.`,
         })
         .setThumbnail(interaction.guild.iconURL())
         .setTimestamp()
         .setFooter({
            text: `${interaction.user.tag}`,
            iconURL: `${interaction.user.displayAvatarURL({ dynamic: true })}`,
         });

      return await interaction.reply({ embeds: [serverEmbed] });
   },
};
