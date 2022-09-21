const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { colors } = require('../../config.json');
const logs = require('../../files/log.js');
const music = require('../../files/music.js');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('stop')
      .setDescription('Stop playing music.'),
   global: true,
   async execute(interaction) {
      const queue = interaction.client.player.getQueue(interaction.guildId);

      if (!queue)
         return await interaction.reply({
            content: "The bot isn't playing anything right now.",
            ephemeral: true,
         });

      // await queue.destroy();
      await Promise.all([
         queue.connection.disconnect(),
         // interaction.client.player?.deleteQueue(interaction.guild.id),
      ]);

      // return await interaction.reply('Destroyed the queue.');
      return await interaction.reply({
         embeds: [
            new EmbedBuilder()
               .setDescription('Destroyed the queue')
               .addFields([
                  {
                     name: 'Play more',
                     value: 'To play more tracks do `/play`.',
                  },
               ])
               .setColor(colors.music),
         ],
      })
   },
};
