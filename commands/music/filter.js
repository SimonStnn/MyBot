const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { colors } = require('../../config.json');
const logs = require('../../files/log.js');
const music = require('../../files/music.js');


const FILTER_NONE = 'none';
const autocompleteChoices = [
   FILTER_NONE,
   'bassboost_low',
   'bassboost',
   'bassboost_high',
   '8D',
   'vaporwave',
   'nightcore',
   'phaser',
   'tremolo',
   'vibrato',
   'reverse',
   'treble',
   'normalizer',
   'normalizer2',
   'surrounding',
   'pulsator',
   'subboost',
   'karaoke',
   'flanger',
   'gate',
   'haas',
   'mcompand',
   'mono',
   'mstlr',
   'mstrr',
   'compressor',
   'expander',
   'softlimiter',
   'chorus',
   'chorus2d',
   'chorus3d',
   'fadein',
   'dim',
   'earrape',

   // "8D",
   // "bassboost_low",
   // "bassboost",
   // "bassboost_high",
   // "chorus",
   // "chorus2d",
   // "chorus3d",
   // "compressor",
   // "dim",
   // "earrape",
   // "expander",
   // "fadein",
   // "flanger",
   // "gate",
   // "haas",
   // "karaoke",
   // "mcompand",
   // "mono",
   // "mstlr",
   // "mstrr",
   // "nightcore",
   // "normalizer",
   // "normalizer2",
   // "phaser",
   // "pulsator",
   // "reverse",
   // "softlimiter",
   // "subboost",
   // "surrounding",
   // "treble",
   // "tremolo",
   // "vaporwave",
   // "vibrato",
];

const OPTION_FILTER = 'type';

const markupLang = 'md';
const ITEMS_PER_FIELD = Math.ceil(autocompleteChoices.length / 3);

module.exports = {
   data: new SlashCommandBuilder()
      .setName('filter')
      .setDescription('Type the filter you want to apply.')
      .addStringOption((option) =>
         option
            .setName(OPTION_FILTER)
            .setDescription('Select a loop mode.')
            .setAutocomplete(true)
            .setRequired(false)
      ),
   autocompleteChoices,
   global: true,
   async execute(interaction) {
      const opt = interaction.options.getString(OPTION_FILTER);
      if (!opt) {
         const embed = new EmbedBuilder()
            // .setTitle('Filters')
            .setColor(colors.music);
         for (let i = 0; i < autocompleteChoices.length; i += ITEMS_PER_FIELD) {
            const list = (() => {
               let filters = [];
               for (let j = i; j < ITEMS_PER_FIELD + i; j++) {
                  const filter = autocompleteChoices[j];
                  if (!filter) break;
                  filters.push(
                     `${j + 1}. ${filter.includes('_') ? filter + '_' : filter}`
                  );
               }
               return '```' + markupLang + '\n' + filters.join('\n') + '```';
            })();
            embed.addFields([
               {
                  name: i === 0 ? 'Filters' : '\u200b',
                  value: list,
                  inline: true,
               },
            ]);
         }
         embed.addFields([
            {
               name: '\u200b',
               value:
                  '```' +
                  markupLang +
                  '\n' +
                  `${FILTER_NONE} (to delete all filters)` +
                  '```',
            },
         ]);
         return await interaction.reply({
            embeds: [embed],
         });
      }

      const queue = interaction.client.player.getQueue(interaction.guildId);
      if (await music.handle(interaction, queue)) return;
      await interaction.deferReply();

      const filters = autocompleteChoices.splice(1, autocompleteChoices.length - 1);
      const filter = filters.find((x) => x.toLowerCase() === opt.toLowerCase());

      if (!filter && opt !== FILTER_NONE)
         return await interaction.editReply({
            content: `Couldn't find a filter by the name \`${opt}\`. Please do \`/filter\` to see a list of all available filters.`,
            ephemeral: true,
         });

      let activefilters = queue["_activeFilters"];

      const filtersUpdated = {};
      if (opt === FILTER_NONE) {
         filters.map((f) => (filtersUpdated[f] = false));
      } else {
         activefilters.map((f) => (filtersUpdated[f] = true));
         filtersUpdated[filter] = activefilters.includes(filter) ? false : true;
      }

      try {
         await queue.setFilters(filtersUpdated);
      } catch (err) {
         logs.error(interaction.client, err, `Failed to add ${filter}`);
         return await interaction.editReply('Failed to set filter.');
      }
      activefilters = queue["_activeFilters"];

      return await interaction
         .editReply({
            embeds: [
               new EmbedBuilder()
                  .setTitle('Filter')
                  .setDescription(
                     opt === FILTER_NONE
                        ? 'Removed all filters.'
                        : `Applied: \`${filter}\` Filter Status: \`${activefilters.includes(filter)
                           ? 'Active'
                           : 'Inactive'
                        }\``
                  )
                  .addFields([
                     {
                        name: 'Active filters',
                        value: (() =>
                           `\`\`\`\n${queue["_activeFilters"]
                              .join(', ')} \`\`\``)(),
                     },
                  ])
                  .setFooter({
                     text:
                        Math.random() < 0.5
                           ? 'Remember, if the music is long, the filter application time may be longer accordingly.'
                           : `${queue["_activeFilters"].length
                           } filter(s) enabled.`,
                  })
                  .setColor(colors.music),
            ],
         })
         .catch((e) => { });
   },
};
