const { WebhookClient } = require('discord.js');
const { guildIds, channelIds, webhooks } = require('../config.json');

const AVATAR_URL_ERROR =
   'https://www.antagonist.nl/blog/wp-content/uploads/2015/04/wordpress_errors.jpg';
const AVATAR_URL_POST =
   'https://www.shareicon.net/data/512x512/2016/08/18/809278_multimedia_512x512.png';

module.exports = {
   async error(client, error, ...args) {
      let errorMessage = `\`\`\`ml\n${error.stack}\`\`\``; //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! errror .stack

      if (args) {
         for (let arg in args) {
            errorMessage += `\n> - \`${args[arg]}\``;
         }
      }
      // logging the error
      console.log(error);

      try {
         const webhook = new WebhookClient({ url: webhooks.log.url });
         await webhook.send({
            username: error.toString().split(':')[0].substring(0, 32), // set type of error as name and make sure its not longer then the max username length.
            avatarURL: AVATAR_URL_ERROR,
            content: errorMessage.toString(),
            // files: [
            //    {
            //       attachment: Buffer.from(error.stacktrace.toString()),
            //       name: 'stacktrace.txt',
            //    },
            // ],
         });
      } catch (e) {
         console.log(e);
         await this.post(
            client,
            'Log Failed',
            null,
            `Failed to log error.\n${e}\n\nMain error:\n${error}`
         );
      }
   },
   async post(client, name, avatar_url, message, ...args) {
      if (!avatar_url) avatar_url = AVATAR_URL_POST;
      const webhook = new WebhookClient({ url: webhooks.log.url });

      if (args) {
         for (let arg in args) {
            message += `\n> - \`${args[arg]}\``;
         }
      }

      try {
         await webhook.send({
            username: name,
            content: message,
            avatarURL: avatar_url,
         });
      } catch (e) {
         console.log(e);
      }
   },
};
