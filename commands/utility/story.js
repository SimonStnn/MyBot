const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { channelIds, colors } = require('../../config.json');

const cooldown = 1000 * 60 * 120; // 2 hours
let lastReply = 0;
let url = '';

module.exports = {
   data: new SlashCommandBuilder()
      .setName('story')
      .setDescription('Let me tell you the story.'),
   database: false,
   async execute(interaction) {
      if (Date.now() - lastReply < cooldown) {
         const embed = new EmbedBuilder()
            .setColor(colors.command)
            .setTimestamp()
            .setFooter({
               text: `${interaction.user.tag}`,
               iconURL: `${interaction.user.displayAvatarURL({
                  dynamic: true,
               })}`,
            })
            .setTitle('Story')
            .setDescription(
               `Command is on cooldown for ${Math.floor(
                  (cooldown - (Date.now() - lastReply)) / 1000 / 60
               )}min ${Math.floor(
                  ((cooldown - (Date.now() - lastReply)) / 1000) % 60
               )}sec.`
            )
            .addFields([
               {
                  name: 'Where to find the story?',
                  value: `You can find the last requested story [here](${url}).`,
               },
            ]);
         return await interaction.reply({
            embeds: [embed],
         });
      } // don't respond within 10 seconds
      lastReply = Date.now();

      const reply = await interaction.deferReply({
         ephemeral: false,
         fetchReply: true,
      });

      url = reply.url;

      const channel = await interaction.guild.channels.cache.get(
         channelIds.story
      );

      let story = await fetchAllMessages(channel);
      story = breakArray(story, 5);
      // story = story.join(' ');
      // story = breakString(story, 30);

      // await interaction.editReply('Pong!');
      await interaction.editReply({
         files: [
            { attachment: Buffer.from(story.toLowerCase()), name: 'story.txt' },
         ],
      });
   },
};

async function fetchAllMessages(channel) {
   let messages = [];

   // Create message pointer
   let message = await channel.messages
      .fetch({ limit: 1 })
      .then((messagePage) =>
         messagePage.size === 1 ? messagePage.at(0) : null
      );

   while (message) {
      await channel.messages
         .fetch({ limit: 100, before: message.id })
         .then((messagePage) => {
            messagePage.forEach((msg) => messages.push(msg));

            // Update our message pointer to be last message in page of messages
            message =
               0 < messagePage.size
                  ? messagePage.at(messagePage.size - 1)
                  : null;
         });
   }
   return messages.reverse();
}

const breakString = (str, limit) => {
   let brokenString = '';
   for (let i = 0, count = 0; i < str.length; i++) {
      if (count >= limit && str[i] === ' ') {
         count = 0;
         brokenString += '\n';
      } else {
         count++;
         brokenString += str[i];
      }
   }
   return brokenString;
};

function breakArray(arr, limit) {
   let brokenString = '';
   for (let i = 0, count = 0; i < arr.length; i++) {
      if (count >= limit) {
         count = 0;
         brokenString += '\n';
         continue;
      } else {
         count++;
      }
      brokenString += arr[i].content + ' ';
   }
   return brokenString;
}
