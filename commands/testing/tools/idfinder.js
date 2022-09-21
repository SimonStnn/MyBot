const { SlashCommandSubcommandBuilder, EmbedBuilder } = require('discord.js');
const { colors } = require('../../../config.json')

const OPTION_ID = 'id'

module.exports = {
   data: new SlashCommandSubcommandBuilder()
      .setName('idfinder')
      .setDescription('Find an id.')
      .addStringOption((option) =>
         option
            .setName(OPTION_ID)
            .setDescription('The id you want to find.')
            .setRequired(true)
      ),
   async execute(interaction) {
      await interaction.deferReply()

      const client = interaction.client
      const querry = interaction.options.getString(OPTION_ID);

      function find_user(id) {
         return client.users.cache.find(user => user.id === id)
      }
      function find_channel(id) {
         return client.channels.cache.get(id)
      }
      function find_guild(id) {
         return client.guilds.cache.get(id)
      }
      async function find_message(id) {
         const channels = client.channels.cache
         for (const channel of channels) {
            const r = await channel[1].messages.fetch(id)
            console.log(r)
            if (r) return r
         }
      }
      let result = find_user(querry)
      if (!result)
         result = find_channel(querry)
      if (!result)
         result = find_guild(querry)
      if (!result)
         result = await find_message(querry)

      // console.log(typeof (result));
      await interaction.editReply({
         embeds: [new EmbedBuilder().setDescription(result.toString().setColor(colors.command))]
      })
   },
};
