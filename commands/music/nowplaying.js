const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { colors } = require('../../config.json');
const logs = require('../../files/log.js');
const music = require('../../files/music.js');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('nowplaying')
      .setDescription('Display info about the currently playing music.'),
   global: true,
   async execute(interaction) {
      const queue = interaction.client.player.getQueue(interaction.guildId);

      if (await music.handle(interaction, queue)) return;

      const progress = queue.createProgressBar();
      const timestamp = queue.getPlayerTimestamp();

      // if (timestamp.progress == 'Infinity')
      //    return interaction
      //       .reply({
      //          content: `This song is live streaming, no duration data to display. 🎧`,
      //          ephemeral: true,
      //       })
      //       .catch((e) => {});

      const embed = new EmbedBuilder()
         .setColor(colors.music)
         .setThumbnail(queue.current.thumbnail)
         .setTimestamp()
         .setDescription(
            `**[${queue.current.title}](${queue.current.url})** is currently beeing played.\n${progress} (**${timestamp.progress}**%)`
         );
      return await interaction.reply({ embeds: [embed] });
   },
};
