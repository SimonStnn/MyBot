const { EmbedBuilder } = require('discord.js');
const { colors } = require('../../config.json');
const logs = require('../../files/log.js');

module.exports = {
   name: 'trackAdd',
   async execute(client, queue, track) {
      if (queue && queue.metadata) {
         queue.metadata
            .send({
               embeds: [
                  new EmbedBuilder()
                     .setDescription(
                        `**[${track.title}](${track.url})** added to playlist.`
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
