const { getDashboardSummary } = require("../services/analyticsService");

const getDashboardAnalytics = async (req, res) => {
  try {
    const analytics = await getDashboardSummary();

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
  getDashboardAnalytics,
};
