const mongoose = require('mongoose');

const userChainDataSchema = new mongoose.Schema({
   userTag: String,
   userId: { type: String, required: true, unique: true },
   totalCount: Number,
   totalBroken: Number,
});

let userChainDataModel;
try {
   userChainDataModel = mongoose.model('userChainData', userChainDataSchema);
} catch (err) {
   userChainDataModel = mongoose.model('userChainData');
}

module.exports = userChainDataModel;
