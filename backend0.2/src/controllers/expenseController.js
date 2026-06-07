const Expense = require("../models/Expense");

const getExpenseAnalytics =
  async (req, res) => {
    try {
      const totalExpenses =
        await Expense.aggregate([
          {
            $group: {
              _id: null,
              total: {
                $sum: "$amount",
              },
            },
          },
        ]);

      const departmentExpenses =
        await Expense.aggregate([
          {
            $group: {
              _id: "$department",
              totalExpense: {
                $sum: "$amount",
              },
            },
          },
          {
            $sort: {
              totalExpense: -1,
            },
          },
        ]);

      const categoryExpenses =
        await Expense.aggregate([
          {
            $group: {
              _id: "$category",
              totalExpense: {
                $sum: "$amount",
              },
            },
          },
          {
            $sort: {
              totalExpense: -1,
            },
          },
        ]);

      res.json({
        success: true,

        analytics: {
          totalExpenses:
            totalExpenses[0]?.total || 0,

          departmentExpenses,

          categoryExpenses,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

module.exports = {
  getExpenseAnalytics,
};