const { WebhookClient, EmbedBuilder } = require('discord.js');
const { chainValuesId, webhooks } = require('../config.json');
const chainDataModel = require('../schemas/chain/chainDataModel.js');
const userChainDataModel = require('../schemas/chain/userChainDataModel.js');
const logs = require('./log.js');

let chainData;

module.exports = {
   async create(content, id) {
      await chainDataModel.findByIdAndUpdate(chainValuesId, {
         chain: content,
         chainCount: 1,
         lastPerson: id,
      });
   },
   async update(chainData, id) {
      await chainDataModel.findByIdAndUpdate(chainValuesId, {
         chainCount: chainData.chainCount + 1,
         lastPerson: id,
      });
   },
   async updateUser(author) {
      const user = await userChainDataModel.findOne({ userId: author.id });
      if (!user) {
         await userChainDataModel.create({
            userTag: author.tag,
            userId: author.id,
            totalCount: 1,
            totalBroken: 0,
         });
      } else {
         user.totalCount += 1;
         user.save();
      }
   },
   async break(id) {
      await chainDataModel.findByIdAndUpdate(chainValuesId, {
         chain: ' ',
         chainCount: 0,
         lastPerson: id,
      });

      const user = await userChainDataModel.findOne({ userId: id });
      if (!user) {
         await userChainDataModel.create({
            userTag: tag,
            userId: id,
            totalCount: 0,
            totalBroken: 1,
         });
      } else {
         user.totalBroken += 1;
         user.save();
      }
   },
   async timeout(client, member, id) {
      if (member.kickable) {
         let data = await userChainDataModel.findOne({
            userId: member.id,
         });
         const x = data.totalBroken;
         let time = 0.25 * (x * x) * 60000;
         if (time > 168 * 60 * 60 * 1000) {
            time = 168 * 60 * 60 * 1000;
         }
         member.timeout(time);
         logs.post(
            client,
            'Time-out',
            null,
            `<@${id}> has been timed out for \`${time}\`ms for breaking the chain.`
         );
      }
   },
   async updateMessage(client, THERE_IS_A_CHAIN) {
      const wh = new WebhookClient({
         url: webhooks.dont_break_chain.url,
      });
      const embed = new EmbedBuilder()
         .setColor('#0099ff')
         .setTitle("Don't break the chain")
         .setFooter({
            text: THERE_IS_A_CHAIN
               ? 'There is a chain.'
               : 'There is currently no chain.',
         });

      function makeChainData(data) {
         return `Chain: \`${data.chain}\`\nLength: \`${data.chainCount}\`\nLast person: <@${data.lastPerson}>`;
      }

      if (THERE_IS_A_CHAIN) {
         try {
            chainData = await chainDataModel.findById(chainValuesId);
            embed.addFields([
               {
                  name: 'Current chain',
                  value: makeChainData(chainData),
               },
            ]);

            await wh.editMessage(webhooks.dont_break_chain.data, {
               embeds: [embed],
            });
         } catch (err) {
            logs.error(client, err);
         }
      } else {
         try {
            if (chainData) {
               embed.addFields([
                  { name: 'Last chain', value: makeChainData(chainData) },
               ]);
            }

            await wh.editMessage(webhooks.dont_break_chain.data, {
               embeds: [embed],
            });
         } catch (err) {
            logs.error(client, err);
         }
      }
   },
};

// async function createChain(message, chain, authorId) {
//    await chainDataModel
//       .findByIdAndUpdate(chainValuesId, {
//          chain: chain,
//          chainCount: 1,
//          lastPerson: authorId,
//       })
//       .catch((err) => {
//          logs.error(message.client, err);
//       });
// }

// async function resetChain(message, authorId) {
//    await chainDataModel
//       .findByIdAndUpdate(chainValuesId, {
//          chain: ' ',
//          chainCount: 0,
//          lastPerson: authorId,
//       })
//       .catch((err) => {
//          logs.error(message.client, err);
//       });
// }

// async function updateChain(message, authorId) {
//    await chainDataModel
//       .findByIdAndUpdate(chainValuesId, {
//          chainCount: chainData.chainCount + 1,
//          lastPerson: authorId,
//       })
//       .catch((err) => {
//          logs.error(message.client, err);
//       });
// }
// async function updateUserData(message, tag, id) {
//    const user = await userChainDataModel.findOne({ userId: id });
//    if (!user) {
//       try {
//          await userChainDataModel.create({
//             userTag: tag,
//             userId: id,
//             totalCount: 1,
//             totalBroken: 0,
//          });
//       } catch (err) {
//          logs.error(message.client, err);
//       }
//    } else {
//       try {
//          user.totalCount += 1;
//          user.save();
//       } catch (err) {
//          logs.error(message.client, err);
//       }
//    }
// }
// async function userBrokeCainData(message, tag, id) {
//    const user = await userChainDataModel.findOne({ userId: id });
//    if (!user) {
//       try {
//          await userChainDataModel.create({
//             userTag: tag,
//             userId: id,
//             totalCount: 0,
//             totalBroken: 1,
//          });
//       } catch (err) {
//          logs.error(message.client, err);
//       }
//    } else {
//       try {
//          user.totalBroken += 1;
//          user.save();
//       } catch (err) {
//          logs.error(message.client, err);
//       }
//    }
// }
