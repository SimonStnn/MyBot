const { REST, Routes } = require('discord.js');
const { clientId, guildId } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

const commands = [];
// Grab all the command files from the commands directory you created earlier
const srcFolderPath = path.join(__dirname, '..', 'src', 'commands');
const foldersPath = path.join(__dirname, '..', 'build', 'commands');
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
        const srcFilePath = path.join(
            srcCommandsPath,
            file.replace('.js', '.ts')
        );
        if (
            !(() => {
                try {
                    fs.accessSync(srcFilePath, fs.constants.F_OK);
                    return true;
                } catch (err) {
                    return false;
                }
            })()
        ) {
            console.warn(
                `${file.replace(
                    '.js',
                    '.ts'
                )} does not exist in ${srcCommandsPath}`
            );
            continue;
        }
        const filePath = path.join(commandsPath, file);
        console.log(filePath);
        try {
            const command = require(filePath);
            console.log('name:', command.default.data.name);
            commands.push(command.default.data.toJSON());
        } catch (err) {
            console.log(err);
            continue;
        }
    }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

// and deploy your commands!
(async () => {
    try {
        console.log(
            `Started refreshing ${commands.length} application (/) commands.`
        );

        // The put method is used to fully refresh all commands in the guild with the current set
        const data = await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands }
        );

        console.log(
            `Successfully reloaded ${data.length} application (/) commands.`
        );
    } catch (error) {
        // And of course, make sure you catch and log any errors!
        console.error(error);
    }
})();
