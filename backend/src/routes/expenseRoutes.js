const express =
  require("express");

const {
  getExpenseAnalytics,
} = require(
  "../controllers/expenseController"
);

const router =
  express.Router();

router.get(
  "/analytics",
  getExpenseAnalytics
);

module.exports = router;