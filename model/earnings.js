const mongoose = require("mongoose");

const earningsSchema = new mongoose.Schema({
    user_id: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
    amount: {type: Number},
    month: {type: Date, default: Date.now}
})

module.exports = mongoose.model("earnings", earningsSchema);