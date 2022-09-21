const {
   mongoDB_Connection,
   guildIds,
   channelIds,
   roleIds,
   userIds,
} = require('../config.json');
const mongoose = require('mongoose');
const colors = require('colors');
const logs = require('../files/log.js');
const { ActivityType } = require('discord.js')

// When the client is ready, run this code (only once)
module.exports = {
   name: 'ready',
   once: true,
   async execute(client) {
      console.log('Preparing...');

      try {
         await mongoose.connect(mongoDB_Connection, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            //userFindAndModify: false
         });
         console.log('Connected'.underline.green, 'to DataBase.');
      } catch (err) {
         logs.error(
            client,
            err,
            'Failed to connected to DataBase.',
            'Check if IP is still whitelisted.'
         );
      }

      console.log("Checkking id's in config.json");

      const guild = client.guilds.cache.get(guildIds.main);
      await Promise.all([
         check('channel', channelIds, (id) => guild.channels.cache.get(id)),
         check('role', roleIds, (id) => guild.roles.cache.get(id)),
         check('user', userIds, async (id) => await client.users.fetch(id)),
      ]);

      client.user.setActivity('/help', { type: ActivityType.Listening });

      console.log(
         'Ready!'.bold.green,
         'Logged in as',
         `${client.user.tag}`.cyan
      );
   },
};

function ObjectKeysToArray(_ids) {
   const arr = [];
   for (let key in _ids) {
      arr.push({
         key,
         id: _ids[key],
      });
   }
   return arr;
}

async function check(text, _ids, fetch) {
   const ids = ObjectKeysToArray(_ids);
   const found = [];
   const notFound = [];

   for (const id of ids) {
      try {
         const f = await fetch(id.id);
         if (f) {
            found.push(id.key);
         } else {
            throw id.key;
         }
      } catch (err) {
         notFound.push(id.key);
      }
   }

   if (found.length > 0) {
      console.log(
         '<->'.bold.green,
         `\tFound ${text + found.length > 1 ? 's' : ''}:\t`,
         found.join(', ')
      );
   }
   if (notFound.length > 0) {
      console.log(
         '<!>'.bold.red,
         `\tDid not find ${text + notFound.length > 1 ? 's' : ''}:\t`.underline.red,
         notFound.join(', ')
      );
   }
}
