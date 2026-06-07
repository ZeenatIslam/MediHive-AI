const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const Expense = require("../models/Expense");

// Single source of truth for dashboard analytics.
// Used by both the HTTP controller and the AI agent tools.
const getDashboardSummary = async () => {
  const totalDoctors = await Doctor.countDocuments();

  const totalAppointments = await Appointment.countDocuments();

  const emergencyAppointments = await Appointment.countDocuments({
    emergency: true,
  });

  const departmentStats = await Appointment.aggregate([
    { $group: { _id: "$department", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 1 },
  ]);

  const avgQueue = await Doctor.aggregate([
    {
      $group: {
        _id: null,
        averageQueueLoad: { $avg: "$currentQueueLoad" },
      },
    },
  ]);

  return {
    totalDoctors,
    totalAppointments,
    emergencyAppointments,
    topDepartment: departmentStats[0]?._id || "N/A",
    averageQueueLoad: avgQueue[0]?.averageQueueLoad || 0,
  };
};

// Single source of truth for expense analytics.
const getExpenseSummary = async () => {
  const totalExpenses = await Expense.aggregate([
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const departmentExpenses = await Expense.aggregate([
    { $group: { _id: "$department", totalExpense: { $sum: "$amount" } } },
    { $sort: { totalExpense: -1 } },
  ]);

  const categoryExpenses = await Expense.aggregate([
    { $group: { _id: "$category", totalExpense: { $sum: "$amount" } } },
    { $sort: { totalExpense: -1 } },
  ]);

  return {
    totalExpenses: totalExpenses[0]?.total || 0,
    departmentExpenses,
    categoryExpenses,
  };
};

module.exports = {
  getDashboardSummary,
  getExpenseSummary,
};
