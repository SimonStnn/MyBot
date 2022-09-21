const { guildIds, tgmcDataID, channelIds, roleIds } = require('../config.json');
const mongoose = require('mongoose');
const tgmcDataModel = require('../schemas/tgmc/tgmcDataModel.js');
const logs = require('../files/log.js');

let state = null;

module.exports = {
   name: 'dbCheck',
   time: '* * * * *',
   async execute(client) {
      //? Check db connection
      if (!mongoose.connection.readyState && (state === 1 || state === null)) {
         const guild = client.guilds.cache.get(guildIds.main);

         await updatePerms(
            client,
            guild,
            channelIds.dontBreakChain,
            guild.id,
            false
         );
         await updatePerms(
            client,
            guild,
            channelIds.tgmc,
            roleIds.tgmcParticipant,
            false
         );

         await logs.post(
            client,
            'Update of Perms',
            null,
            'Closed channels due to no database connection.'
         );
         state = 0;
      } else if (
         mongoose.connection.readyState &&
         (state === 0 || state === null)
      ) {
         const guild = client.guilds.cache.get(guildIds.main);

         await updatePerms(
            client,
            guild,
            channelIds.dontBreakChain,
            guild.id,
            null
         );

         const tgmcData = await tgmcDataModel.findById(tgmcDataID);
         if (tgmcData.state == 'open') {
            await updatePerms(
               client,
               guild,
               channelIds.tgmc,
               roleIds.tgmcParticipant,
               true
            );
         }
         if (state !== null) {
            await logs.post(
               client,
               'Update of Perms',
               null,
               'Opened channels.'
            );
         }
         state = 1;
      }
   },
};

async function updatePerms(client, guild, channelID, id, state) {
   try {
      const channel = guild.channels.cache.get(channelID);
      await channel.permissionOverwrites.edit(id, {
         SendMessages: state,
      });
   } catch (err) {
      logs.error(client, err);
   }
}
