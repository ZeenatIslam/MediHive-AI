const express = require("express");
const multer = require("multer");
const { uploadReport } = require("../controllers/reportController");

const router = express.Router();

const upload = multer({
  dest: "uploads/",
});

router.post(
  "/upload-report",
  upload.single("report"),
  uploadReport
);

module.exports = router;