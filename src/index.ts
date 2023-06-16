// Require the necessary discord.js classes
import fs from 'node:fs';
import path from 'node:path';
import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';

require('dotenv').config();

declare module 'discord.js' {
   interface Client {
      commands: Collection<string, any>;
   }
}

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

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
      client.on(event.name, (...args) =>event.execute(client, ...args));
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
      const command = require(filePath);
      // Set a new item in the Collection with the key as the command name and the value as the exported module
      if ('data' in command && 'execute' in command) {
         client.commands.set(command.data.name, command);
      } else {
         console.warn(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
      }
   }
}

// Log in to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);