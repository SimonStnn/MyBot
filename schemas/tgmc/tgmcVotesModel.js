const mongoose = require('mongoose');

const tgmcVoteSchema = new mongoose.Schema({
   usertag: { type: String },
   userId: { type: String, required: true, unique: true },
   votedToTag: String,
   votedTo: { type: String, required: true },
   messageURL: { type: String, required: true },
});

let tgmcVotesModel;
try {
   tgmcVotesModel = mongoose.model('tgmcVote', tgmcVoteSchema);
} catch (err) {
   tgmcVotesModel = mongoose.model('tgmcVote');
}

module.exports = tgmcVotesModel;
