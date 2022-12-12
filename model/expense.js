const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
    household_id: { type: mongoose.ObjectId, ref: 'Household' },
    user_id: { type: mongoose.ObjectId, ref: 'User' },
    category_id: { type: mongoose.ObjectId},
    date: { type: Date },
    amount: { type: Number },
    recurring_id: { type: mongoose.ObjectId, ref: 'Recurring_expense' }
})

module.exports = mongoose.model("expense", expenseSchema);
