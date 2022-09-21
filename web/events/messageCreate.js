
module.exports = {
   name: 'messageCreate',
   async execute(client, message) {
      if (message.author.bot || message.system) return;

      // Runs on every message.
      console.log(
         `${message.author.tag} in #${message.channel.name}: ${message.content}`
      );

      
   },
};
