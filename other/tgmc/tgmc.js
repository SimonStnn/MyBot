const { SlashCommandBuilder } = require('discord.js'); //! 'Permissions' can NOT be removed.
const tgmcParticipantModel = require('../../schemas/tgmc/tgmcParticipantModel.js');
const { roleIds } = require('../../config.json');
const tgmc = require('../../files/tgmc.js');

let tgmcData;

module.exports = {
   data: new SlashCommandBuilder()
      .setName('tgmc')
      .setDescription('Change permissions in #tgmc.')
      .addStringOption((option) =>
         option
            .setName('state')
            .setDescription('Open or close tgmc')
            .setRequired(false)
            .addChoices(
               { name: 'Start tgmc', value: 'Open' },
               { name: 'End tgmc', value: 'CLose' }
            )
      ),
   database: true,
   reqRoles: [roleIds.dailyMemeHost],
   async execute(interaction) {
      const state = interaction.options.getString('state');
      if (state) {
         switch (state) {
            //! OPEN
            case 'Open':
               tgmc.open(interaction.client);
               return await interaction.reply({
                  content: 'Opened tgmc.',
                  ephemeral: true,
               });

            //! CLOSE
            case 'Close':
               tgmc.close(interaction.client);
               return await interaction.reply({
                  content: 'Closed tgmc.',
                  ephemeral: true,
               });
         }
         return;
      }
      // Find top 10 people with most votes.
      // const participants = await tgmcParticipantModel.find({}, null, {
      //    sort: { votes: -1 },
      //    limit: 10,
      // });
   },
};
