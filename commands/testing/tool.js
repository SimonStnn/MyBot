const { SlashCommandBuilder } = require('discord.js');
const logs = require('../../files/log.js');
const fs = require('fs')

const data = new SlashCommandBuilder()
   .setName('tool')
   .setDescription('This is a command with some usefull tools.')

const toolFiles = fs.readdirSync('./commands/testing/tools')
   .filter((file) => file.endsWith('.js'));

for (const file of toolFiles) {
   const tool = require(`./tools/${file}`)
   data.addSubcommand(tool.data)
}
module.exports = {
   data,
   cooldown: 1000,
   reqPerms: ['ADMINISTRATOR'],
   autocompleteChoices: ['faq', 'install', 'collection', 'promise', 'debug'],
   async execute(interaction) {
      sub = interaction.options.getSubcommand()
      try {
         const tool = require(`./tools/${sub}.js`)
         await tool.execute(interaction)
      } catch (err) {
         logs.error(interaction.client, err)
      }
   },
};
