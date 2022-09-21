const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { colors, legend } = require('../../config.json');
const noteModel = require('../../schemas/notes/noteModel.js');
const logs = require('../../files/log.js');

const MAX_NOTES = 20;

module.exports = {
   data: new SlashCommandBuilder()
      .setName('note')
      .setDescription('Save a note so you can read it again later.')
      //* Subcommands
      .addSubcommand((subcommand) =>
         subcommand
            .setName('all')
            .setDescription('Show all your notes.')
            .addUserOption((option) =>
               option.setName('target').setDescription('Select a user')
            )
      )
      .addSubcommand((subcommand) =>
         subcommand
            .setName('add')
            .setDescription('Add a note.')
            .addStringOption((option) =>
               option
                  .setName('discription')
                  .setDescription('Add or remove your notes.')
                  .setRequired(true)
            )
      )
      .addSubcommand((subcommand) =>
         subcommand
            .setName('remove')
            .setDescription('Remove a note.')
            .addIntegerOption((option) =>
               option
                  .setName('index')
                  .setDescription(
                     'Insert the index of the note you want to delete.'
                  )
                  .setRequired(true)
            )
      ),
   usage: "/note all \"target\"\n/note add 'note'\n/note remove 'index'",
   database: true,
   async execute(interaction) {
      // Find all your notes.
      const notes = await noteModel.find({ userId: interaction.user.id });
      // Construct an embed.
      const embed = new EmbedBuilder()
         .setFooter({
            text: `${interaction.user.tag}`,
            iconURL: `${interaction.user.displayAvatarURL({ dynamic: true })}`,
         })
         .setColor(colors.command)
         //.setTitle(`Notes`)
         .setTimestamp();

      switch (interaction.options.getSubcommand()) {
         case 'all':
            const user = interaction.options.getUser('target');
            if (user) {
               // Get notes from user.
               const userNotes = await noteModel.find({ userId: user.id });
               // Check if user has notes.
               if (userNotes.length == 0) {
                  embed.setDescription(
                     `\`${user.tag}\` doesn't have any notes.`
                  );
                  return await interaction.reply({ embeds: [embed] });
               }
               // Make string with all notes from user.
               let userNote = '';
               for (const note in userNotes) {
                  userNote += `${parseInt(note) + 1}) ${userNotes[note].description
                     }\n`;
               }
               embed.addFields([
                  { name: `${user.tag}'s notes:`, value: `${userNote}` },
               ]);
               return await interaction.reply({ embeds: [embed] });
            } else {
               // If you don't have any notes, then...
               if (notes.length == 0) {
                  embed.setDescription(
                     "You don't have any notes yet, please do `/note add` to make one."
                  );
                  return await interaction.reply({ embeds: [embed] });
               }
               // Make string with all your notes.
               let yourNotes = '';
               for (const note in notes) {
                  yourNotes += `${parseInt(note) + 1}) ${notes[note].description
                     }\n`;
               }
               embed.addFields([{ name: 'Your notes:', value: yourNotes }]);
               return await interaction.reply({ embeds: [embed] });
            }

         case 'add':
            // Make sure you can't have more than 5 notes.
            if (notes.length >= MAX_NOTES) {
               embed.addFields([
                  {
                     name: `You have reached the maximum number of notes.`,
                     value: ` Please delete one so you can make an other.`,
                  },
               ]);
               return await interaction.reply({ embeds: [embed] });
            }
            const description = await interaction.options.getString(
               'discription'
            );
            try {
               // Create a note.
               await noteModel.create({
                  description: description,
                  userId: interaction.user.id,
               });
               embed.addFields([
                  {
                     name: `Saved note:`,
                     value: `${notes.length + 1}) ${description}`,
                  },
               ]);
               return await interaction.reply({ embeds: [embed] });
            } catch (err) {
               logs.error(
                  interaction.client,
                  err,
                  `Failed to save note from ${interaction.user.tag}`
               );
               embed.addFields([
                  {
                     name: `Failed to save note:`,
                     value: `${notes.length + 1}) ${description}`,
                  },
               ]);
               return await interaction.reply({
                  embeds: [embed],
                  ephemeral: true,
               });
            }

         case 'remove':
            const index = interaction.options.getInteger('index');
            // Make sure you have notes and you gave a correct index.
            if (notes.length == 0) {
               return await interaction.reply(
                  "You don't have any notes yet, please do `/note add` to make one."
               );
            }
            if (index < 1 || index > notes.length) {
               return await interaction.reply({
                  content: `Please insert an index between 1 and ${notes.length}`,
                  ephemeral: true,
               });
            }
            // Find the note you want to delete
            const noteToRemove = await noteModel.findOne(
               { userId: interaction.user.id },
               null,
               {
                  limit: 1,
                  skip: index - 1,
               }
            );
            try {
               // Delete note by _id.
               await noteModel.findByIdAndDelete(noteToRemove._id);
               embed.addFields([
                  {
                     name: `Succesfully removed:`,
                     value: `${index}) ${noteToRemove.description}`,
                  },
               ]);
               return await interaction.reply({
                  embeds: [embed],
                  ephemeral: false,
               });
            } catch (err) {
               logs.error(
                  interaction.client,
                  err,
                  `Failed to remove note from ${interaction.user.tag}`
               );
               embed.addFields([
                  {
                     name: `Failed to remove.`,
                     value: `${index}) ${noteToRemove.description}`,
                  },
               ]);
               return await interaction.reply({
                  embeds: [embed],
                  ephemeral: true,
               });
            }
      }
   },
};
