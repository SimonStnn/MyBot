const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const logs = require('../../files/log.js');
const music = require('../../files/music.js');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('shuffle')
      .setDescription('Shuffle the queue.'),
   voiceChannel: true,
   global: true,
   async execute(interaction) {
      const queue = interaction.client.player.getQueue(interaction.guildId);

      if (await music.handle(interaction, queue)) return;

      await queue.shuffle();
      return await interaction.reply(
         `The queue of ${queue.tracks.length} songs have been shuffled!`
      );
   },
};
