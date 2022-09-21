const {
   SlashCommandBuilder, 
   ActionRowBuilder,
   ModalBuilder,
   EmbedBuilder,
   TextInputBuilder,
   TextInputStyle,
   InteractionType,
} = require('discord.js');
const { guildIds,channelIds, colors } = require('../../config.json');

const ID_1 = 'favoriteColorInput';
const ID_2 = 'hobbiesInput';

let foo = false;

module.exports = {
   data: new SlashCommandBuilder()
      .setName('suggest')
      .setDescription('Do a suggestion.'),
   database: false,
   global: true,
   async execute(interaction) {
      const modal = new ModalBuilder().setTitle('Suggestion').setCustomId('modal');

      modal.addComponents(
         new ActionRowBuilder().addComponents(
            new TextInputBuilder()
               .setCustomId(ID_1)
               .setLabel('Suggestion')
               .setStyle(TextInputStyle.Short)
         ),
         new ActionRowBuilder().addComponents(
            new TextInputBuilder()
               .setCustomId(ID_2)
               .setLabel('Discribe your suggestion.')
               .setStyle(TextInputStyle.Paragraph)
         )
      );

      await interaction.showModal(modal);
      const guild = interaction.client.guilds.cache.get(guildIds.main)
      const channel = guild.channels.cache.get(channelIds.test);

      if (foo) return;
      foo = true;
      interaction.client.on('interactionCreate', async (interaction) => {
         if (interaction.type !== InteractionType.ModalSubmit) return;
         // Get the data entered by the user
         const input1 = interaction.fields.getTextInputValue(ID_1);
         const input2 = interaction.fields.getTextInputValue(ID_2);
         if (!input1 && !input2) return;

         const embed = new EmbedBuilder()
            .setColor(colors.command)
            .setTimestamp()
            .setFooter({
               text: `${interaction.user.tag}`,
               iconURL: `${interaction.user.displayAvatarURL({
                  dynamic: true,
               })}`,
            })
            .setTitle('Suggestion')
            .addFields([
               {
                  name: input1 ? input1 : '\u200B',
                  value: input2 ? input2 : '\u200B',
               },
            ]);

         await channel.send({ embeds: [embed] });
         await interaction.reply({
            content: 'Your suggestion has been send',
            embeds: [embed],
            ephemeral: true,
         });
      });
   },
};
