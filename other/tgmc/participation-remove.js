const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const tgmcParticipantModel = require('../../schemas/tgmc/tgmcParticipantModel.js');
const tgmcVotesModel = require('../../schemas/tgmc/tgmcVotesModel.js');
const tgmcDataModel = require('../../schemas/tgmc/tgmcDataModel.js');
const {
   tgmcDataID,
   channelIds,
   roleIds,
   colors,
} = require('../../config.json');
const logs = require('../../files/log.js');

let tgmcData;

module.exports = {
   data: new SlashCommandBuilder()
      .setName('participation-remove')
      .setDescription('Remove participation for a user.')
      .addUserOption((option) =>
         option
            .setName('target')
            .setDescription('The user to remove their participation.')
            .setRequired(true)
      ),
   database: true,
   reqRoles: [roleIds.dailyMemeHost],
   async execute(interaction) {
      // Check if tgmc is open
      tgmcData = await tgmcDataModel.findById(tgmcDataID);
      if (tgmcData.state == 'closed') {
         return await interaction.reply({
            content: `This command isn't available right now. Tgmc is ${tgmcData.state}.`,
            ephemeral: true,
         });
      }
      // Get the user to remove.
      const user = interaction.options.getUser('target');
      // Delete TgmcParticipantModel
      const tgmcMessage = await tgmcParticipantModel.findOneAndDelete({
         userId: user.id,
      });
      if (!tgmcMessage) {
         return await interaction.reply({
            content: "Couldn't find their participation model.",
            ephemeral: true,
         });
      }

      // Delete all votes.
      const votes = await tgmcVotesModel.find({ votedTo: user.id });
      await tgmcVotesModel.deleteMany({ votedTo: user.id });

      // Make embed
      const embed = new EmbedBuilder()
         .setColor(colors.command)
         .setTimestamp()
         .setDescription(
            `\`${tgmcMessage.usertag}\` removed their meme in <#${channelIds.tgmc}>.\nThis means your vote has been removed, it would be appreciated if you vote for someone else. ❤`
         );

      // await tgmcParticipantModel.deleteOne({ userId: user.id });
      // Delete the message.
      const tgmcCh = interaction.guild.channels.cache.get(channelIds.tgmc);
      const msgId = tgmcMessage.messageURL.slice(-18);
      const msg = await tgmcCh.messages
         .fetch(msgId)
         .then(() => {
            msg.delete();
         })
         .catch((err) => {
            logs.error(
               interaction.client,
               err,
               "Couldn't delete/find the message"
            );
            return;
         });
      tgmcCh.permissionOverwrites.edit(user.id, {
         SEND_MESSAGES: null,
      });

      for (let i = 0; i < votes.length; i++) {
         const user = await interaction.client.users.fetch(votes[i].userId);
         if (user) {
            await user.send({ embeds: [embed] }).catch((err) => {
               logs.error(
                  interaction.client,
                  err,
                  `Couldn't send message to ${user.tag}.`
               );
            });
         }
      }

      return await interaction.reply({
         content: `Succesfully removed \`${user.tag}\`'s data.\nMake sure their [message](${tgmcMessage.messageURL}) was deleted in <#${channelIds.tgmc}>.`,
         ephemeral: true,
      });
   },
};
