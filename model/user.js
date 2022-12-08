const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String },
    surname: { type: String },
    email: { type: String, unique: true },
    password: { type: String },
    estimatedMonthlyIncome: { type: Number },
    registered: { type: Date, default: Date.now },
    balance: { type: Number, default: 0 },
    token: { type: String }
})

module.exports = mongoose.model("user", userSchema);

