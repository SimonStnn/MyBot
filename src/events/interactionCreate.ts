import { EmbedBuilder, InteractionType, Client, Interaction } from 'discord.js';
import { userIds, roleIds, channelIds, colors } from '../config.json';
import mongoose from 'mongoose';

const bannedUsers = [userIds.Viktor];
const disabledChannels = [
   channelIds.dontBreakChain,
   channelIds.counting,
   channelIds.story,
   channelIds.tgmc,
];

let cooldowns = [];

module.exports = {
   name: 'interactionCreate',
   async execute(client: Client, interaction: Interaction) {
      if (!interaction.isChatInputCommand()) return;

      const command = interaction.client.commands.get(interaction.commandName);

      if (!command) {
         console.error(`No command matching ${interaction.commandName} was found.`);
         return;
      }

      try {
         await command.execute(client, interaction);
      } catch (error) {
         console.error(error);
         if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
         } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
         }
      }
      // const command = interaction.client.commands.get(interaction.commandName);

      // if (interaction.type !== InteractionType.ApplicationCommand || !command)
      //    return;

      // console.log(
      //    `${interaction.user.tag} in #${interaction.channel.name} triggered /${interaction.commandName}.`
      // );

      // try {
      //    if (bannedUsers.includes(interaction.user.id)) {
      //       return await interaction.reply({
      //          content: `You are banned from using this bot.\nPlease contact <@${userIds.Simon}>.`,
      //          ephemeral: true,
      //       });
      //    }

      //    if (disabledChannels.includes(interaction.channel.id)) {
      //       return await interaction.reply({
      //          content: 'You can not do commands here.',
      //          ephemeral: true,
      //       });
      //    }
      //    // Check if user has permissions to do the command.  Array
      //    if (command.reqPerms) {
      //       if (!interaction.member.permissions.has(command.reqPerms)) {
      //          return await interaction.reply({
      //             content:
      //                "You don't have the required permissions to do this command.",
      //             ephemeral: true,
      //          });
      //       }
      //    }
      //    // Check if user has the required roles.             Array
      //    if (command.reqRoles) {
      //       for (let i = 0; i < command.reqRoles.length; i++) {
      //          if (!interaction.member.roles.cache.has(command.reqRoles[i])) {
      //             return interaction
      //                .reply({
      //                   content:
      //                      "You don't have the required roles to do this command. " +
      //                      i,
      //                   ephemeral: true,
      //                })
      //                .catch((err) => {
      //                   logs.error(interaction.client, err, 'Failed to reply');
      //                });
      //          }
      //       }
      //    }
      //    // Check if command needs database connection.       Boolean
      //    if (command.database) {
      //       const connected = mongoose.connection.readyState;
      //       if (!connected) {
      //          return await interaction.reply({
      //             content: "This command isn't available right now.",
      //             ephemeral: true,
      //          });
      //       }
      //    }

      //    // Handle cooldowns                                   Number
      //    if (command.cooldown) {
      //       const now = Date.now();
      //       const user = {
      //          userId: interaction.user.id,
      //          timeStamp: now,
      //       };

      //       const foundUser = cooldowns.find((u) => u.userId === user.userId);
      //       if (foundUser) {
      //          const embed = new EmbedBuilder()
      //             .setColor(colors.command)
      //             .setTimestamp()
      //             .setFooter({
      //                text: `${interaction.user.tag}`,
      //                iconURL: `${interaction.user.displayAvatarURL({
      //                   dynamic: true,
      //                })}`,
      //             })
      //             .setTitle('Cooldown')
      //             .setDescription(
      //                `Command is on cooldown for ${Math.floor(
      //                   (command.cooldown - (now - foundUser.timeStamp)) /
      //                      1000 /
      //                      60
      //                )}min ${Math.floor(
      //                   ((command.cooldown - (now - foundUser.timeStamp)) /
      //                      1000) %
      //                      60
      //                )}sec.`
      //             );
      //          return await interaction.reply({
      //             embeds: [embed],
      //             ephemeral: true,
      //          });
      //       }

      //       cooldowns.push(user);
      //       setTimeout(() => {
      //          cooldowns = cooldowns.filter(
      //             (e) => e.userId !== interaction.user.id
      //          );
      //       }, command.cooldown);
      //    }

      //    // Execute the command.
      //    await command.execute(interaction);
      // } catch (error) {
      //    logs.error(interaction.client, error);
      //    try {
      //       return await interaction.reply({
      //          content: 'There was an error while executing this command!',
      //          ephemeral: true,
      //       });
      //    } catch (err) {}
      // }
   },
};
