import { Client } from "discord.js";
import { colors } from "../config.json";
import logger from "../log/logger";
import Embed from "../protocols/embed";

const aansprekingen = [
  "Hey",
  "Hallo",
  "Yo",
  "Dear",
  "Geachte",
  "",
  "Sup",
  "Liefste",
];

const messages = [
  "ik wens je een zeer fijne nacht. Dus ga maar naar je bedje 🛏, doe je oogjes toe en droom 💭 over de mooiste dingen. Slaapwel xoxo",
  "hopelijk heb je zoete dromen vannacht en word je morgen fris als een vis wakker. 🐟",
  "goede nacht. Droom mooie dromen vanavond. 🌙",
  "de sterren zien er vanavond zo mooi uit, misschien kan je ze vanacht eens een bezoekje brengen. ✨",
  "ik hoop dat je een zalige dag hebt gehad, maar nu is het tijd om een dutje te doen. Je nachtrust is belangrijk. 👆",
  "slaapwel. 😴",
  "sl🐒wel.",
  "slaapwel, tot morgen. Juw!",
  "het voelt zo goed dat ik jou heb leren kennen. Ik wilde je een fijne nachtrust wensen en je laten weten dat ik aan je denk. Sweet dreams. 💤",
  "een hele fijne nacht leukerd. Tot in onze dromen! 💭",
  "hele zoete dromen deze nacht!",
  "als ik je een goede nacht wens, wens me me dan niet terug, omdat ik niet wil slapen. Ik zal de hele nacht aan je denken.",
  "slaapwel, Ik kan niet wachten om wakker te worden en je weer te zien 👀, Ik breng liever met jou de nacht door 😊 maar het zal alleen moeten helaas 😔, tot morgen.",
  "het wordt al laat, ik ga schaapjes 🐑 tellen, slaapwel!",
  "ik zal aan je denken vannacht, slaapwel. <3",
  "ik wens u een goede nachtrust en dat u zoete dromen hebt, Goede nacht.",
  "ik houd zo veel van jou, ik ben zo blij dat we elkaar ontmoet hebben, wat alweer zo lang geleden lijkt. 🕰",
];

// ┌────────────── second
// │ ┌──────────── minute
// │ │ ┌────────── hour
// │ │ │ ┌──────── day of month
// │ │ │ │ ┌────── month
// │ │ │ │ │ ┌──── day of week
// │ │ │ │ │ │
// * * * * * *
export default {
//   time: "10 22 * * *",
  time: "0 10 22 * * *",
  async execute(client: Client) {
    // Make embed
    const embed = new Embed({ title: "Bedtijd!" })
      .setColor(`#${colors.pink.replace("#", "")}`)
      .setTimestamp();
    // Get aanspreking and random gn message from array
    const aanspreking =
      aansprekingen[Math.floor(Math.random() * aansprekingen.length)];
    const message = messages[Math.floor(Math.random() * messages.length)];

    const users = process.env.DISCORD_TOKEN!.replace(" ", "").split(",")
    // Send embed to users.
    for (const user of users) {
      embed.setDescription(`${aanspreking} <@${user}>, ` + message);

      const spamPerson = await client.users.fetch(user);
      await spamPerson.send({ embeds: [embed] }).catch((err) => {
        logger.error(err, `Failed to send good night message to ${user}`);
      });
    }
  },
};
