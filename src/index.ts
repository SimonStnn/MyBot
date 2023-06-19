// Require the necessary discord.js classes
import fs from 'node:fs';
import path from 'node:path';
import { Collection } from 'discord.js';
import Command from './protocols/command';
import client from './client'
import { setupLogger } from './log/logger';
require('dotenv').config();

//
//* Event handler
//

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
   const filePath = path.join(eventsPath, file);
   const event = require(filePath);
   if (event.once) {
      client.once(event.name, (...args) => event.execute(client, ...args));
   } else {
      client.on(event.name, (...args) => event.execute(client, ...args));
   }
}

//
//* Command handler
//

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandSubFolders = fs.readdirSync(commandsPath).filter(file => {
   const filePath = path.join(commandsPath, file);
   return fs.statSync(filePath).isDirectory();
});

for (const folder of commandSubFolders) {
   const subfolderPath = path.join(commandsPath, folder)
   const commandFiles = fs.readdirSync(subfolderPath).filter(file => file.endsWith('.js'));
   for (const file of commandFiles) {
      const filePath = path.join(subfolderPath, file);
      const command: Command = require(filePath).default;
      command.category = folder

      // Set a new item in the Collection with the key as the command name and the value as the exported module
      if (command.data) {
         client.commands.set(command.data.name, command);
      } else {
         console.warn(`[WARNING] The command at ${filePath} is missing a required "data" property.`);
      }
   }
}

//
//* Setup logger module
//
setupLogger(client)

export default client;
// Log in to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);