const mongoose = require("mongoose");

const householdUserSchema = new mongoose.Schema({
    householdId: { type: mongoose.Schema.ObjectId, ref: 'household' },
    userId: { type: mongoose.Schema.ObjectId, ref: 'user' },
    roomSize: { type: Number },
    balance: { type: Number },
    created: { type: Date, default: Date.now }
})

module.exports = mongoose.model("household_user", householdUserSchema);

