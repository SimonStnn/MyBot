const fs = require('fs');
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const { Player } = require('discord-player');
const { token } = require('./config.json');
const cron = require('node-cron');

//
//* Client
//
const client = new Client({
   intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.GuildVoiceStates,
      // GatewayIntentBits.
   ],
   partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});


//
//* Event handler
//
const eventFiles = fs
   .readdirSync('./events')
   .filter((file) => file.endsWith('.js'));

for (const file of eventFiles) {
   const event = require(`./events/${file}`);
   if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
   } else {
      client.on(event.name, (...args) => event.execute(client, ...args));
   }
}

//
//* Music player
//
client.player = new Player(client, {
   ytdlOptions: {
      quality: 'highestaudio', // Don't touch
      highWaterMark: 1 << 25, // Don't touch
   },
});
// console.log(client.player)

//* Music event handler
const musicEventFiles = fs
   .readdirSync('./events/musicEvents')
   .filter((file) => file.endsWith('.js'));

for (const file of musicEventFiles) {
   const event = require(`./events/musicEvents/${file}`);
   client.player.on(event.name, (...args) =>
      event.execute(client, ...args)
   );
}

//
//* Command handler
//
client.commands = new Collection();
const commandFolders = fs.readdirSync('./commands');
for (const folder of commandFolders) {
   // if (folder === 'music') { continue; }
   const commandFiles = fs
      .readdirSync(`./commands/${folder}`)
      .filter((file) => file.endsWith('.js'));
   for (const file of commandFiles) {
      const command = require(`./commands/${folder}/${file}`);
      client.commands.set(command.data.name, command);
   }
}

//
//* Autocomplete handler
//
const autocomplete = require('./files/autocomplete.js');
for (const folder of commandFolders) {
   const commandFiles = fs
      .readdirSync(`./commands/${folder}`)
      .filter((file) => file.endsWith('.js'));
   for (const file of commandFiles) {
      const command = require(`./commands/${folder}/${file}`);
      if (command.data.options) {
         for (const option of command.data.options) {
            if (option.autocomplete) {
               autocomplete.handle(client, command.data.name, command.autocompleteChoices)
            }
         }
      }
   }
}

//
//* Cron schedule handler
//
{
   // ┌────────────── second(optional)
   // │ ┌──────────── minute
   // │ │ ┌────────── hour
   // │ │ │ ┌──────── day of month
   // │ │ │ │ ┌────── month
   // │ │ │ │ │ ┌──── day of week
   // │ │ │ │ │ │
   // │ │ │ │ │ │
   // * * * * * *
}
const scheduleFiles = fs
   .readdirSync('./schedules')
   .filter((file) => file.endsWith('.js'));
for (const file of scheduleFiles) {
   const schedule = require(`./schedules/${file}`);
   cron.schedule(schedule.time, () => {
      schedule.execute(client);
   });
}

// //
// //* HTTP Server
// //
// const { startServer } = require('./web/server.js')
// startServer(client)

client.login(token);
