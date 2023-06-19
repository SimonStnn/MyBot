import { SlashCommandBuilder } from 'discord.js';
import Command from '../../protocols/command';
import { REST, Routes } from 'discord.js';
import { clientId, guildId } from '../../config.json';
import fs from 'node:fs';
import path from 'node:path';
import Response from '../../protocols/response';
import logger from '../../log/logger';

export default new Command({
    data: new SlashCommandBuilder()
        .setName('deploy-commands')
        .setDescription('Deploy commands!'),
    async execute(client, interaction) {
        await interaction.deferReply();
        const commands = [];
        // Grab all the command files from the commands directory you created earlier
        const srcFolderPath = path.join(__dirname, '..', '..', '..', 'src', 'commands');
        const foldersPath = path.join(__dirname, '..', '..', 'commands');
        const commandFolders = fs.readdirSync(foldersPath);

        for (const folder of commandFolders) {
            // Grab all the command files from the commands directory you created earlier
            const srcCommandsPath = path.join(srcFolderPath, folder);
            const commandsPath = path.join(foldersPath, folder);
            const commandFiles = fs
                .readdirSync(commandsPath)
                .filter((file) => file.endsWith('.js'));
            // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
            for (const file of commandFiles) {
                const srcFilePath = path.join(srcCommandsPath, file.replace('.js', '.ts'))
                if (!(() => {
                    try {
                        fs.accessSync(srcFilePath, fs.constants.F_OK);
                        return true;
                    } catch (err) {
                        return false;
                    }
                })()) {
                    logger.warn(`${file.replace('.js', '.ts')} does not exist in ${srcCommandsPath}`)
                    continue
                }

                const filePath = path.join(commandsPath, file);
                const command = require(filePath);
                commands.push(command.default.data.toJSON());
            }
        }

        // Construct and prepare an instance of the REST module
        const rest = new REST().setToken(process.env.DISCORD_TOKEN as string);

        // and deploy your commands!
        try {
            logger.info(
                `Started refreshing ${commands.length} application (/) commands.`
            );

            // The put method is used to fully refresh all commands in the guild with the current set
            const data = await rest.put(
                Routes.applicationGuildCommands(clientId, guildId),
                { body: commands }
            ) as Array<Object>;

            logger.info(
                `Successfully reloaded ${data.length} application (/) commands.`
            );
            await interaction.editReply(new Response({
                interaction,
                content: `Successfully reloaded ${data.length} application (/) commands.`
            }))
        } catch (error) {
            // And of course, make sure you catch and log any errors!
            console.error(error);
        }
    }
}
)