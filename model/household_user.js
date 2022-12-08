const mongoose = require("mongoose");

const householdUserSchema = new mongoose.Schema({
    household_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Household' },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    roomSize: { type: Number },
    balance: { type: Number },
    created: { type: Date, default: Date.now }
})

module.exports = mongoose.model("household_user", householdUserSchema);

