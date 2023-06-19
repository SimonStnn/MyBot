import { EmbedBuilder, InteractionType, Client, Interaction } from 'discord.js';
import { userIds, channelIds } from '../config.json';
import Response from '../protocols/response';
import Command from '../protocols/command';

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

      const command: Command | null = interaction.client.commands.get(interaction.commandName);

      if (!command) {
         console.error(`No command matching ${interaction.commandName} was found.`);
         return;
      }

      try {
         const responses = await command.execute(client, interaction);
      } catch (error) {
         console.error(error);
         if (interaction.replied || interaction.deferred)
            await interaction.followUp(new Response({ interaction, content: 'There was an error while executing this command!', ephemeral: true }));
         else
            await interaction.reply(new Response({ interaction, content: 'There was an error while executing this command!', ephemeral: true }));
      }
   },
};
