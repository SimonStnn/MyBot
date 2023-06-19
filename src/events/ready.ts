import { Client, ActivityType } from 'discord.js';
import { guildId, channelIds, roleIds, userIds } from '../config.json';
import { MongoClient, ServerApiVersion } from 'mongodb';
import logger from '../log/logger';

// When the client is ready, run this code (only once)
export default {
   name: 'ready',
   once: true,
   async execute(client: Client) {
      logger.info('Preparing...');
      client.user?.setActivity('Starting...', { type: ActivityType.Streaming });

      const databaseConnection = process.env.DATABASE_CONNECTION;

      if (!databaseConnection) {
         throw new Error('Missing database connection string.');
      }

      // Connect to mongoDB
      client.database = new MongoClient(process.env.DATABASE_CONNECTION as string, {
         serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
         }
      });
      try {
         logger.info("Connecting to MongoDB...");
         // Connect the client to the server	(optional starting in v4.7)
         await client.database.connect();
         // Send a ping to confirm a successful connection
         await client.database.db("admin").command({ ping: 1 });
         logger.info("Successfully connected to MongoDB!");
      } catch (err) {
         logger.warn(`Failed to connect to MongoDB.\n${err}`)
      }

      const guild = client.guilds.cache.get(guildId);
      if (guild) {

         await Promise.all([
            check('channel', channelIds, (id) => guild.channels.cache.get(id)),
            check('role', roleIds, (id) => guild.roles.cache.get(id)),
            check('user', userIds, async (id) => await client.users.fetch(id)),
         ]);
      }


      logger.info(`Ready! Logged in as ${client.user?.tag}`);
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
      logger.info(
         `<->   Found ${text + (found.length > 1 ? 's' : '')}:`.padEnd(21),
         found.join(', ')
      );
   }
   if (notFound.length > 0) {
      logger.info(
         `<!>   Did not find ${text + (notFound.length > 1 ? 's' : '')}:`.padEnd(25),
         notFound.join(', ')
      );
   }
}
