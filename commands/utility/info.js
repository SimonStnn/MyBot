const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, Colors } = require('discord.js');
const packageJSON = require("../../package.json");
const { colors } = require('../../config.json');
const mongoose = require('mongoose');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('info')
      .setDescription('Gives info about the bot.'),
   database: false,
   global: true,
   async execute(interaction) {
      const client = interaction.client;
      // Calculate uptime.
      let totalSeconds = (client.uptime / 1000) % 86400;
      const uptime = `${Math.floor(totalSeconds / 3600)}h ${Math.floor(
         (totalSeconds % 3600) / 60
      )}min`;
      const presence = client.presence;
      const activities = presence.activities.map((activity) => {
         return `\t▸ type: \`${activity.type}\`, name: \`${activity.name}\``;
      });
      const user = client.user;

      const description =
         `▸ Tag: \`${user.tag}\`` +
         '\n' +
         `▸ DataBase connection: \`${mongoose.connection.readyState}\`` +
         '\n' +
         `▸ Presence: \`${presence.status}\`` +
         '\n' +
         `▸ Activities: ${activities.join('\n')}` +
         '\n' +
         `▸ Ready at: <t:${getTime(client.readyAt)}:f>` +
         '\n' +
         `▸ Uptime: <t:${getTime(client.readyAt)}:R> \`${uptime}\`` +
         '\n' +
         `▸ User Count: \`${client.users.cache.size}\`` +
         '\n' +
         `▸ Server Count: \`${client.guilds.cache.size}\`` +
         '\n' +
         `▸ Channel Count: \`${client.channels.cache.size}\`` +
         '\n' +
         `▸ Command Count: \`${client.commands.map(c => c.name).length}\`` +
         '\n' +
         `▸ Discord.js Version: \`v${packageJSON.dependencies["discord.js"]}\`` +
         '\n' +
         `▸ Node.js Version: \`${process.version}\`` +
         '\n' +
         `▸ Memory Usage: \`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\`` +
         '\n' +
         `▸ OS: \`${process.platform}\``
      // '\n' +
      // `` +

      const embed = new EmbedBuilder()
         .setColor(colors.command)
         .setTimestamp()
         .setFooter({
            text: `${interaction.user.tag}`,
            iconURL: `${interaction.user.displayAvatarURL({ dynamic: true })}`,
         })
         .setTitle('Info')
         .setDescription(description);
      return await interaction.reply({ embeds: [embed], ephemeral: false });

   },
};
function getTime(timestamp) {
   return Math.round(new Date(timestamp).getTime() / 1000);
}
