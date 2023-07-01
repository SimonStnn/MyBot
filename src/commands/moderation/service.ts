import { PermissionsBitField, SlashCommandBuilder } from 'discord.js';
import { exec } from 'child_process';
import Command from '../../protocols/command';
import Response from '../../protocols/response';
import logger from '../../log/logger';

export default new Command({
    data: new SlashCommandBuilder()
        .setName('service')
        .setDescription('Cycle the bot service.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('restart')
                .setDescription('Restart bot service'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('stop')
                .setDescription('Stop bot service')),
    requiredPermissions: new PermissionsBitField([
        PermissionsBitField.Flags.Administrator,
    ]),
    async execute(client, interaction) {
        const subCommand = interaction.options.getSubcommand() 
        logger.warn(`${subCommand}ing service...`)
        await interaction.reply(new Response({
            interaction,
            content: `${subCommand}ing service...`,
            ephemeral: true,
        }))

        // Restart service
        try {
            await (() => {
                return new Promise<void>((resolve, reject) => {
                    exec(`sudo systemctl ${subCommand} discord-bot.service`, (error) => {
                        if (error) {
                            logger.error(`Error ${subCommand}ing service: ${error.message}`);
                            reject(error);
                        } else {
                            resolve();
                        }
                    });
                });
            })();
            logger.warn(`Service ${subCommand}ed successfully.`);
        } catch (error) {
            logger.error(`Error: ${error}`);
        }
        await interaction.editReply(new Response({
            interaction,
            content: `${subCommand}ed service`,
            ephemeral: true,
        }))
    }
})