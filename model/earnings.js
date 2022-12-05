const mongoose = require("mongoose");

const earningsSchema = new mongoose.Schema({
    user_id: {type: String},
    amount: { type: Double},
    month: { type: Date },
});

module.exports = mongoose.model("earnings", earningsSchema);