import { SlashCommandBuilder, version as discordJsVersion } from 'discord.js';
import { exec } from 'child_process';
import Command from '../../protocols/command';
import Response from '../../protocols/response';

function getTime(timestamp: Date) {
   return Math.round(new Date(timestamp).getTime() / 1000);
}

export default new Command({
   data: new SlashCommandBuilder()
      .setName('info')
      .setDescription('Display usefull info about the bot!'),
   async execute(client, interaction) {
      // Calculate uptime
      let totalSeconds = (client.uptime! / 1000) % 86400;
      const uptime = `${Math.floor(totalSeconds / 3600)}h ${Math.floor(
         (totalSeconds % 3600) / 60
      )}min`;
      const presence = client.user!.presence;
      const activities = presence.activities.map((activity) => {
         return `\n> * type: \`${activity.type}\`, name: \`${activity.name}\``;
      });
      const user = client.user!;
      const dbConnection = await (async () => {
         try {
            await client.dbClient.db("admin").command({ ping: 1 })
         } catch (e) {
            return false
         } finally {
            return true
         }
      })()

      const description =
         `* Tag: \`${user.tag}\`` +
         '\n' +
         `* DataBase connection: \`${dbConnection.toString()}\`` +
         '\n' +
         `* Presence: \`${presence.status}\`` +
         '\n' +
         `* Activities: ${activities.join('')}` +
         '\n' +
         `* Ready at: <t:${getTime(client.readyAt!)}:f>` +
         '\n' +
         `* Uptime: \`${uptime}\` <t:${getTime(client.readyAt!)}:R>` +
         '\n' +
         `* User Count: \`${client.users.cache.size}\`` +
         '\n' +
         `* Server Count: \`${client.guilds.cache.size}\`` +
         '\n' +
         `* Channel Count: \`${client.channels.cache.size}\`` +
         '\n' +
         `* Command Count: \`${client.commands.map(c => c.name).length}\`` +
         '\n' +
         `* Discord.js Version: \`v${discordJsVersion}\`` +
         '\n' +
         `* Node.js Version: \`${process.version}\`` +
         '\n' +
         `* Memory Usage: \`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB\`` +
         '\n' +
         `* OS: \`${process.platform}\``

      const response = new Response({ interaction })
         // .setTitle('Info')
         // .setDescription(description);

      // Get the npm list output as a string
      const npmListOutput = await (async () => {
         return new Promise<string>((resolve, reject) => {
            exec('npm list', (error, stdout) => {
               if (error) {
                  console.error(`Error executing npm list: ${error.message}`);
                  resolve('');
               } else {
                  const output = stdout.toString();
                  resolve(output);
               }
            });
         });
      })()

      response.addFields([{
         name: "Info",
         value: description,
         inline: true,
      }, {
         name: "Npm list",
         value: `\`\`\`ml\n${npmListOutput}\`\`\``,
         inline: true,
      }])

      return await interaction.reply(response);
   }
})