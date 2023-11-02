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
  "Lekker slapen,",
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
  "Onder de 🌙schijn, slaap lekker en droom fijn!",
  "Onder de ✨sterrenpracht, wens ik je een goede nacht. Slaap lekker en droom zacht!",
  "Maanlicht 🌕 verlicht je bed, rust nu uit, leg je hoofd te rusten, mijn lieve schat. Droom zacht en slaap goed!",
  "Met de 🌄 op komst, rust nu uit en we zien elkaar bij zonsopgang. ☀️",
  "Droomland wacht op je, slaapwel! 🌈🌌",
  "Ga slapen en geniet van de 🌠-show in je dromen.",
  "Slaap lekker, slaap zacht, droom van mij vannacht. 🌙",
  "Ik wens je een goede nacht en een goede nachtrust, slaap lekker. 😴",
  "Tot morgen, en moge je dromen vervuld worden! 🚀",
  "Met elke ademhaling hou ik meer van je. Slaap lekker, mijn liefste. 💞😴",
  "Mijn hart is gevuld met liefde voor jou, zelfs in mijn dromen. Slaap lekker, mijn liefje. ❤️😴",
  "Slaap lekker, mijn liefste. Onze liefde schijnt helderder dan de sterren. 💖🌟",
  "Elke nacht zonder jou is een nacht niet volledig. Droom van mij, zoals ik van jou droom. 💑😴",
  "Terwijl de nacht valt, verlang ik naar jou. Slaap lekker ding, mijn liefste. ❤️🌜",
  "In mijn gedachten en in mijn hart, ben je de enige voor mij. Droom zoet, mijn liefste. 🌜❤️",
  "De nacht is ons moment🌙, en ik kan niet wachten om in je armen te zijn. 💋",
  "De gedachte aan jou maakt me warm, zelfs in de koudste nacht. Slaap goed, mijn passie. 🔥❤️",
  "Slaap lekker, mijn lief. Jouw aanraking is alles wat ik verlang 💖, zelfs in mijn dromen. 🌙",
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

    const users = process.env.GN_USERS!.replace(" ", "").split(",");
    // Send embed to users.
    for (const user of users) {
      embed.setDescription(`${aanspreking} <@${user.trim()}>, ` + message);

      try {
        const spamPerson = await client.users.fetch(user);
        await spamPerson.send({ embeds: [embed] });
        logger.info(
          `Succesfully send good night message to ${spamPerson.username}`
        );
      } catch (err) {
        logger.error(err, `Failed to send good night message to ${user}`);
      }
    }
  },
};
