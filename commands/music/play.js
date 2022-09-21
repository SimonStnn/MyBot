const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { AudioPlayerStatus } = require('@discordjs/voice');
const { QueryType } = require('discord-player');
const { channelIds, colors, guildIds } = require('../../config.json');
const logs = require('../../files/log.js');
const { clientIsInUserVc, addTimes } = require('../../files/music.js');
const music = require('../../files/music.js');

const OPTION_QUERY = 'query';

module.exports = {
   data: new SlashCommandBuilder()
      .setName('play')
      .setDescription('Play a song in a vc')
      .addStringOption((option) =>
         option
            .setName(OPTION_QUERY)
            .setDescription('Name of the song you want to listen to')
            .setRequired(true)
      ),
   global: true,
   async execute(interaction) {
      if (!interaction.member.voice.channel) {
         return await interaction.reply(
            'You need to be in a vc to do this command.'
         );
      }
      await interaction.deferReply();

      const queue = await interaction.client.player.createQueue(
         interaction.guild,
         {
            leaveOnEnd: false,
            leaveOnStop: false,
            leaveOnEmpty: false,
            autoSelfDeaf: true,
         }
      );
      queue.metadata = interaction.guild.channels.cache.get(
         interaction.guild.id === guildIds.main
            ? interaction.channel.id === channelIds.music
               ? channelIds.music
               : channelIds.test
            : interaction.channel.id




      );

      const joinMessage = await music.connect(interaction, queue);

      //todo if (!clientIsInUserVc(interaction, queue)) {
      //    return await interaction.editReply(
      //       `You have to be in the same vc ( ${interaction.guild.me.voice.channel} ) to add tracks to the queue.`
      //    );
      // }

      const query = interaction.options.getString(OPTION_QUERY);
      // check if its a playlist
      // const plQ = query.includes('/playlist?');

      const searchEngine = (() => {
         if (query.startsWith('https://youtube.com/playlist?'))
            return QueryType.YOUTUBE_PLAYLIST;
         else if (query.startsWith('https://youtube.com/watch?'))
            return QueryType.YOUTUBE_VIDEO;
         else if (query.startsWith('https://youtube.com/results?search'))
            return QueryType.YOUTUBE_SEARCH;
         else if (query.startsWith('https://youtube.com'))
            return QueryType.YOUTUBE;
         else if (query.startsWith('https://spotify.com/album/'))
            return QueryType.SPOTIFY_ALBUM;
         else if (query.startsWith('https://spotify.com/playlist/'))
            return QueryType.SPOTIFY_PLAYLIST;
         else if (query.startsWith('https://spotify.com/track/'))
            return QueryType.SPOTIFY_SONG;
         // else if (query.startsWith('https://soundcloud.com/'))
         //    return QueryType.SOUNDCLOUD;
         else return QueryType.AUTO;
      })();
      //   https://open.spotify.com/track/3OuuycRivNjOjN0E4IXJLi?si=e2144d6a510e4844

      // look up song
      const result = await interaction.client.player.search(query, {
         requestedBy: interaction.user,
         searchEngine,
      });

      if (result.tracks.length === 0) {
         return await interaction.editReply(
            `Couldn\'t find any results for \`${query}\`.`
         );
      }

      const views = result.tracks.slice(0, 5).map((t) => t.views);

      const song = result.playlist
         ? result.playlist
         : result.tracks[views.indexOf(Math.max(...views))]; //

      let totalDuration;
      if (result.playlist) {
         await queue.addTracks(song.tracks.slice(0, 50));
         totalDuration = (() => {
            const allDurations = [];
            for (const track of song.tracks) {
               allDurations.push(track.duration);
            }

            return allDurations.reduce((prev, cur) => addTimes(prev, cur));
         })();
      } else {
         await queue.addTrack(song);
      }

      const embed = new EmbedBuilder()
         .setThumbnail(song.thumbnail + '?size=512') //todo--------------------------------------------------------------------------------------
         .setDescription(
            `**[${song.title}](${song.url})** has been added to the queue ${joinMessage ? '\n' + joinMessage : ''
            }`
         )
         .setFooter({
            text: `Duration: ${song.duration || totalDuration} | mins:sec`,
         })
         .setColor(colors.music);

      if (!queue.playing) await queue.play();

      return await interaction.editReply({
         embeds: [embed],
      });
   },
};
