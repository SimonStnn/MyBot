const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { colors } = require('../../config.json');
const fetch = require('node-fetch');
const logs = require('../../files/log.js');

const OPTION_TITLE = 'title';
const OPTION_AUTHOR = 'author';

const url = 'https://www.google.com/search?q=';
const delimiter1 =
   '</div></div></div></div><div class="hwc"><div class="BNeawe tAd8D AP7Wnd"><div><div class="BNeawe tAd8D AP7Wnd">';
const delimiter2 =
   '</div></div></div></div></div><div><span class="hwc"><div class="BNeawe uEec3 AP7Wnd">';

module.exports = {
   data: new SlashCommandBuilder()
      .setName('lyrics')
      .setDescription('Get the lyrics from a song.')
      .addStringOption((option) =>
         option
            .setName(OPTION_TITLE)
            .setDescription('The song you want the lyrics from.')
            .setRequired(true)
      )
      .addStringOption((option) =>
         option
            .setName(OPTION_AUTHOR)
            .setDescription('The song you want the lyrics from.')
            .setRequired(false)
      ),
   reqPerms: ['ADMINISTRATOR'],
   global: true,
   async execute(interaction) {
      await interaction.deferReply();
      const queue = interaction.client.player.getQueue(interaction.guildId);
      // if (await music.handle(interaction, queue)) return;

      const title = interaction.options.getString(OPTION_TITLE);
      const author = interaction.options.getString(OPTION_AUTHOR) || '';

      const lyrics = await findLyrics(title, author);
      return await interaction.editReply({
         embeds: [
            new EmbedBuilder()
               .setTitle('Lyrics')
               .setDescription(
                  lyrics
                     ? lyrics
                     : `Couldn't find the lyrics for ${author} ${title}`
               )
               .setColor(colors.music)
               .setFooter({ text: `${title} by ${author}` }),
         ],
      });
   },
};

async function findLyrics(title = '', author = '') {
   let body = '';
   try {
      body = await fetch(
         `${url}${encodeURIComponent(`${author} ${title}`)}+lyrics`
      );
      console.log('searching once');
   } catch (err) {
      try {
         body = await fetch(
            `${url}${encodeURIComponent(`${author} ${title}`)}+song+lyrics`
         );
         console.log('searching twice');
      } catch (err) {
         body = '';
         console.log('gave up searching.');
      }
   }
   let lyrics = await body.textConverted();
   console.log(typeof lyrics);
   lyrics = lyrics?.split(delimiter1)[1];
   lyrics = lyrics?.split(delimiter2)[0];
   return lyrics.trim() || null;
}
