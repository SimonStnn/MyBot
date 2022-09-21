const {
   SlashCommandBuilder,
   ActionRowBuilder,
   ButtonBuilder,
   ButtonStyle,
} = require('discord.js');
const { roleIds } = require('../../config.json');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('buttons')
      .setDescription('Returns a few buttons to interact with.'),
   database: false,
   reqPerms: ['KICK_MEMBERS', 'BAN_MEMBERS'],
   reqRoles: [roleIds.dailyMemeHost, roleIds.activeMember],
   async execute(interaction) {
      const row = new ActionRowBuilder()
         .addComponents(
            new ButtonBuilder()
               .setCustomId('left')
               .setLabel('⬅️')
               .setStyle(ButtonStyle.Primary)
         )
         .addComponents(
            new ButtonBuilder()
               .setCustomId('right')
               .setLabel('➡️')
               .setStyle(ButtonStyle.Primary)
         );

      await interaction.reply({
         content: `This is test indeed.`,
         components: [row],
         ephemeral: false,
      });

      // interaction.client.on('interactionCreate', (intr) => {
      //    if (!intr.isButton()) return;
      // });

      const filter = (i) =>
         (i.customId === 'left' || i.customId === 'right') &&
         i.user.id === interaction.user.id;

      const collector = interaction.channel.createMessageComponentCollector({
         filter,
         time: 15000,
      });

      collector.on('collect', async (i) => {
         if (i.customId === 'left') {
            await i.update({
               content: 'Left button was clicked!',
               components: [row],
            });
            console.log('left');
         } else if (i.customId === 'right') {
            await i.update({
               content: 'Right button was clicked!',
               components: [row],
            });
            console.log('right');
         }
      });

      collector.on('end', (collected) => {
         console.log(`Collected ${collected.size} items`);
      });
   },
};
