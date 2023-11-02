import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { legend } from '../../config.json';
import fs from 'fs';
import Command from '../../protocols/command';
import Response from '../../protocols/response';

const autocompleteChoices = (() => {
    const commands = [];
    const commandFolders = fs.readdirSync('./build/commands');
    for (const folder of commandFolders) {
        const commandFiles = fs
            .readdirSync(`./build/commands/${folder}`)
            .filter((file: string) => file.endsWith('.js'));
        for (const file of commandFiles) {
            commands.push(file.replace('.js', ''));
        }
    }
    return commands.sort();
})()


export default new Command({
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Gives help.')
        .addStringOption((option) =>
            option
                .setName('command')
                .setDescription('Helps with specific command.')
                .setAutocomplete(true)
        ),
    autocompleteChoices,
    async execute(client, interaction) {
        let requestedCommand = interaction.options.getString('command');
        const response = new Response({ interaction })

        // If there isn't any command mentioned, display all commands.
        if (!requestedCommand) {
            const markupLang = 'md';
            let commands = '';
            // Get all folders in ./build/commands.
            const commandFolders = fs.readdirSync('./build/commands');
            for (const folder of commandFolders) {
                // Get all files in 'folder' that ends with .js.
                const commandFiles = fs
                    .readdirSync(`./build/commands/${folder}`)
                    .filter((file) => file.endsWith('.js'));
                for (let i = 0; i < commandFiles.length; i++) {
                    commands += `${i + 1}.${commandFiles.length > 9 && i + 1 <= 9 ? ' ' : ''
                        } /${commandFiles[i].replace('.js', '')}\n`; //▸
                }

                if (commands == '') {
                    commands = '\u200b';
                }
                response.addFields([
                    {
                        name: folder.charAt(0).toUpperCase() + folder.slice(1),
                        value: '```' + markupLang + '\n' + commands + '```',
                        inline: true,
                    },
                ]);
                commands = '';
            }
            response.addFields([
                {
                    name: '\u200b',
                    value: '\u200b',
                    inline: true,
                },
                {
                    name: 'More help:',
                    value: `For more help about a specific command please do: /help [command]`,
                },
            ]);
            return await interaction.reply(response);
            // Else if there is a command mentioned, give info about that command.
        } else {
            if (requestedCommand.startsWith('/')) {
                requestedCommand = requestedCommand.slice(1);
            }

            // Check if command exists
            const command = interaction.client.commands.get(requestedCommand) as Command | undefined;
            if (!command) {
                return await interaction.reply(
                    new Response({ interaction, content: `\`${requestedCommand}\` isn't a command.` })
                );
            }
            // if there is a discription add it to a field in embed.
            response.setTitle(
                `Displaying info for \`/${requestedCommand}\``
            );
            if (command.data.description) {
                response.addFields([
                    { name: `Description:`, value: command.data.description },
                ]);
            }
            const markupLang = 'ml';
            // Dynamic usage info
            if (command.usage) {
                response.addFields([
                    {
                        name: `Usage:`,
                        value: '```' + markupLang + '\n' + command.usage + '```',
                        inline: true,
                    },
                ]);
            } else if (command.data.options.length !== 0) {
                response.addFields([
                    {
                        name: `Usage:`,
                        value: (() => {
                            let usage = `/${command.data.name}`;
                            for (const cmd of command.data.options) {
                                const command = cmd.toJSON()
                                if (command.required) {
                                    usage += ` ${legend.required.open}${command.name}${legend.required.close}`;
                                } else {
                                    usage += ` ${legend.optional.open}${command.name}${legend.optional.close}`;
                                }
                            }
                            return '```' + markupLang + '\n' + usage + '```';
                        })(),
                        inline: true,
                    },
                ]);
            }

            // Add a legend if needed
            if (command.usage || command.data.options.length !== 0) {
                response.addFields([
                    {
                        name: `Legend:`,
                        value: `\`${legend.required.open} ${legend.required.close}\`: required.\n\`${legend.optional.open} ${legend.optional.close}\`: optional.`,
                        inline: true,
                    },
                ])
            }

            // If there are required perms or roles the user needs to do this command.
            if (command.requiredPermissions) {
                let perms = '';
                if (command.requiredPermissions) {
                    perms += 'Permissions: ';
                    perms += '`' + command.requiredPermissions.toArray().join('`, `') + '`';
                    perms += '\n';
                }


                response.addFields([
                    {
                        name: `Requirements:`,
                        value: `${perms}`,
                        inline: false,
                    },
                ]);
            }

            return await interaction.reply(response);
        }
    },
})
