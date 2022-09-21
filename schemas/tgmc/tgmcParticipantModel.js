const mongoose = require('mongoose');

const tgmcParticipantSchema = new mongoose.Schema({
   usertag: { type: String, required: true },
   userId: { type: String, required: true, unique: true },
   messageURL: { type: String, required: true },
   votes: Number,
});

let tgmcParticipantModel;
try {
   tgmcParticipantModel = mongoose.model(
      'tgmcParticipant',
      tgmcParticipantSchema
   );
} catch (err) {
   tgmcParticipantModel = mongoose.model('tgmcParticipant');
}

module.exports = tgmcParticipantModel;
