const mongoose = require("mongoose");

const householdUserSchema = new mongoose.Schema({
    household_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Household' },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    room_size: { type: Number },
    balance: { type: Number },
    created: { type: Date },
    left: { type: Date },
    status: { type: String, default: "pending" }
})

module.exports = mongoose.model("household_user", householdUserSchema);

