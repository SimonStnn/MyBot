const { tgmcDataID, channelIds } = require('../config.json');
const tgmcDataModel = require('../schemas/tgmc/tgmcDataModel.js');
const tgmcParticipantModel = require('../schemas/tgmc/tgmcParticipantModel.js');
const tgmcVotesModel = require('../schemas/tgmc/tgmcVotesModel.js');
const mongoose = require('mongoose');

let tgmcData;

module.exports = {
   name: 'messageReactionRemove',
   async execute(client, reaction, user) {
      if (reaction.message.partial) {
         try {
            await reaction.message.fetch();
         } catch (error) {
            logs.error(
               reaction.client,
               err,
               'Something went wrong when fetching the message in messageReactionRemove.'
            );
         }
      }
      //! Removing vote in #tgmc.
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
         // Check if person voted, if not return.
         const voteProfile = await tgmcVotesModel.findOne({ userId: user.id });
         if (!voteProfile) {
            return;
         }
         if (reaction.message.author.id != voteProfile.votedTo) {
            return;
         }
         try {
            await tgmcVotesModel.findOneAndRemove({ userId: user.id });
            // Find who's message it is and change amount of votes.
            const newVoteCount = (await reaction.count) - 1;
            await tgmcParticipantModel.findOneAndUpdate(
               { userId: reaction.message.author.id },
               {
                  votes: newVoteCount,
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
      console.log(
         `${user.username} removed their "${reaction.emoji.name} " reaction.`
      );
   },
};
