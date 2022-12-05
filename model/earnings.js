const mongoose = require("mongoose");

const earningsSchema = new mongoose.Schema({
    user: {type: String},
    amount: { type: Double},
    month: { type: Date },
});

module.exports = mongoose.model("Earnings", earningsSchema);