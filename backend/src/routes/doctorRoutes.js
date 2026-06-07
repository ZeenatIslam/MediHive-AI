const express = require("express");
const { listDoctors, doctorRegister, deleteDoctor } = require("../controllers/doctorController");

const router = express.Router();

router.get("/", listDoctors);
router.post("/register", doctorRegister);
router.delete("/:id", deleteDoctor);

module.exports = router;
