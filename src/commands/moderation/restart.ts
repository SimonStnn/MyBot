import { PermissionsBitField, SlashCommandBuilder } from 'discord.js';
import { exec } from 'child_process';
import Command from '../../protocols/command';
import Response from '../../protocols/response';
import logger from '../../log/logger';

export default new Command({
    data: new SlashCommandBuilder()
        .setName('restart')
        .setDescription('Restart the bot'),
    requiredPermissions: new PermissionsBitField([
        PermissionsBitField.Flags.Administrator,
    ]),
    async execute(client, interaction) {
        logger.warn("Restarting service...")
        await interaction.reply(new Response({
            interaction,
            content: "Restarting service...",
            ephemeral: true,
        }))
        
        // Restart service
        try {
            await (() => {
                return new Promise<void>((resolve, reject) => {
                    exec('sudo systemctl restart discord-bot.service', (error) => {
                        if (error) {
                            logger.error(`Error restarting service: ${error.message}`);
                            reject(error);
                        } else {
                            resolve();
                        }
                    });
                });
            })();
            logger.warn('Service restarted successfully.');
        } catch (error) {
            logger.error(`Error: ${error}`);
        }
        await interaction.editReply(new Response({
            interaction,
            content: "Restarted service",
            ephemeral: true,
        }))
    }
})