const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    title: { type: String },
    icon: { type: String }
})

module.exports = mongoose.model("category", categorySchema);
