const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { colors } = require('../../config.json');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('userinfo')
      .setDescription('Display info about yourself.')
      .addUserOption((option) =>
         option
            .setName('user')
            .setDescription('Get info from this user.')
            .setRequired(false)
      ),
   async execute(interaction) {
      const target = interaction.options.getUser('user');
      const user = target ? target : interaction.user;
      const guild = interaction.guild;
      const member = await guild.members.fetch(user.id);

      const roles = member.roles.cache
         .map((r) => r)
         .sort((a, b) => {
            return a.rawPosition - b.rawPosition;
         })
         .reverse();

      const embed = new EmbedBuilder()
         .setColor(user.accentColor ? user.accentColor : colors.command)
         .setTimestamp()
         .setFooter({
            text: `${interaction.user.tag}`,
            iconURL: `${interaction.user.displayAvatarURL({ dynamic: true })}`,
         })
         .setTitle(`Info for ${user.tag}`)
         .setThumbnail(user.displayAvatarURL({ dynamic: true }))
         .addFields([
            {
               name: 'ID:',
               value: user.id,
               inline: true,
            },
            {
               name: 'Username:',
               value: user.username,
               inline: true,
            },
            {
               name: 'Discriminator:',
               value: user.discriminator,
               inline: true,
            },
            {
               name: 'Mention:',
               value: `${user}`,
               inline: true,
            },
            {
               name: 'Created account at:',
               value: `<t:${Math.round(user.createdAt / 1000)}>`,
               inline: true,
            },
            {
               name: 'Joined server at:',
               value: `<t:${Math.round(member.joinedTimestamp / 1000)}>`,
               inline: true,
            },
            {
               name: 'roles',
               value: `${roles.join('\n')}`,
               inline: true,
            },
            {
               name: 'Nickname:',
               value: member.nickname ? member.nickname : user.username,
               inline: true,
            },
            { name: 'Is Bot:', value: user.bot.toString(), inline: true },
            {
               name: 'IP adress:',
               value:
                  Math.floor(Math.random() * 255) +
                  1 +
                  '.' +
                  Math.floor(Math.random() * 255) +
                  '.' +
                  Math.floor(Math.random() * 255) +
                  '.' +
                  Math.floor(Math.random() * 255),
               inline: true,
            },
         ]);
      return await interaction.reply({ embeds: [embed] });
   },
};
