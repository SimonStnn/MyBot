const logs = require('../files/log.js')


const parentId = '1007648894194290752'

module.exports = {
   name: 'channelCreate',
   async execute(client, channel) {
      console.log(`Channel ${channel.name} created.`); 
      
      try {
         if (channel.parentId === parentId) {
            await channel.setUserLimit(0)
         }
      } catch (err) {
         logs.error(client, err, 'Error in channelCreate')
      }
   },
};