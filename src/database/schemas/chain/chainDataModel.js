const mongoose = require('mongoose');

const chainDataSchema = new mongoose.Schema({
   chain: String,
   chainCount: Number,
   lastPerson: String,
});

let chainDataModel;
try {
   chainDataModel = mongoose.model('chainData', chainDataSchema);
} catch (err) {
   chainDataModel = mongoose.model('chainData');
}

module.exports = chainDataModel;
