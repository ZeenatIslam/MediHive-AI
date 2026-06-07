const express = require("express");
const { bookAppointment, listAppointments } = require("../controllers/appointmentController");

const router = express.Router();

router.post("/book", bookAppointment);
router.get("/", listAppointments);

module.exports = router;
