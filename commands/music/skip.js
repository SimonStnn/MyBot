const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { colors } = require('../../config.json');
const logs = require('../../files/log.js');
const { handle, clientIsInUserVc } = require('../../files/music.js');

const OPTION_SKIP = 'skip';

module.exports = {
   data: new SlashCommandBuilder()
      .setName('skip')
      .setDescription('Skip a track.')
      .addIntegerOption((option) =>
         option
            .setName(OPTION_SKIP)
            .setDescription('Number of songs you want to skip.')
            .setRequired(false)
      ),
   global: true,
   async execute(interaction) {
      const queue = await interaction.client.player.createQueue(
         interaction.guild
      );
      if (await handle(interaction, queue)) return;
      //todo if (!clientIsInUserVc(interaction, queue)) {
      //    return await interaction.reply({
      //       content:
      //          'You have to be in the same voice channel to skip a track.',
      //       ephemeral: true,
      //    });
      // }

      //todo await queue.back();

      const num = interaction.options.getInteger(OPTION_SKIP);
      const currentSong = queue.current;

      // console.log(queue.tracks.length);
      const embed = new EmbedBuilder()
         .setColor(colors.music)
         .setDescription(
            `**[${currentSong.title}](${currentSong.url})** has been skipped!`
         )
         .setThumbnail(currentSong.thumbnail);

      if (queue.tracks.length === 0) {
         await client.player?.deleteQueue(queue.metadata.guild.id)
         embed.addFields([
            {
               name: 'Stopped',
               value: 'The queue after this song was empty, so i stopped playing music.',
            },
         ]);
      } else {
         let i = (num ? num : 1) - 1;
         const newCurrent = queue.tracks[i];
         await queue.skipTo(i);

         embed.addFields([
            {
               name: 'Next',
               value: `Skipped to **[${newCurrent.title}](${newCurrent.url})**.`,
            },
         ]);
      }

      await interaction.reply({
         embeds: [embed],
      });
   },
};
