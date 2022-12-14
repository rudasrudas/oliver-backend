const mongoose = require("mongoose");

const householdSchema = new mongoose.Schema({
    name: { type: String },
    address: { type: String },
    join_key: {type: String},
    currency: { type: String },
    admin: { type: mongoose.ObjectId, ref: 'User' },
    allow_edit: { type: Boolean }
})

module.exports = mongoose.model("household", householdSchema);
