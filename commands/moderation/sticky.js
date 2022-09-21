const { SlashCommandBuilder } = require('discord.js');
const { clientId, roleIds } = require('../../config.json');
const logs = require('../../files/log.js');

const OPTION = 'message';

module.exports = {
   data: new SlashCommandBuilder()
      .setName('sticky')
      .setDescription('Stick a message to the bottom of a channel.')
      .addStringOption((option) =>
         option
            .setName(OPTION)
            .setDescription(
               'The message you want to stick to the bottom of the channel.'
            )
            .setRequired(true)
      ),
   database: false,
   reqPerms: ['MANAGE_MESSAGES'],
   async execute(interaction) {
      const message = interaction.options.getString(OPTION);
      let lastMsg;
      try {
         lastMsg = await interaction.channel.send({
            content: message,
            fetchReply: true,
         });
         await interaction.reply(
            `Sticked \`${message}\` to the bottom of this channel.`
         );
      } catch (err) {
         logs.error(interaction.client, err);
      }
      interaction.client.on('messageCreate', async (msg) => {
         if (
            msg.channel.id !== interaction.channel.id ||
            msg.author.id === clientId ||
            // msg.author.bot ||
            msg.system
         )
            return;
         try {
            await lastMsg.delete();
            lastMsg = await interaction.channel.send({
               content: message,
               fetchReply: true,
            });
         } catch (err) {
            logs.error(interaction.client, err);
         }
      });
   },
};
