const { SlashCommandBuilder, WebhookClient, EmbedBuilder } = require('discord.js');
const { channelIds, webhooks, colors } = require('../../config.json');
const fs = require('fs');
const logs = require('../../files/log.js');

const actionsFilePath = './commands/fun/obimy_actions';

const choices = [];
const actionsFolder = fs.readdirSync(actionsFilePath);
for (const file of actionsFolder) {
   const action = require(`./obimy_actions/${file}`);
   choices.push({
      name: action.name,
      value: action.value,
   });
}

// { name: 'Bite', value: 'bite' },
// { name: 'Puch', value: 'puch' },
// { name: 'Slap', value: 'slap' },
// { name: 'Caress', value: 'caress' },
// { name: 'Tickle', value: 'tickle' },
// { name: 'Punch', value: 'punch' },
// { name: 'French kiss', value: 'french_kiss' },
// { name: 'Massage', value: 'massage' },
// { name: 'Cheeks', value: 'cheeks' },

module.exports = {
   data: new SlashCommandBuilder()
      .setName('obimy')
      .setDescription('Cute way to express your feelings to a loved one..')
      .addStringOption((option) =>
         option
            .setName('action')
            .setDescription('The gif category')
            .setRequired(true)
            .addChoices(...choices)
      )
      .addUserOption((option) =>
         option
            .setName('target')
            .setDescription("The user's avatar to show")
            .setRequired(true)
      ),
   async execute(interaction) {
      const embed = new EmbedBuilder().setColor(colors.command).setTimestamp();

      const responseEmbed = new EmbedBuilder()
         .setColor(colors.command)
         .setTimestamp()
         .setFooter({
            text: `${interaction.user.tag}`,
            iconURL: `${interaction.user.displayAvatarURL({ dynamic: true })}`,
         });

      // Get channel
      const channel = interaction.guild.channels.cache.get(
         channelIds.other_bots
      );

      // // Only allow it in this channel
      // if (interaction.channel.id !== channelIds.other_bots) {
      //    const isThread = channel.threads.cache.find(
      //       (x) => x.id === interaction.channel.id
      //    );
      //    if (!isThread) {
      //       embed
      //          .setTitle('Obimy')
      //          .setDescription(
      //             `Please run this command in <#${channelIds.other_bots}>`
      //          );

      //       return await interaction.reply({
      //          embeds: [embed],
      //          ephemeral: true,
      //       });
      //    }
      // }

      // Parse options
      const user = interaction.options.getUser('target');
      const a = interaction.options.getString('action');
      if (user.bot) {
         responseEmbed
            .setTitle('Obimy')
            .setDescription('You cant do this to a bot smartass. 😅');
         return await interaction.reply({
            embeds: [responseEmbed],
            ephemeral: true,
         });
      }
      // Require the action
      const fileName = fs
         .readdirSync(actionsFilePath)
         .filter((file) => file === `${a}.js`);
      const action = require(`./obimy_actions/${fileName}`);

      // Get webhook
      const webhook = new WebhookClient({ url: webhooks.other_bots.url });

      // Find or create a thread
      let thread = channel.threads.cache.find((x) => x.name === user.id);

      if (!thread) {
         thread = await channel.threads.create({
            name: user.id,
            autoArchiveDuration: 60 * 24,
            reason: `${interaction.user} wants to send you something to you.`,
         });
         console.log('Created thread.');
         // Delete server message from thread create
         channel.lastMessage.delete();
      } else {
         console.log('Found thread.');
      }
      // Unarchive the thread
      thread.setArchived(false);
      // Add the user
      thread.members.add(user.id);

      responseEmbed.setDescription(`Succesfully send your act to ${user}`);
      embed.setTitle(`${action.reply(interaction.user, user)}`);
      if (Math.random() < 0.1) {
         embed.addFields([
            {
               name: 'Reply',
               value: `To send an action back do \`/${this.data.name}\`.\nFor more info do \`/help\`.`,
            },
         ]);
      }

      if (action.img) {
         embed.setThumbnail(action.img);
      }

      // Send a message in the channel.
      webhook.send({
         username: `${interaction.user.username}`,
         avatarURL: interaction.user.displayAvatarURL({ dynamic: true }),
         threadId: thread.id,
         // content: 'Webhook test',
         embeds: [embed],
      });

      return await interaction.reply({
         embeds: [responseEmbed, embed],
         ephemeral: true,
      });
   },
};
