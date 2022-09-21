const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { colors } = require('../../config.json');
const logs = require('../../files/log.js');
const music = require('../../files/music.js');

const OPTION_PAUSE = 'pause';

module.exports = {
   data: new SlashCommandBuilder()
      .setName('pause')
      .setDescription('Pause the current track.'),
   //    .addBooleanOption((option) =>
   //       option
   //          .setName(OPTION_PAUSE)
   //          .setDescription('true to pause, false to resume the music')
   //          .setRequired(true)
   // )
   global: true,
   async execute(interaction) {
      const queue = interaction.client.player.getQueue(interaction.guildId);
      if (await music.handle(interaction, queue)) return;

      const p = queue.connection.paused;

      try {
         await queue.setPaused(!p);
      } catch (err) {
         logs.error(interaction.client, err);
         return await interaction.reply({
            content: 'Failed to pause the song.',
            ephemeral: true,
         });
      }
      const embed = new EmbedBuilder()
         .setTitle(!p ? 'Paused' : 'Resumed')
         .setDescription(`**[${queue.current.title}](${queue.current.url})**`)
         .setThumbnail(queue.current.thumbnail)
         .setColor(colors.music);

      return await interaction.reply({ embeds: [embed] });
   },
};
