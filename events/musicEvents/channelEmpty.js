const { EmbedBuilder } = require('discord.js');
const { leaveTimeout, colors } = require('../../config.json');
const logs = require('../../files/log.js');

module.exports = {
   name: 'channelEmpty',
   async execute(client, queue) {
      console.log('channel is empty');
      if (!queue) return;

      setTimeout(async () => {
         if (queue.connection && !queue.playing) {
            try {
               await client.player?.deleteQueue(queue.metadata.guild.id);
            } catch (err) {
               logs.error(client, err)
            }
            console.log('queue deleted'.underline.red);
         } else {
            return;
         }
      }, leaveTimeout / 2);
      // if (queue.metadata) {
      //    await queue.metadata
      //       .send({
      //          embeds: [
      //             new EmbedBuilder()
      //                .setDescription(
      //                   'I left the audio channel because there is no one on my audio channel.'
      //                )
      //                .setColor(colors.music),
      //          ],
      //       })
      //       .catch((e) => {
      //          logs.error(client, e);
      //       });
      // }
   },
};
