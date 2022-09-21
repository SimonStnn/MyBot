const { EmbedBuilder } = require('discord.js');
const { colors } = require('../../config.json');
const logs = require('../../files/log.js');

module.exports = {
   name: 'trackStart',
   async execute(client, queue, track) {
      if (!queue || queue?.repeatMode !== 0) return;
      if (queue.metadata) {
         queue.metadata
            .send({
               embeds: [
                  new EmbedBuilder()
                     .setDescription(
                        `Music started playing: **[${track.title}](${track.url})**\n> Channel: ${queue.connection.channel} 🎧`
                     )
                     .setThumbnail(track.thumbnail)
                     .setColor(colors.music),
               ],
            })
            .catch((e) => {
               logs.error(client, e);
            });
      }
   },
};
