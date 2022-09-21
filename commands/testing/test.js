const {
   WebhookClient,
   SlashCommandBuilder,
   EmbedBuilder,
} = require('discord.js');
const { roleIds, webhooks } = require('../../config.json');
const wait = require('util').promisify(setTimeout);
const logs = require('../../files/log.js');
const fetch = require('node-fetch');

const OPTION = 'option';

module.exports = {
   data: new SlashCommandBuilder()
      .setName('test')
      .setDescription('This is a test description.')
      .addStringOption((option) =>
         option.setName('name').setDescription('Name of something')
      ),
   database: true,
   cooldown: 1000,
   reqPerms: ['ADMINISTRATOR'],
   reqRoles: [roleIds.activeMember],
   autocompleteChoices: ['faq', 'install', 'collection', 'promise', 'debug'],
   async execute(interaction) {
      try {
         const r = await fetch('https://ktab-sgr25.smartschool.be/index.php/deeplink/528/506f59e2-9d7e-45be-b86a-6c2a0e1f863a')
         console.log(r.headers);

         return await interaction.reply('Done')
      } catch (err) {
         logs.error(interaction.client, err, 'Triggered in test command');
      }
   },
};

function getTime(timestamp) {
   return Math.round(new Date(timestamp).getTime() / 1000);
}
