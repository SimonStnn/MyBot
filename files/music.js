module.exports = {
   async handle(interaction, queue) {
      // if(interaction.member.voice.channel != )
      // console.log(queue.current)
      if (!queue) return true
      if (!queue || (!queue && !queue.current)) {
         await interaction.reply('There is currently no song playing.');
         return true;
      }
      return false;
   },
   clientIsInUserVc(interaction, queue) {
      const memberVc = interaction.member.voice.channel;
      const clientVc = interaction.guild.me.voice.channel; //todo .me

      if (clientVc == null) {
         return true;
      }
      return memberVc === clientVc;
   },
   addTimes(t0, t1) {
      function timeToMins(time) {
         var b = time.split(':');
         return b[0] * 60 + +b[1];
      }

      // Convert minutes to a time in format hh:mm
      // Returned value is in range 00  to 24 hrs
      function timeFromMins(mins) {
         function z(n) {
            return (n < 10 ? '0' : '') + n;
         }
         var m = (mins / 60) | 0; // % 60;
         var s = mins % 60;
         return z(m) + ':' + z(s);
      }
      return timeFromMins(timeToMins(t0) + timeToMins(t1));
   },
   async connect(interaction, queue) {
      if (queue.connection) {
         return;
      }
      const vc = interaction.member.voice.channel;
      await queue.connect(vc);
      return `Joined voice channel ${vc}. In a few moments the music will start playing.`;
   },
};
