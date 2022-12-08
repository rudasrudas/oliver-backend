const mongoose = require("mongoose");

const earningsSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
    amount: {type: Number},
    month: {type: Date, default: Date.now}
})

module.exports = mongoose.model("earnings", earningsSchema);