const { EmbedBuilder } = require('discord.js');
const { leaveTimeout, colors } = require('../../config.json');
const logs = require('../../files/log.js');

module.exports = {
   name: 'queueEnd',
   async execute(client, queue) {
      console.log('queueEnd');
      if (!queue) return;

      setTimeout(async () => {
         if (queue.connection && !queue.playing) {
            try {
               await queue.connection.disconnect();
            } catch (err) {
               logs.error(client, err, 'Failed to disconnect.');
            }
            try {
               // await queue.destroy();
               await client.player?.deleteQueue(queue.metadata.guild.id);
            } catch (err) {
               logs.log(client, err);
            }

            console.log('queue deleted'.underline.red);
         } else {
            return;
         }
      }, leaveTimeout);
      if (queue?.metadata) {
         const embed = new EmbedBuilder()
            .setDescription(
               'All play queue finished, I think you can listen to some more music.\n Do `/play` to add new songs to the queue!'
            )
            .setColor(colors.music);

         await queue.metadata
            .send({
               embeds: [embed],
            })
            .catch((e) => {
               logs.error(client, e);
            });
      }
   },
};
