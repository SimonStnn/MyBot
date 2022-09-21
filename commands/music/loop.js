const { SlashCommandBuilder } = require('discord.js');
const { QueueRepeatMode } = require('discord-player');
const logs = require('../../files/log.js');
const music = require('../../files/music.js');

const OPTION_MODE = 'mode';
const CHOICE_OFF = 'off';
const CHOICE_TRA = 'track';
const CHOICE_QUE = 'queue';

module.exports = {
   data: new SlashCommandBuilder()
      .setName('loop')
      .setDescription('Turns the music loop mode on or off.')
      .addStringOption((option) =>
         option
            .setName(OPTION_MODE)
            .setDescription('Select a loop mode.')
            .addChoices(
               { name: 'Off', value: CHOICE_OFF },
               { name: 'Track', value: CHOICE_TRA },
               { name: 'Queue', value: CHOICE_QUE }
            )
            .setRequired(true)
      ),
   global: true,
   async execute(interaction) {
      const queue = interaction.client.player.getQueue(interaction.guildId);
      await interaction.deferReply();

      if (await music.handle(interaction, queue)) return;

      const mode = interaction.options.getString(OPTION_MODE);

      try {
         await queue.setRepeatMode(
            (() => {
               switch (mode) {
                  case CHOICE_OFF:
                     return QueueRepeatMode.OFF;
                  case CHOICE_TRA:
                     return QueueRepeatMode.TRACK;
                  case CHOICE_QUE:
                     return QueueRepeatMode.QUEUE;
                  default:
                     return QueueRepeatMode.OFF;
               }
            })()
         );
      } catch (err) {
         logs.error(interaction.client, err, `Failed to set loop ${mode}`);
         return await interaction.editReply({
            content: 'Failed to set loop mode.',
            ephemeral: true,
         });
      }
      return await interaction.editReply(`repeat: ${mode}`);
   },
};
