const mongoose = require("mongoose");

const expensePayerSchema = new mongoose.Schema({
    expense_id: { type: mongoose.ObjectId, ref: "Expense" },
    payer_id: { type: mongoose.ObjectId, ref: "User" },
    percentage_to_pay: { type: Number }
})

module.exports = mongoose.model("expense_payer", expensePayerSchema);
