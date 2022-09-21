const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { colors, legend } = require('../../config.json');
const fs = require('fs');

const autocompleteChoices = (() => {
   const commands = [];
   const commandFolders = fs.readdirSync('./commands');
   for (const folder of commandFolders) {
      const commandFiles = fs
         .readdirSync(`./commands/${folder}`)
         .filter((file) => file.endsWith('.js'));
      for (const file of commandFiles) {
         commands.push(file.replace('.js', ''));
      }
   }
   return commands.sort();
})()


module.exports = {
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
   global: true,
   async execute(interaction) {
      let requestedCommand = interaction.options.getString('command');
      const commandsEmbed = new EmbedBuilder()
         .setColor(colors.command)
         .setAuthor({
            name: `${interaction.client.user.tag}`,
            iconURL: interaction.client.user.displayAvatarURL({
               dynamic: true,
            }),
         })
         .setTimestamp()
         .setFooter({
            text: `${interaction.user.tag}`,
            iconURL: `${interaction.user.displayAvatarURL({ dynamic: true })}`,
         });
      // If there isn't any command mentioned, display all commands.
      if (!requestedCommand) {
         const markupLang = 'md';
         let commands = '';
         // Get all folders in ./commands.
         const commandFolders = fs.readdirSync('./commands');
         for (const folder of commandFolders) {
            // Get all files in 'folder' that ends with .js.
            const commandFiles = fs
               .readdirSync(`./commands/${folder}`)
               .filter((file) => file.endsWith('.js'));
            for (let i = 0; i < commandFiles.length; i++) {
               commands += `${i + 1}.${commandFiles.length > 9 && i + 1 <= 9 ? ' ' : ''
                  } /${commandFiles[i].replace('.js', '')}\n`; //▸
            }

            if (commands == '') {
               commands = '\u200b';
            }
            commandsEmbed.addFields([
               {
                  name: folder.charAt(0).toUpperCase() + folder.slice(1),
                  value: '```' + markupLang + '\n' + commands + '```',
                  inline: true,
               },
            ]);
            commands = '';
         }
         commandsEmbed.addFields([
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
         return await interaction.reply({ embeds: [commandsEmbed] });
         // Else if there is a command mentioned, give info about that command.
      } else {
         if (requestedCommand.startsWith('/')) {
            requestedCommand = requestedCommand.slice(1);
         }

         const command = interaction.client.commands.get(requestedCommand);
         if (!command) {
            return await interaction.reply(
               `\`${requestedCommand}\` isn't a command.`
            );
         }
         // if there is a discription add it to a field in embed.
         commandsEmbed.setDescription(
            `Displaying info for \`/${requestedCommand}\``
         );
         if (command.data.description) {
            commandsEmbed.addFields([
               { name: `Description:`, value: command.data.description },
            ]);
         }
         const markupLang = 'ml';
         // Dynamic usage info
         if (command.usage) {
            commandsEmbed.addFields([
               {
                  name: `Usage:`,
                  value: '```' + markupLang + '\n' + command.usage + '```',
                  inline: true,
               },
            ]);
            addLegend(commandsEmbed);
         } else if (command.data.options.length !== 0) {
            commandsEmbed.addFields([
               {
                  name: `Usage:`,
                  value: (() => {
                     let usage = `/${command.data.name}`;
                     for (let i = 0; i < command.data.options.length; i++) {
                        const cmd = command.data.options[i];
                        if (cmd.required) {
                           usage += ` ${legend.required.open}${cmd.name}${legend.required.close}`;
                        } else {
                           usage += ` ${legend.optional.open}${cmd.name}${legend.optional.close}`;
                        }
                     }
                     return '```' + markupLang + '\n' + usage + '```';
                  })(),
                  inline: true,
               },
            ]);
            addLegend(commandsEmbed);
         }
         // If there are required perms or roles the user needs to do this command.
         if (command.reqPerms || command.reqRoles) {
            let perms = '';
            if (command.reqPerms) {
               perms += 'Permissions: ';
               perms += '`' + command.reqPerms.join('`, `') + '`';
               perms += '\n';
            }
            let roles = '';
            if (command.reqRoles) {
               roles += 'Roles: ';

               let _roles = [];
               for (let i = 0; i < command.reqRoles.length; i++) {
                  const role = interaction.guild.roles.cache.find(
                     (role) => role.id === command.reqRoles[i]
                  );
                  _roles.push(role);
               }

               roles += _roles.join(', ');
            }

            commandsEmbed.addFields([
               {
                  name: `Requirements:`,
                  value: `${perms}${roles}`,
                  inline: false,
               },
            ]);
         }

         return await interaction.reply({ embeds: [commandsEmbed] });
      }
   },
};

function addLegend(embed) {
   return embed.addFields([
      {
         name: `Legend:`,
         value: `\`${legend.required.open} ${legend.required.close}\`: required.\n\`${legend.optional.open} ${legend.optional.close}\`: optional.`,
         inline: true,
      },
   ]);
}
