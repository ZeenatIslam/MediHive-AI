const { getExpenseSummary } = require("../services/analyticsService");

const getExpenseAnalytics = async (req, res) => {
  try {
    const analytics = await getExpenseSummary();

    res.json({
      success: true,
      analytics,
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
