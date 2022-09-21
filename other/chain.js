const { channelIds } = require('../../config.json');
const userChainDataModel = require('../../schemas/chain/userChainDataModel.js');
const chainDataModel = require('../../schemas/chain/chainDataModel.js');
const { chainValuesId } = require('../../config.json');
const {
   EmbedBuilder,
   ActionRowBuilder,
   ButtonBuilder,
   ButtonStyle,
} = require('discord.js');

const TO_PERCENT = 100;

const nameOption1 = 'target';
const nameOption2 = 'sort';

const SORT_SCORE = 'score';
const SORT_BREAK = 'break';
const SORT_VALUE = 'value';

const BTN_LEFT = 'left';
const BTN_RIGHT = 'right';
const BTN_END = 'end';

const limit = 10;
let skip = 0;
let page = 1;

let allUsers = [];

module.exports = {
   data: new SlashCommandBuilder()
      .setName('chain')
      .setDescription("Get top players from don't break the chain.")
      .addUserOption((option) =>
         option
            .setName(nameOption1)
            .setDescription('Chain info about this user.')
      )
      .addStringOption((option) =>
         option
            .setName(nameOption2)
            .setDescription('The value to sort by.')
            .addChoices(
               { name: 'Score', value: SORT_SCORE },
               { name: 'Breaks', value: SORT_BREAK },
               { name: 'Break rate', value: SORT_VALUE }
            )
      ),
   database: true,
   async execute(interaction) {
      // Check if there is a requested user to get the date from
      const target = interaction.options.getUser(nameOption1);
      const sort = interaction.options.getString(nameOption2);
      if (target) {
         const data = await userChainDataModel.findOne({ userId: target.id });
         const embed = new EmbedBuilder()
            //todo .setColor('#0099ff')
            .setTimestamp()
            .setFooter({
               text: `${interaction.user.tag}`,
               iconURL: `${interaction.user.displayAvatarURL({
                  dynamic: true,
               })}`,
            })
            .setTitle(`${target.tag}'s data:`);
         if (!data) {
            embed.setDescription(
               `We couldn't find any data for <@${target.id}>\nAsk them to say the chain in <#${channelIds.dontBreakChain}> first.`
            );
            return await interaction.reply({ embeds: [embed] });
         }
         function round(num, acc) {
            return Math.round((num + Number.EPSILON) * acc) / acc;
         }
         embed.setDescription(
            `▸ Chain count: \`${data.totalCount}\`\n` +
            `▸ Chains broken: \`${data.totalBroken}\`\n` +
            `▸ Break rate: \`${round(
               (data.totalBroken / (data.totalCount + data.totalBroken)) *
               TO_PERCENT,
               10000
            )}%\``
         );
         return await interaction.reply({ embeds: [embed] });
      }

      allUsers = await GetUsers(sort);

      // Require date from current chain
      const chainInfo = await chainDataModel.findById(chainValuesId);

      const row = new ActionRowBuilder()
         .addComponents(
            new ButtonBuilder()
               .setCustomId(BTN_LEFT)
               .setEmoji('➖')
               .setStyle(ButtonStyle.Primary)
               .setDisabled(true)
         )
         .addComponents(
            new ButtonBuilder()
               .setCustomId(BTN_RIGHT)
               .setEmoji('➕')
               .setStyle(ButtonStyle.Primary)
         )
         .addComponents(
            new ButtonBuilder()
               .setCustomId(BTN_END)
               .setLabel('End Interaction')
               .setStyle(ButtonStyle.Secondary)
         );

      let embed = makeEmbed(interaction, allUsers, chainInfo);
      const msg = await interaction.reply({
         embeds: [embed],
         components: [row],
         fetchReply: true,
      });

      // Filter to correct buttons.
      const filter = (i) => {
         return i.user.id === interaction.user.id;
      };
      // Make collector
      const collector = msg.createMessageComponentCollector({
         filter,
         time: 15 * 1000,
      });

      collector.on('collect', async (i) => {
         switch (i.customId) {
            case BTN_LEFT:
               skip -= 10;
               page -= 1;

               allUsers = await GetUsers(sort);

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
                  allUsers,
                  chainInfo,
                  skip,
                  page
               );
               // Update message.
               await i.update({
                  components: [row],
                  embeds: [embed],
               });

               break;
            case BTN_RIGHT:
               skip += 10;
               page += 1;

               allUsers = await GetUsers(sort);

               if (allUsers.length < 10) {
                  ButtonBuilder.from(row.components[0]).setDisabled(false);
                  ButtonBuilder.from(row.components[1]).setDisabled(true);
                  if (allUsers.length === 0) {
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
                  allUsers,
                  chainInfo,
                  skip,
                  page
               );
               // Update message.
               await i.update({
                  components: [row],
                  embeds: [embed],
               });

               break;
            case BTN_END:
               break;
         }
      });

      collector.on('end', async () => {
         for (let i = 0; i < row.components.length; i++) {
            ButtonBuilder.from(row.components[i]).setDisabled(true);
         }
         return await interaction.editReply({
            components: [row],
         });
      });
   },
};

async function GetUsers(sort) {
   let u;
   switch (sort) {
      default: // SORT_BY_SCORE
         u = await userChainDataModel.find({}, null, {
            sort: { totalCount: -1 },
            limit,
            skip,
         });
         break;
      case SORT_BREAK:
         u = await userChainDataModel.find({}, null, {
            sort: { totalBroken: -1 },
            limit,
            skip,
         });
         break;
   }
   return u;
}

// Function
function makeEmbed({ user }, allUsers, chainInfo) {
   // Put their data in variable.
   let userList = '';
   for (let i = skip * limit; i < skip * limit + limit; i++) {
      if (!allUsers[i]) break;
      const text = ` ▸ Score: \`${allUsers[i].totalCount}\` ▸ Chains broken: \`${allUsers[i].totalBroken}\`\n`;
      const line = `#${i + 1 + skip} | <@${allUsers[i].userId}>: ${text}`;
      userList += user.id === allUsers[i].userId ? `__${line}__` : `${line}`;
   }

   // Return an embed
   return (
      new EmbedBuilder()
         //todo .setColor('#0099ff')
         .setTimestamp()
         .setFooter({
            text: `${user.tag}`,
            iconURL: `${user.displayAvatarURL({
               dynamic: true,
            })}`,
         })
         .addFields([
            {
               name: 'Top users:',
               value: userList ? userList : 'No users found.',
            },
            {
               name: 'Info about the currect chain:',
               value: `▸ Current chain: \`${chainInfo.chain}\`\n▸ Chain length: \`${chainInfo.chainCount}\`\nPage: ${page}`,
               inline: true,
            },
         ])
   );
}
