const mongoose = require("mongoose");

const recurringExpenseSchema = new mongoose.Schema({
    start_date: { type: Date },
    end_date: { type: Date },
    frequency: { type: String },
    send_reminder: { type: Boolean }
})

module.exports = mongoose.model("recurring_expense", recurringExpenseSchema);
