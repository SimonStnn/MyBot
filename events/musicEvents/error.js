const { EmbedBuilder } = require('discord.js');
const { colors } = require('../../config.json');
const logs = require('../../files/log.js');

module.exports = {
   name: 'error',
   async execute(client, queue, error) {
      if (queue && queue.metadata) {
         await queue.metadata
            .send({
               embeds: [
                  new EmbedBuilder()
                     .setDescription(
                        `Im having trouble trying to connect to the voice channel. | \`${error}\``
                     )
                     .setColor(colors.music),
               ],
            })
            .catch((e) => {
               logs.error(client, e);
            });
      }
   },
};
