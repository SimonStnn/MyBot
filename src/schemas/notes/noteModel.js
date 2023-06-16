const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
   description: {
      type: String,
      required: true,
   },
   userId: {
      type: String,
      required: true,
   },
});
let noteModel;
try {
   noteModel = mongoose.model('Note', NoteSchema);
} catch (err) {
   noteModel = mongoose.model('Note');
}

module.exports = noteModel;
