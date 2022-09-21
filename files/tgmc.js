const { guildIds, tgmcDataID, channelIds, roleIds } = require('../config.json');
const { EmbedBuilder, Permissions } = require('discord.js'); //! 'Permissions' can NOT be removed.
const tgmcParticipantModel = require('../schemas/tgmc/tgmcParticipantModel.js');
const tgmcVotesModel = require('../schemas/tgmc/tgmcVotesModel.js');
const tgmcDataModel = require('../schemas/tgmc/tgmcDataModel.js');
const logs = require('../files/log.js');

let tgmcData;

module.exports = {
   //! Open -----------------------------------------------------------------------------------------------------------
   async open(client) {
      // Get Pizzacord guild
      const guild = client.guilds.cache.get(guildIds.main);
      // Get tgmc channel
      const tgmcCh = guild.channels.cache.get(channelIds.tgmc);
      const motdStaffCh = guild.channels.cache.get(channelIds.motdStaff);
      // Get required roles
      const DailyMemeHostR = guild.roles.cache.get(roleIds.dailyMemeHost);
      const tgmcParticipantR = guild.roles.cache.get(roleIds.tgmcParticipant);
      const MutedR = guild.roles.cache.get(roleIds.muted);

      tgmcData = await tgmcDataModel.findById(tgmcDataID);
      if (tgmcData.state == 'open') {
         return motdStaffCh.send("Didn't open tgmc => already open.");
      }

      // Remove roles from previous winners.
      let lastwinner_User = await guild.members.fetch(tgmcData.nr1_id);
      if (lastwinner_User) {
         lastwinner_User.roles.remove(roleIds.tgmc1st);
      } else {
         console.log(
            `Couldn\'t find ${tgmcData.nr1_tag} => Didn't remove 1st place role.`
         );
      }

      lastwinner_User = await guild.members.fetch(tgmcData.nr2_id);
      if (lastwinner_User) {
         lastwinner_User.roles.remove(roleIds.tgmc2nd);
      } else {
         console.log(
            `Couldn\'t find ${tgmcData.nr2_tag} => Didn't remove 2nd place role.`
         );
      }

      lastwinner_User = await guild.members.fetch(tgmcData.nr3_id);
      if (lastwinner_User) {
         lastwinner_User.roles.remove(roleIds.tgmc3rd);
      } else {
         console.log(
            `Couldn\'t find ${tgmcData.nr3_tag} => Didn't remove 3rd place role.`
         );
      }

      //Overwrite persmissions from channel.
      tgmcCh.permissionOverwrites.set([
         {
            id: tgmcParticipantR,
            allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
            deny: ['ADD_REACTIONS'],
         },
         {
            id: DailyMemeHostR,
            allow: [
               'VIEW_CHANNEL',
               'SEND_MESSAGES',
               'MANAGE_MESSAGES',
               'MANAGE_ROLES',
               'MANAGE_CHANNELS',
               'ADD_REACTIONS',
            ],
         },
         {
            id: MutedR,
            deny: ['SEND_MESSAGES', 'ADD_REACTIONS'],
         },
         // {
         //     id: guild.id,
         //     deny: ['VIEW_CHANNEL'],
         // },
      ]);
      // Make embed.
      const Embed = new EmbedBuilder()
         .setColor(0xffc300)
         .setTitle('The Grand Meme Contest channel is open!')
         .setDescription('You can start post your memes now!')
         .addFields([
            {
               name: 'Make sure you read the rules',
               value: `Reading the rules is very important. Make sure you don't mis anything.`,
            },
            {
               name: 'Votes',
               value: 'The votes will be counted on Sunday, after which the winner will be announced.',
            },
         ])
         .setFooter({ text: 'Have fun and good luck!' });
      // Change topic.
      tgmcCh.setTopic(
         'Status __**Open**__ | The-grand-meme-contest. Make sure to read the grand meme contest rules and react with to get the participant role. That way you can post your meme.'
      );
      // Send message in #tgmc and reply to interaction.
      //! Backslash weg doen na testen.
      tgmcCh.send({ content: `${tgmcParticipantR}`, embeds: [Embed] });
      await tgmcDataModel.findByIdAndUpdate(tgmcDataID, {
         state: 'open',
      });
      return motdStaffCh.send(
         `The grand meme contest has __**started**__ in ${tgmcCh}.`
      );
   },
   //! Close ----------------------------------------------------------------------------------------------------------
   async close(client) {
      // Get Pizzacord guild
      const guild = client.guilds.cache.get(guildIds.main);
      // Get tgmc channel
      const tgmcCh = guild.channels.cache.get(channelIds.tgmc);
      const motdStaffCh = guild.channels.cache.get(channelIds.motdStaff);
      // Get required roles //! test-channel = 806480788701970462
      const DailyMemeHostR = guild.roles.cache.get(roleIds.dailyMemeHost);
      const tgmcParticipantR = guild.roles.cache.get(roleIds.tgmcParticipant);
      const MutedR = guild.roles.cache.get(roleIds.muted);

      tgmcData = await tgmcDataModel.findById(tgmcDataID);
      if (tgmcData.state == 'closed') {
         return motdStaffCh.send(
            'Tried to close tgmc, but tgmc is already closed.'
         );
      }
      // Find top 3 people with most votes.
      const winners = await tgmcParticipantModel.find({}, null, {
         sort: { votes: -1 },
         limit: 3,
      });
      // Put them in a string.
      // And give them their new roles and store tag and id in database.
      let fieldDescription = '';
      if (winners.length == 3) {
         fieldDescription = `> 🥇 <@${winners[0].userId}> (${winners[0].votes}) [Jump!](${winners[0].messageURL})\n> 🥈 <@${winners[1].userId}> (${winners[1].votes}) [Jump!](${winners[1].messageURL})\n> 🥉 <@${winners[2].userId}> (${winners[2].votes}) [Jump!](${winners[2].messageURL})`;
         await tgmcDataModel.findByIdAndUpdate(tgmcDataID, {
            state: 'closed',
            nr1_tag: winners[0].usertag,
            nr1_id: winners[0].userId,
            nr2_tag: winners[1].usertag,
            nr2_id: winners[1].userId,
            nr3_tag: winners[2].usertag,
            nr3_id: winners[2].userId,
         });

         let User = guild.members.cache.get(winners[0].userId);
         let Role = guild.roles.cache.find(
            (role) => role.id === roleIds.tgmc1st
         ); // 1st place role = 809111078540804116
         if (User) {
            User.roles.add(Role);
         }
         User = guild.members.cache.get(winners[1].userId);
         Role = guild.roles.cache.find((role) => role.id === roleIds.tgmc2nd); // 2nd place role = 809111863102275615
         if (User) {
            User.roles.add(Role);
         }
         User = guild.members.cache.get(winners[2].userId);
         Role = guild.roles.cache.find((role) => role.id === roleIds.tgmc3rd); // 3rd place role = 809111967276335154
         if (User) {
            User.roles.add(Role);
         }
      } else if (winners.length == 2) {
         fieldDescription = `> 🥇 <@${winners[0].userId}> (${winners[0].votes}) [Jump!](${winners[0].messageURL})\n> 🥈 <@${winners[1].userId}> (${winners[1].votes}) [Jump!](${winners[1].messageURL})`;
         await tgmcDataModel.findByIdAndUpdate(tgmcDataID, {
            state: 'closed',
            nr1_tag: winners[0].usertag,
            nr1_id: winners[0].userId,
            nr2_tag: winners[1].usertag,
            nr2_id: winners[1].userId,
         });
         let User = guild.members.cache.get(winners[0].userId);
         let Role = guild.roles.cache.find(
            (role) => role.id === roleIds.tgmc1st
         ); // 1st place role = 809111078540804116
         User.roles.add(Role);
         User = guild.members.cache.get(winners[1].userId);
         Role = guild.roles.cache.find((role) => role.id === roleIds.tgmc2nd); // 2nd place role = 809111863102275615
         User.roles.add(Role);
      } else if (winners.length == 1) {
         fieldDescription = `> 🥇 <@${winners[0].userId}> (${winners[0].votes}) [Jump!](${winners[0].messageURL})`;
         await tgmcDataModel.findByIdAndUpdate(tgmcDataID, {
            state: 'closed',
            nr1_tag: winners[0].usertag,
            nr1_id: winners[0].userId,
         });
         let User = guild.members.cache.get(winners[0].userId);
         let Role = guild.roles.cache.find(
            (role) => role.id === roleIds.tgmc1st
         ); // 1st place role = 809111078540804116
         User.roles.add(Role);
      } else {
         fieldDescription = `> No participants.`;
         await tgmcDataModel.findByIdAndUpdate(tgmcDataID, {
            state: 'closed',
         });
      }
      // Make an embed.
      const embed = new EmbedBuilder()
         .setColor(0xffc300)
         .setTitle('The Grand Meme Contest just ended!')
         .setDescription(
            'Thank you for participating in The Grand Meme Contest.\nWe hope everyone liked it!'
         )
         .addFields([{ name: 'Here are the winners:', value: fieldDescription }])
         .setFooter({ text: 'Better luck next time everyone!' });
      // Delete everyone and everything from tgmc database.
      try {
         await tgmcParticipantModel.deleteMany({});
         await tgmcVotesModel.deleteMany({});
      } catch (err) {
         logs.error(client, err);
      }
      // Overwrite persmissions from channel.
      tgmcCh.permissionOverwrites.set([
         {
            id: tgmcParticipantR,
            allow: ['VIEW_CHANNEL'],
            deny: ['SEND_MESSAGES', 'ADD_REACTIONS'],
         },
         {
            id: DailyMemeHostR,
            allow: [
               'VIEW_CHANNEL',
               'SEND_MESSAGES',
               'MANAGE_MESSAGES',
               'MANAGE_ROLES',
               'MANAGE_CHANNELS',
               'ADD_REACTIONS',
            ],
         },
         {
            id: MutedR,
            deny: ['SEND_MESSAGES', 'ADD_REACTIONS'],
         },
         // {
         //     id: guild.id,
         //     deny: ['VIEW_CHANNEL'],
         // },
      ]);
      // Change topic.
      tgmcCh.setTopic(
         'Status __**Closed**__ | The-grand-meme-contest. Make sure to read the grand meme contest rules and react with to get the participant role. That way you can post your meme.'
      );
      // Send embed in #tgmc and int motd staff.
      //! Backslash weg doen na testen.
      tgmcCh.send({ content: `${tgmcParticipantR}`, embeds: [embed] });
      return motdStaffCh.send(
         `The grand meme contest has __**ended**__ in ${tgmcCh}.`
      );
   },
};
