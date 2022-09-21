const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildIds, token } = require('./config.json');
const fs = require('fs');

deploy_global = true

const commands = [];
const globalCommands = []
const commandFolders = fs.readdirSync('./commands');
for (const folder of commandFolders) {
   // if (folder === 'music') { continue; }
   const commandFiles = fs
      .readdirSync(`./commands/${folder}`)
      .filter((file) => file.endsWith('.js'));
   for (const file of commandFiles) {
      const command = require(`./commands/${folder}/${file}`);
      commands.push(command.data.toJSON());
      if (command.global) {
         globalCommands.push(command.data.toJSON())
      }
   }
}

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
   try {
      console.log('Started refreshing application (/) commands.');

      await rest.put(Routes.applicationGuildCommands(clientId, guildIds.main), {
         body: commands,
      });
      await rest.put(Routes.applicationGuildCommands(clientId, guildIds.mc), {
         body: globalCommands,
      });
      await rest.put(Routes.applicationCommands(clientId), {
         body: [],
      });

      console.log('Successfully reloaded application (/) commands.');
   } catch (error) {
      console.error(error);
   }
})();
