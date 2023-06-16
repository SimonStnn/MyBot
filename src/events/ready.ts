import { Client, ActivityType } from 'discord.js';
import { guildIds, channelIds, roleIds, userIds } from '../config.json';
import mongoose from 'mongoose';

// When the client is ready, run this code (only once)
module.exports = {
   name: 'ready',
   once: true,
   async execute(client: Client) {
      console.log('Preparing...');
      client.user?.setActivity('Starting...', { type: ActivityType.Streaming });


      const databaseConnection = process.env.DATABASE_CONNECTION;

      if (!databaseConnection) {
         throw new Error('Missing database connection string.');
      }

      mongoose.connect(databaseConnection)
         .then((_mongoose) => {
            console.log('Connected to DataBase.');
         })
         .catch((_err) => {
            console.error("Could not connect to database")

         });
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      //userFindAndModify: false

      console.log("Checkking id's in config.json");

      const guild = client.guilds.cache.get(guildIds.main);
      if (guild) {

         await Promise.all([
            check('channel', channelIds, (id) => guild.channels.cache.get(id)),
            check('role', roleIds, (id) => guild.roles.cache.get(id)),
            check('user', userIds, async (id) => await client.users.fetch(id)),
         ]);
      }


      console.log(
         'Ready!',
         'Logged in as',
         `${client.user?.tag}`
      );
      client.user?.setActivity('/help', { type: ActivityType.Listening });
   },
};

function ObjectKeysToArray(_ids: IdsObject) {
   const arr = [];
   for (let key in _ids) {
      arr.push({
         key,
         id: _ids[key],
      });
   }
   return arr;
}

interface IdsObject {
   [key: string]: string;
}

type Callback = (result: string) => Promise<any> | any;
async function check(text: string, _ids: IdsObject, fetch: Callback) {
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
         `<->   Found ${text + (found.length > 1 ? 's' : '')}:`.padEnd(21),
         found.join(', ')
      );
   }
   if (notFound.length > 0) {
      console.log(
         `<!>   Did not find ${text + (notFound.length > 1 ? 's' : '')}:`.padEnd(25),
         notFound.join(', ')
      );
   }
}
