const mongoose = require('mongoose');

const tgmcDataSchema = new mongoose.Schema({
   state: {
      type: String,
      required: true,
   },
   nr1_tag: {
      type: String,
      required: true,
   },
   nr1_id: {
      type: String,
      required: true,
   },
   nr2_tag: {
      type: String,
      required: true,
   },
   nr2_id: {
      type: String,
      required: true,
   },
   nr3_tag: {
      type: String,
      required: true,
   },
   nr3_id: {
      type: String,
      required: true,
   },
});

let tgmcDataModel;
try {
   tgmcDataModel = mongoose.model('tgmcData', tgmcDataSchema);
} catch (err) {
   tgmcDataModel = mongoose.model('tgmcData');
}

module.exports = tgmcDataModel;
