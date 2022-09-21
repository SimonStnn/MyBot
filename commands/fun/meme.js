const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { colors } = require('../../config.json');
const fetch = require('node-fetch');
const logs = require('../../files/log.js');

const subreddits = [
   'meme',
   'memes',
   'dankmemes',
   'MemeEconomy',
   'ComedyCemetery',
   'PrequelMemes',
   'terriblefacebookmemes',
   'PewdiepieSubmissions',
   'funny',
   'teenagers',
];

module.exports = {
   data: new SlashCommandBuilder()
      .setName('meme')
      .setDescription('Generates a random meme.'),
   async execute(interaction) {
      await interaction.deferReply();

      const embed = new EmbedBuilder();
      let meme = '';
      try {
         do {
            const subreddit =
               subreddits[Math.floor(Math.random() * subreddits.length)];
            const reddit = `https://www.reddit.com/r/${subreddit}`;
            const url = await fetch(reddit + '/random/.json');
            const random = await url.json();
            meme = random[0].data.children[0].data;

            embed
               .setTitle(`${meme.title}`)
               // .setDescription(`[View](${meme.url})`)
               .setURL(reddit)
               .setImage(meme.url)
               .setColor(colors.none)
               .setFooter({ text: `👍${meme.ups} | 💬${meme.num_comments}` });
         } while (!meme.url.endsWith('.jpg') || meme.url.endsWith('.gif'));
         await interaction.editReply({ embeds: [embed] });
      } catch (err) {
         logs.error(interaction.client, err, 'Meme failed.');
      }
   },
};
