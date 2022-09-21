
module.exports = {
   handle(client, commandName, autocompleteChoices) {
      client.on('interactionCreate', async (interaction) => {
         if (
            !interaction.isAutocomplete() ||
            interaction.commandName !== commandName
         ) {
            return;
         }

         const focusedValue = interaction.options.getFocused();
         let filtered = autocompleteChoices
            .filter((choice) => choice.startsWith(focusedValue))
            .slice(0, 25);

         await interaction.respond(
            filtered.map((choice) => ({ name: choice, value: choice }))
         );
      });
   }
}