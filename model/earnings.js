const mongoose = require("mongoose");

const earningsSchema = new mongoose.Schema({
    userId: { type: String },
    amount: { type: Number },
    month: {type: Date}
})

module.exports = mongoose.model("earnings", earningsSchema);