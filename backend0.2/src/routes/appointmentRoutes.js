const express =require("express");
const {bookAppointment,} = require("../controllers/appointmentController");

const router =express.Router();

router.post("/book",bookAppointment);

module.exports = router;