const {
   SlashCommandBuilder, 
   EmbedBuilder,
   ActionRowBuilder,
   ButtonBuilder,
   ButtonStyle,
} = require('discord.js');
const userChainDataModel = require('../../schemas/chain/userChainDataModel.js');
const chainDataModel = require('../../schemas/chain/chainDataModel.js');
const { chainValuesId, channelIds, colors } = require('../../config.json');
const logs = require('../../files/log.js');

const TO_PERCENT = 100;

module.exports = {
   data: new SlashCommandBuilder()
      .setName('chain')
      .setDescription("Get top players from don't break the chain.")
      .addUserOption((option) =>
         option.setName('target').setDescription('Chain info about this user.')
      ),
   database: true,
   async execute(interaction) {
      // Check if there is a requested user to get the date from
      const user = interaction.options.getUser('target');
      if (user) {
         const target = await userChainDataModel.findOne({ userId: user.id });
         const embed = new EmbedBuilder()
            .setColor(colors.command)
            .setTimestamp()
            .setFooter({
               text: `${interaction.user.tag}`,
               iconURL: `${interaction.user.displayAvatarURL({
                  dynamic: true,
               })}`,
            });
         if (!target) {
            embed
               .setTitle(`${user.tag}'s data:`)
               .setDescription(
                  `We couldn't find any data for <@${user.id}>\nAsk them to say the chain in <#${channelIds.dontBreakChain}> first.`
               );
            return await interaction.reply({ embeds: [embed] });
         }
         function round(num, acc) {
            return Math.round((num + Number.EPSILON) * acc) / acc;
         }
         embed
            .setTitle(`${user.tag}'s data:`)
            .setDescription(
               `▸ Chain count: \`${target.totalCount}\`\n` +
               `▸ Chains broken: \`${target.totalBroken}\`\n` +
               `▸ Break rate: \`${round(
                  (target.totalBroken /
                     (target.totalCount + target.totalBroken)) *
                  TO_PERCENT,
                  10000
               )}%\``
            );
         return await interaction.reply({ embeds: [embed] });
      }
      //! Get the top 10 users from database.
      let topUsers = await userChainDataModel.find({}, null, {
         sort: { totalCount: -1 },
         limit: 10,
      });
      let skip = 0;
      let page = 1;
      // Require date from current chain
      const chainInfo = await chainDataModel.findById(chainValuesId);
      // Make buttons to send to user
      const row = new ActionRowBuilder()
         .addComponents(
            new ButtonBuilder()
               .setCustomId('left')
               .setEmoji('➖')
               .setStyle(ButtonStyle.Primary)
               .setDisabled(true)
         )
         .addComponents(
            new ButtonBuilder()
               .setCustomId('right')
               .setEmoji('➕')
               .setStyle(ButtonStyle.Primary)
         )
         .addComponents(
            new ButtonBuilder()
               .setCustomId('end')
               .setLabel('End Interaction')
               .setStyle(ButtonStyle.Secondary)
         );
      let embed = await makeEmbed(interaction, topUsers, chainInfo, skip, page);
      //! Return first message.
      await interaction.reply({ embeds: [embed], components: [row] });
      // Require the message just send.
      const msg = await interaction.fetchReply();
      // Filter to correct buttons.
      const filter = (i) => {
         return i.user.id === interaction.user.id;
      };
      // Make collector
      const collector = msg.createMessageComponentCollector({
         filter,
         time: 15 * 1000,
      });

      // Await button clicks.
      collector.on('collect', async (i) => {
         //! On left button click.
         if (i.customId === 'left') {
            skip -= 10;
            page -= 1;
            // Find new users data
            topUsers = await userChainDataModel.find({}, null, {
               sort: { totalCount: -1 },
               limit: 10,
               skip: skip,
            });

            if (skip <= 0) {
               // if you're back at the start.
               skip = 0;
               page = 1;
               ButtonBuilder.from(row.components[0]).setDisabled(true);
               ButtonBuilder.from(row.components[1]).setDisabled(false);
            } else {
               ButtonBuilder.from(row.components[0]).setDisabled(false);
               ButtonBuilder.from(row.components[1]).setDisabled(false);
            }
            embed = await makeEmbed(
               interaction,
               topUsers,
               chainInfo,
               skip,
               page
            );
            // Update message.
            await i.update({
               components: [row],
               embeds: [embed],
            });
         } //! On right button click.
         else if (i.customId === 'right') {
            skip += 10;
            page += 1;
            // Find new users data
            topUsers = await userChainDataModel
               .find({}, null, {
                  sort: { totalCount: -1 },
                  limit: 10,
                  skip: skip,
               })
               .catch(() => {
                  topUsers = {};
               });
            if (topUsers.length < 10) {
               ButtonBuilder.from(row.components[0]).setDisabled(false);
               ButtonBuilder.from(row.components[1]).setDisabled(true);
               if (topUsers.length === 0) {
                  skip -= 10;
                  page -= 1;
                  return await i.update({
                     components: [row],
                     embeds: [embed],
                  });
               }
            } else {
               ButtonBuilder.from(row.components[0]).setDisabled(false);
               ButtonBuilder.from(row.components[1]).setDisabled(false);
            }
            embed = await makeEmbed(
               interaction,
               topUsers,
               chainInfo,
               skip,
               page
            );
            // Update message.
            await i.update({
               components: [row],
               embeds: [embed],
            });
            //! btn end click
         } else if (i.customId === 'end') {
            for (let i = 0; i < row.components.length; i++) {
               ButtonBuilder.from(row.components[i]).setDisabled(true);
            }
            collector.stop();
            return await interaction.editReply({
               embeds: [embed],
               components: [row],
            });
         }
      });
      //! End collector
      collector.on('end', async () => {
         for (let i = 0; i < row.components.length; i++) {
            ButtonBuilder.from(row.components[i]).setDisabled(true);
         }

         return await interaction
            .editReply({
               components: [row],
            })
            .catch((e) => {
               logs.error(
                  interaction.client,
                  e,
                  'Failed to edit message',
                  'Message could be delted',
                  'chain.js'
               );
            });
      });
   },
};
// Function
async function makeEmbed(interaction, topUsers, chainInfo, skip, page) {
   // Put their data in variable.
   let topUsersList = '';
   for (let i = 0; i < topUsers.length; i++) {
      const text = ` ▸ Score: \`${topUsers[i].totalCount}\` ▸ Chains broken: \`${topUsers[i].totalBroken}\`\n`;
      if (interaction.user.id === topUsers[i].userId) {
         topUsersList += `__#${i + 1 + skip} | <@${topUsers[i].userId
            }>:${text}__`;
      } else {
         topUsersList += `#${i + 1 + skip} | <@${topUsers[i].userId}>: ${text}`;
      }
   }
   // Return an embed
   return new EmbedBuilder()
      .setColor(colors.command)
      .setTimestamp()
      .setFooter({
         text: `${interaction.user.tag}`,
         iconURL: `${interaction.user.displayAvatarURL({
            dynamic: true,
         })}`,
      })
      .addFields([
         { name: 'Top users:', value: topUsersList },
         {
            name: 'Info about the currect chain:',
            value: `▸ Current chain: \`${chainInfo.chain}\`\n▸ Chain length: \`${chainInfo.chainCount}\`\nPage: ${page}`,
            inline: true,
         },
      ]);
}
