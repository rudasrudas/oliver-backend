const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String },
    surname: { type: String },
    email: { type: String, unique: true },
    password: { type: String },
    estimated_monthly_income: { type: Number, default: 0 },
    registered: { type: Date },
    balance: { type: Number, default: 0 },
    token: { type: String }
})

module.exports = mongoose.model("user", userSchema);

