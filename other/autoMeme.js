const { guildIds, channelIds, colors } = require('../config.json');

const fetch = require('node-fetch');
const { EmbedBuilder } = require('discord.js');
const logs = require('../files/log.js');

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
   name: 'autoMeme',
   time: '0 */10 * * *',
   async execute(client) {
      let embed;
      let meme;
      try {
         do {
            const subreddit =
               subreddits[Math.floor(Math.random() * subreddits.length)];
            const reddit = `https://www.reddit.com/r/${subreddit}`;
            const url = await fetch(reddit + '/random/.json');
            const random = await url.json();
            meme = random[0].data.children[0].data;

            embed = new EmbedBuilder()
               .setDescription(`${meme.title}`)
               // .setDescription(`[View](${meme.url})`)
               .setURL(reddit)
               .setImage(meme.url)
               .setColor(colors.none)
               .setFooter({ text: `👍${meme.ups} | 💬${meme.num_comments}` });
         } while (!meme.url.endsWith('.jpg') || meme.url.endsWith('.gif'));

         const guild = client.guilds.cache.get(guildIds.main);
         const channel = guild.channels.cache.get(channelIds.autoMeme);

         await channel.send({ embeds: [embed] });
      } catch (err) {
         logs.error(client, err);
      }
   },
};
