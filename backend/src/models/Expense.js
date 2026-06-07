const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    department: String,

    amount: Number,

    category: String,

    expenseDate: Date
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "Expense",
  expenseSchema
);