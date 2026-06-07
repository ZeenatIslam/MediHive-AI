const express = require("express");
const { patientRegister, viewAllPatients, deletePatient, updatePatient } = require("../controllers/patientController");

const router = express.Router();

router.get("/", viewAllPatients);
router.post("/register", patientRegister);
router.delete("/:id", deletePatient);
router.put("/:id", updatePatient);

module.exports = router;
