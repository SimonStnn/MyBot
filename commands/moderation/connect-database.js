const { SlashCommandBuilder } = require('discord.js');
const mongoose = require('mongoose')
module.exports = {
   data: new SlashCommandBuilder()
      .setName('connect-database')
      .setDescription('Connect to database.'),
   reqPerms: ['MODERATE_MEMBERS'],
   async execute(interaction) {

   },
};
