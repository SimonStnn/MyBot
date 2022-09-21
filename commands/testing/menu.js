const {
   SlashCommandBuilder, 
   ActionRowBuilder,
   SelectMenuBuilder,
} = require('discord.js');
const { roleIds } = require('../../config.json');
const fs = require('fs');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('menu')
      .setDescription('Returns a select menu to interact with.'),
   database: false,
   reqPerms: ['KICK_MEMBERS', 'BAN_MEMBERS'],
   reqRoles: [roleIds.dailyMemeHost, roleIds.activeMember],
   async execute(interaction) {
      await interaction.deferReply();

      let commands = [];
      const commandFolders = fs.readdirSync('./commands');
      let index = 0;
      for (const folder of commandFolders) {
         const commandFiles = fs
            .readdirSync(`./commands/${folder}`)
            .filter((file) => file.endsWith('.js'));
         for (const commandFile in commandFiles) {
            const cmd = commandFiles[commandFile].replace('.js', '').toString();
            commands.push({
               label: cmd,
               description: `Get ${cmd}`,
               value: `option_${index}`,
            });
            index++;
         }
      }

      do {
         commands.pop();
      } while (commands.length > 25);

      const row = new ActionRowBuilder().addComponents(
         new SelectMenuBuilder()
            .setCustomId('select')
            .setPlaceholder('Nothing selected')
            .addOptions(commands)
      );
      console.log(commands.length);
      await interaction.editReply({ content: 'Pong!', components: [row] });
   },
};
