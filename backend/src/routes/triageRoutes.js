const express = require("express");

const {
  triagePatient,
} = require("../controllers/triageController");

const router = express.Router();

router.post("/", triagePatient);

module.exports = router;