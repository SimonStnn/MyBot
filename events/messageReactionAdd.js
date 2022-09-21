const { EmbedBuilder } = require('discord.js');
const {
   tgmcDataID,
   channelIds,
   tgmcRulesMsgLink,
   colors,
} = require('../config.json');
const tgmcDataModel = require('../schemas/tgmc/tgmcDataModel.js');
const tgmcParticipantModel = require('../schemas/tgmc/tgmcParticipantModel.js');
const tgmcVotesModel = require('../schemas/tgmc/tgmcVotesModel.js');
const mongoose = require('mongoose');
const logs = require('../files/log.js');

let tgmcData;

module.exports = {
   name: 'messageReactionAdd',
   async execute(client, reaction, user) {
      // Runs on every message.
      if (reaction.partial) {
         // If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
         try {
            await reaction.fetch();
         } catch (error) {
            logs.error(
               reactoin.client,
               error,
               'Something went wrong when fetching the message in messageReactionAdd.'
            );
            // Return as `reaction.message.author` may be undefined/null
            return;
         }
      }
      //! Vote in #tgmc.
      if (
         reaction.message.channel.id == channelIds.tgmc &&
         reaction.emoji.name == '⬆️'
      ) {
         if (user.bot) {
            return;
         }
         // Check if you are connected to database.
         const connected = mongoose.connection.readyState;
         if (!connected) {
            console.log('Not connected to database.');
            return;
         }
         // Check if tgmc is open.
         tgmcData = await tgmcDataModel.findById(tgmcDataID);
         if (tgmcData.state == 'closed') {
            return;
         }

         // You can't vote for yourself.
         if (user.id === reaction.message.author.id) {
            const embed = new EmbedBuilder()
               .setColor(colors.command)
               .setTimestamp()
               .setDescription(
                  `You can not vote for yourself.\nPlease read the rules [here](${tgmcRulesMsgLink}).`
               );
            await user.send({ embeds: [embed] }).catch((err) => {
               logs.error(
                  reaction.client,
                  err,
                  `Couldn't send a message to ${message.author.tag}`
               );
            });
            await reaction.users.remove(user.id);
            return;
         }
         // Check if person already voted.
         const voteProfile = await tgmcVotesModel.findOne({ userId: user.id });
         if (voteProfile) {
            await reaction.users.remove(user.id);

            const embed = new EmbedBuilder()
               .setColor(colors.command)
               .setTimestamp()
               .setDescription(
                  `You already voted for \`${voteProfile.votedToTag}\` [here](${voteProfile.messageURL}). If you want to vote for \`${reaction.message.author.tag}\` you need to remove you previous vote.`
               );
            await user.send({ embeds: [embed] }).catch((err) => {
               logs.error(
                  reaction.client,
                  err,
                  `Couldn't send a message to ${message.author.tag}`
               );
            });
            return;
         }
         try {
            await tgmcVotesModel.create({
               usertag: user.tag,
               userId: user.id,
               votedToTag: reaction.message.author.tag,
               votedTo: reaction.message.author.id,
               messageURL: reaction.message.url,
            });
         } catch (err) {
            await user
               .send('Failed to create your vote. Please try again.')
               .catch((err) => {
                  logs.error(
                     reaction.client,
                     err,
                     `Couldn't send a message to ${message.author.tag}`
                  );
               });
            await reaction.users.remove(user.id);
            return;
         }
         // Find who's message it is and change amount of votes in database.
         try {
            await tgmcParticipantModel.findOneAndUpdate(
               { userId: reaction.message.author.id },
               {
                  votes: reaction.count - 1, // - 1 => bot reaction.
               }
            );
            console.log(
               `${reaction.message.author.tag} now has ${
                  reaction.count - 1
               } vote(s).`
            );
         } catch (err) {
            logs.error(reaction.client, err);
         }
      }

      // Now the message has been cached and is fully available
      console.log(
         `${user.tag} reacted to ${reaction.message.author.tag}'s message in #${reaction.message.channel.name}, it now has ${reaction.count} reactions.`
      );
      // The reaction is now also fully available and the properties will be reflected accurately:
   },
};
