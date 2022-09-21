const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');
const { userIds, colors } = require('../config.json');
const logs = require('../files/log.js');

const users = [
   userIds.Anouck, // Ano
   userIds.Maxim, // Maxim
   userIds.Viktor, // Viktor
   userIds.Tara, // Brandnetel
   userIds.Doran, // Doran
   userIds.Quinten, // petoeter
   userIds.Myrthe, // Myrthe
   userIds.Simon, // me
];

const aansprekingen = [
   'Hey',
   'Hallo',
   'Yo',
   'Dear',
   'Geachte',
   '',
   'Sup',
   'Liefste',
];

const messages = [
   'ik wens je een zeer fijne nacht. Dus ga maar naar je bedje 🛏, doe je oogjes toe en droom 💭 over de mooiste dingen. Slaapwel xoxo',
   'hopelijk heb je zoete dromen vannacht en word je morgen fris als een vis wakker. 🐟',
   'goede nacht. Droom mooie dromen vanavond. 🌙',
   'de sterren zien er vanavond zo mooi uit, misschien kan je ze vanacht eens een bezoekje brengen. ✨',
   'ik hoop dat je een zalige dag hebt gehad, maar nu is het tijd om een dutje te doen. Je nachtrust is belangrijk. 👆',
   'slaapwel. 😴',
   'sl🐒wel.',
   'slaapwel, tot morgen. Juw!',
   'het voelt zo goed dat ik jou heb leren kennen. Ik wilde je een fijne nachtrust wensen en je laten weten dat ik aan je denk. Sweet dreams. 💤',
   'een hele fijne nacht leukerd. Tot in onze dromen! 💭',
   'hele zoete dromen deze nacht!',
   'als ik je een goede nacht wens, wens me me dan niet terug, omdat ik niet wil slapen. Ik zal de hele nacht aan je denken.',
   'slaapwel, Ik kan niet wachten om wakker te worden en je weer te zien 👀, Ik breng liever met jou de nacht door 😊 maar het zal alleen moeten helaas 😔, tot morgen.',
   'het wordt al laat, ik ga schaapjes 🐑 tellen, slaapwel!',
   'ik zal aan je denken vannacht, slaapwel. <3',
   'ik wens u een goede nachtrust en dat u zoete dromen hebt, Goede nacht.',
   'ik houd zo veel van jou, ik ben zo blij dat we elkaar ontmoet hebben, wat alweer zo lang geleden lijkt. 🕰',
];

// ┌────────────── second(optional)
// │ ┌──────────── minute
// │ │ ┌────────── hour
// │ │ │ ┌──────── day of month
// │ │ │ │ ┌────── month
// │ │ │ │ │ ┌──── day of week
// │ │ │ │ │ │
// * * * * * *
module.exports = {
   name: 'spamPerson',
   time: '10 22 * * *',
   async execute(client) {
      // Make embed
      const embed = new EmbedBuilder()
         .setColor(colors.pink)
         .setTimestamp()
         .setTitle('Bedtijd!');
      // Get aanspreking and random gn message from array
      const aanspreking =
         aansprekingen[Math.floor(Math.random() * aansprekingen.length)];
      const message = messages[Math.floor(Math.random() * messages.length)];
      // Get random quote
      const url = 'https://type.fit/api/quotes';
      let quote;
      try {
         do {
            await fetch(url)
               .then((data) => data.json())
               .then((item) => {
                  quote = item;
               });
         } while (quote.text.length > 1024 && quote.author.length > 256);

         // Put quote in embed
         embed.addFields([
            {
               name: 'Supportive quote',
               value: `${quote.text}\n- ${quote.author}`,
            },
         ]);
         // Send embed to users.
         for (let i = 0; i < users.length; i++) {
            const userId = users[i];
            const spamPerson = await client.users.fetch(userId);
            embed.setDescription(`${aanspreking} <@${userId}>, ` + message);
            await spamPerson.send({ embeds: [embed] }).catch(() => {
               logs.error(client, err, `Failed to dm ${spamPerson.tag}`);
            });
         }
      } catch (err) {
         logs.error(client, err);
      }
   },
};
