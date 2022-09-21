const { clientId } = require('../config.json');
const colors = require('colors')
const logs = require('../files/log.js');
const { ChannelType} = require('discord.js')

module.exports = {
   name: 'voiceStateUpdate',
   async execute(client, oldMember, newMember) {
      const oldUserChannel = oldMember.channelId;
      const newUserChannel = newMember.channelId;

      if (userJoinsChannel(oldUserChannel, newUserChannel)) {
         if (newMember.id === clientId && newMember.suppress === true) {
            try {
               await newMember.guild.me.voice.setSuppressed(false);
            } catch (err) {
               logs.error(
                  newMember.client,
                  err,
                  'Failed to suppress newMember.'
               );
            }
         }
      } else if (userLeavesChannel(oldUserChannel, newUserChannel)) {
         if (newMember.id === clientId) {
            const queue = client.player?.getQueue(newMember.guild.id);
            if (queue && queue.playing) {
               if (queue.metadata) {
                  queue.metadata
                     .send({
                        content:
                           "Sorry I left the audio channel. I hope someone didn't kick me off the channel. 😔",
                     })
                     .catch((e) => { });
               }
               await client.player?.deleteQueue(queue.metadata.guild.id);
               console.log('queue deleted'.underline.red);
            }
         }
      }

      // await handleTemporarychannel('1008356526739697777', oldMember, newMember)
   },
};
async function handleTemporarychannel(id, oldMember, newMember) {
   if (userJoinsChannel(oldMember.channelId, newMember.channelId) && id === newMember.channelId) {
      console.log('Moet kanaal maken en verplaatsen')
      // console.log(newMember)
      const guild = newMember.guild
      const member = await guild.members.fetch(newMember.id)
      const temp_vc = await guild.channels.create(`${member.username}'s channel`,{
         type: ChannelType.voice
      })
      member.voice.setChannel(temp_vc)

   } else if (userLeavesChannel(oldMember.channelId, newMember.channelId) && id === oldMember.channelId){
      console.log('Moet kanaal verwijderen als die leeg is')
   } 
}

function userJoinsChannel(oldUserChannel, newUserChannel) {
   return (
      oldUserChannel === undefined ||
      (oldUserChannel === null && newUserChannel !== undefined) ||
      newUserChannel !== null
   );
}
function userLeavesChannel(oldUserChannel, newUserChannel) {
   return newUserChannel === undefined || newUserChannel === null;
}
