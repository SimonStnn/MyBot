const {
   SlashCommandBuilder,
   EmbedBuilder,
   ButtonBuilder,
   ActionRowBuilder,
   ButtonStyle,
} = require('discord.js');
const { colors } = require('../../config.json');
const logs = require('../../files/log.js');
const { handle, addTimes } = require('../../files/music.js');

const OPTION_PAGE = 'page';

module.exports = {
   data: new SlashCommandBuilder()
      .setName('queue')
      .setDescription('View the queue.')
      .addIntegerOption((option) =>
         option.setName(OPTION_PAGE).setDescription('Enter an page.')
      ),
   global: true,
   async execute(interaction) {
      const queue = await interaction.client.player.createQueue(
         interaction.guild
      );
      try {
         if (!queue || !queue?.current) {
            throw 'no queue'
         }
      } catch (err) {
         return await interaction.reply({
            content: 'There is currently no song playing.',
            ephemeral: true,
         });
      }
      if (queue.tracks.length === 0) {
         const nowPlaying = require('./nowplaying.js');
         return await nowPlaying.execute(interaction);
      }

      const tracks = [];
      queue.tracks.map(async (track, i) => {
         tracks.push({
            title: track.title,
            author: track.author,
            requestedBy: {
               id: track.requestedBy.id,
            },
            url: track.url,
            duration: track.duration,
         });
      });

      const backId = 'emojiBack';
      const forwardId = 'emojiForward';
      const backButton = new ButtonBuilder({
         style: ButtonStyle.Primary,
         emoji: '➖',
         customId: backId,
      });

      const forwardButton = new ButtonBuilder({
         style: ButtonStyle.Primary,
         emoji: '➕',
         customId: forwardId,
      });
      
      const deleteButton = new ButtonBuilder({
         style: ButtonStyle.Secondary,
         label: 'End Interaction',
         customId: 'close',
      });

      let kaçtane = 8;
      let page = 1;
      let a = tracks.length / kaçtane;
      let b = `${a + 1}`;
      let toplam = b.charAt(0);

      const generateEmbed = async (start) => {
         let say = page === 1 ? 1 : page * kaçtane - kaçtane + 1;
         const current = tracks.slice(start, start + kaçtane);
         function a(b) {
            return b < 10 ? ' ' + b.toString() : b.toString();
         }
         const embed = new EmbedBuilder()
            .setTitle(`Queue`)
            .setColor(colors.music)
            .setDescription(
               `Currently Playing: **[${queue.current.title}](${queue.current.url
               })**\n${!current
                  ? 'No songs in the queue.'
                  : await Promise.all(
                     current.map(
                        (data) =>
                           `**\n\`${a(say++)}\`** | **[${data.title}](${data.url
                           })** | ${data.author} -- <@${data.requestedBy.id
                           }>`
                     )
                  )
               }`
            );

         const duration = (() => {
            const allDurations = [];
            for (const track of queue.tracks) {
               allDurations.push(track.duration);
            }

            return queue.tracks
               .map((t) => t.duration)
               .reduce((prev, cur) => addTimes(prev, cur));
         })();

         embed.setFooter({
            text: `${duration} | Page ${page} / ${toplam}`,
         });

         return embed;
      };

      const canFitOnOnePage = tracks.length <= kaçtane;

      await interaction
         .reply({
            embeds: [await generateEmbed(0)],
            components: canFitOnOnePage
               ? []
               : [
                  new ActionRowBuilder({
                     components: [forwardButton, deleteButton],
                  }),
               ],
         })
         .catch((e) => { });

      if (canFitOnOnePage) return;
      const filter = (i) => i.user.id === interaction.user.id;
      const collector = interaction.channel.createMessageComponentCollector({
         filter,
         time: 60000,
      });

      let currentIndex = 0;
      collector.on('collect', async (button) => {
         if (button.customId === 'close') {
            collector.stop();
            return button
               .reply({
                  content: `Command has been canceled.`,
                  ephemeral: true,
               })
               .catch((e) => { });
         } else {
            if (button.customId === backId) {
               page--;
            }
            if (button.customId === forwardId) {
               page++;
            }

            button.customId === backId
               ? (currentIndex -= kaçtane)
               : (currentIndex += kaçtane);

            await interaction
               .editReply({
                  embeds: [await generateEmbed(currentIndex)],
                  components: [
                     new ActionRowBuilder({
                        components: [
                           ...(currentIndex ? [backButton] : []),
                           ...(currentIndex + kaçtane < tracks.length
                              ? [forwardButton]
                              : []),
                           deleteButton,
                        ],
                     }),
                  ],
               })
               .catch((e) => { });
            await button.deferUpdate();
         }
      });

      collector.on('end', async (button) => {
         button = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
               .setStyle(ButtonStyle.Secondary)
               .setEmoji('➖')
               .setCustomId(backId)
               .setDisabled(true),
            new ButtonBuilder()
               .setStyle(ButtonStyle.Secondary)
               .setEmoji('➕')
               .setCustomId(forwardId)
               .setDisabled(true),
            new ButtonBuilder()
               .setStyle(ButtonStyle.Secondary)
               .setLabel('End Interaction')
               .setCustomId('close')
               .setDisabled(true)
         );

         // const embed = new EmbedBuilder()
         //    .setTitle(`Server Music List - Time Ended!`)
         //    .setThumbnail(
         //       interaction.guild.iconURL({ size: 2048, dynamic: true })
         //    )
         //    .setColor(colors.command)
         //    // .setDescription(
         //    //    `Your time has expired to use this command, you can type \`/queue\` to use the command again.`
         //    // )
         //    .setFooter({
         //       text: (() => {
         //          const allDurations = [];
         //          for (const track of queue.tracks) {
         //             allDurations.push(track.duration);
         //          }

         //          return allDurations.reduce((prev, cur) =>
         //             addTimes(prev, cur)
         //          );
         //       })(),
         //    });
         //   .setFooter({text: `Code Share - by Umut Bayraktar ❤️` })

         return interaction
            .editReply({ components: [button] })
            .catch((e) => { });
      });
   },
};
