import { Client, Events, Interaction } from 'discord.js';
import Response from '../protocols/response';
import Command from '../protocols/command';
import logger from '../log/logger';

export default {
   name: Events.InteractionCreate,
   async execute(client: Client, interaction: Interaction) {
      if (!interaction.isChatInputCommand()) return;

      const command: Command | null = interaction.client.commands.get(interaction.commandName);

      if (!command) {
         logger.error(`No command matching ${interaction.commandName} was found.`);
         return;
      }

      try {
         const responses = await command.execute(client, interaction);
      } catch (error) {
         logger.error(error);
         try {
            if (interaction.replied || interaction.deferred)
            await interaction.followUp(new Response({ interaction, content: 'There was an error while executing this command!', ephemeral: true }));
            else
            await interaction.reply(new Response({ interaction, content: 'There was an error while executing this command!', ephemeral: true }));
         } catch (err) {
            logger.error(err);
         }
      }
   },
};
