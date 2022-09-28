const {
   EmbedBuilder,
   ButtonBuilder,
   ActionRowBuilder,
   ButtonStyle,
   PermissionsBitField,
} = require('discord.js');
const {
   chainValuesId,
   tgmcDataID,
   channelIds,
   userIds,
   colors,
} = require('../config.json');
const tgmcDataModel = require('../schemas/tgmc/tgmcDataModel.js');
const tgmcParticipantModel = require('../schemas/tgmc/tgmcParticipantModel.js');
const chainDataModel = require('../schemas/chain/chainDataModel.js');
const mongoose = require('mongoose');
const chain = require('../files/chain.js');
const logs = require('../files/log.js');

let chainData;
let tgmcData;

let story = '';

module.exports = {
   name: 'messageCreate',
   async execute(client, message) {
      if (message.author.bot || message.system) return;

      // Runs on every message.
      console.log(
         `${message.author.tag} in #${message.channel.name}: ${message.content}`
      );

      try {
         //! Code don't break the chain
         if (message.channel.id === channelIds.dontBreakChain) {
            // Check if you are connected to database.
            const connectedDontBreakChain = mongoose.connection.readyState;
            if (!connectedDontBreakChain) {
               return console.log('Not connected to database.');
            }

            chainData = await chainDataModel.findById(chainValuesId);
            if (message.content.toLowerCase() != chainData.chain) {
               if (chainData.chain == ' ' || chainData.chainCount < 3) {
                  //? First word of chain.
                  try {
                     await chain.create(
                        message.content.toLowerCase(),
                        message.author.id
                     );
                     await chain.updateMessage(message.client, false);
                  } catch (err) {
                     logs.error(message.client, err);
                  }
               } else {
                  //? Chain broken.
                  const chainBrokenEmbed = new EmbedBuilder()
                     .setColor(colors.green)
                     .setTitle(`Chain was broken`)
                     .setThumbnail(
                        'https://icon-library.com/images/broken-chain-icon/broken-chain-icon-1.jpg'
                     )
                     .setDescription(
                        `<@${message.author.id}> broke the chain.\nThis chain was **${chainData.chainCount}** messages long.\nSend a new message to start a new chain.`
                     )
                     .setTimestamp();
                  try {
                     await chain.break(message.author.id).catch(() => {
                        logs.error(
                           message.client,
                           err,
                           'Failed to break chain.'
                        );
                     });
                     // Time out user if possible.
                     const member = await message.guild.members.cache.find(
                        (member) => member.id === message.author.id
                     );
                     await chain
                        .timeout(message.client, member, message.author.id)
                        .catch((err) => {
                           logs.error(
                              message.client,
                              err,
                              `Failed to time-out ${member.tag}.`
                           );
                        });
                     await chain.updateMessage(message.client, false);

                     await message.channel.send({ embeds: [chainBrokenEmbed] });
                  } catch (err) {
                     logs.error(
                        message.client,
                        err,
                        'Failed to break chain or time-out user'
                     );
                  }
               }
            } else {
               if (chainData.lastPerson == message.author.id) {
                  //? Same author.
                  await message.delete();
               } else {
                  //? Chain was correct.
                  try {
                     await chain.update(chainData, message.author.id),
                        await Promise.all([
                           chain.updateUser(message.author),
                           chain.updateMessage(message.client, true),
                        ]);
                  } catch (err) {
                     logs.error(message.client, err);
                  }
               }
            }
         }
         //! Code tgmc.
         else if (message.channel.id === channelIds.tgmc) {
            // Check if you are connected to database.
            const connectedTgmc = mongoose.connection.readyState;
            if (!connectedTgmc) {
               return console.log('Not connected to database.');
            }
            // Check if tgmc is open.
            tgmcData = await tgmcDataModel.findById(tgmcDataID);
            if (tgmcData.state == 'closed') {
               return console.log('Tgmc closed');
            }
            // Check if they already posted a meme in #tgmc.
            const tgmcMessage = await tgmcParticipantModel.findOne({
               userId: message.author.id,
            });

            if (tgmcMessage) {
               console.log(`${message.author.tag} already send a meme.`);
               await message.author
                  .send(
                     'You already posted a meme, please contact a daily meme host to delete it for you so you can post an other.'
                  )
                  .catch((err) => {
                     logs.error(
                        message.client,
                        err,
                        `Couldn't send a message to ${message.author.tag}`
                     );
                  });
               await message.delete().catch((err) => {
                  logs.error(message.client, err);
               });
               return;
            }

            // Try reacting to the message with emoji.
            await message.react('⬆️').catch(async () => {
               logs.error(
                  message.client,
                  err,
                  `Failed to react on message in tgmc.`
               );
               await message.delete().catch((err) => {
                  logs.error(message.client, err);
               });
               return;
            });

            await tgmcParticipantModel
               .create({
                  usertag: message.author.tag,
                  userId: message.author.id,
                  messageURL: message.url,
                  votes: 0,
               })
               .catch((err) => {
                  logs.error(message.client, err);
               });

            await message.channel.permissionOverwrites
               .edit(message.author.id, {
                  SEND_MESSAGES: false,
               })
               .catch((err) => {
                  logs.error(message.client, err);
               });

            console.log(
               `Succesfully created tgmcParticipantModel for ${message.author.tag}`
            );
         }
         //! Code #story 955781178890260490
         else if (message.channel.id === channelIds.story) {
            if (message.content.includes(' ') || message.content.length < 2) {
               await message.delete();
               return;
            }
            message.channel.messages
               .fetch({ limit: 2 })
               .then(async (messages) => {
                  const previousMsg = messages.last();
                  if (previousMsg.author.id === message.author.id) {
                     try {
                        await message.delete();
                     } catch (err) {
                        logs.error(client, err)
                     }

                     return;
                  }
               });
         }
         else if (message.channel.id === channelIds.dankMemer) {
            if (message.content.toLowerCase() === 'pls work') {
               const ID_YES = 'yes';
               const ID_NO = 'no';
               const HOUR_IN_MS = 3600000;
               let replied = false;

               const filter = (i) =>
                  (i.customId === ID_YES || i.customId === ID_NO) &&
                  i.user.id === message.author.id;

               const collector =
                  message.channel.createMessageComponentCollector({
                     filter,
                     time: 30000,
                  });

               collector.on('collect', async (i) => {
                  if (i.customId === ID_YES) {
                     replied = true;
                     try {
                        await i.update({
                           content: 'You will be reminded in 1 hour.',
                           components: [],
                        });
                     } catch (err) {
                        logs.error(message.client, err, 'pls work reminder');
                     }
                     collector.stop();
                     setTimeout(() => {
                        try {
                           message.channel.send({
                              content: `<@${message.author.id}>`,
                              embeds: [
                                 new EmbedBuilder()
                                    .setTitle('Reminder')
                                    .setDescription(
                                       'Here is your reminder to work again.'
                                    )
                                    .setColor(colors.green),
                              ],
                           });
                        } catch (err) {
                           logs.error(
                              message.client,
                              err,
                              'Failed to send reminder.'
                           );
                        }
                     }, HOUR_IN_MS);
                  } else if (i.customId === ID_NO) {
                     replied = true;
                     try {
                        await i.update({
                           content: 'You will not receive a reminder.',
                           components: [],
                        });
                     } catch (err) {
                        logs.error(message.client, err, 'pls work reminder');
                     }
                     collector.stop();
                  }
               });

               const msg = await message.reply({
                  content:
                     'Do you want to be reminded in an hour to work again?',
                  components: [
                     new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                           .setCustomId(ID_YES)
                           .setLabel('Yes')
                           .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                           .setCustomId(ID_NO)
                           .setLabel('No')
                           .setStyle(ButtonStyle.Secondary)
                     ),
                  ],
                  fetchReply: true,
               });
               collector.on('end', async () => {
                  if (!replied) {
                     await msg.edit({
                        content:
                           "You didn't reply, so you won't receive a reminder.",
                        components: [],
                     });
                  }
               });
            }
         }
         //! Code #aternos-namen --------------------------------------------------
         else if (message.channel.id === '1007955742524985384') {
            await message.channel.permissionOverwrites
               .edit(message.author?.id, {
                  SendMessages: false
               })
               .catch((err) => {
                  logs.error(
                     message.client,
                     err,
                     `Error updating perms for ${message.author.tag} in #aternos-namen`);
               });
         }
      } catch (err) {
         logs.error(message.client, err);
      }
   },
};
