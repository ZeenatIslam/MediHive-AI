const Patient = require("../models/Patient");

const patientRegister = async (req, res) => {
  try {
    const { patientname, fullName, age, gender, symptoms, phone, medicalHistory } = req.body;

    const name = fullName || patientname;
    if (!name) {
      return res.status(400).json({ success: false, message: "Patient name is required" });
    }

    const patient = await Patient.create({
      fullName: name,
      age,
      gender,
      phone,
      symptoms: Array.isArray(symptoms) ? symptoms : (symptoms ? symptoms.split(",").map(s => s.trim()).filter(Boolean) : []),
      medicalHistory: medicalHistory || [],
    });

    res.status(201).json({
      success: true,
      message: "Patient registered successfully",
      patient,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const viewAllPatients = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 0;
    const query = Patient.find().sort({ createdAt: -1 });
    if (limit > 0) query.limit(limit);
    const patients = await query.lean();
    res.status(200).json({ success: true, patients });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    await Patient.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Patient deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const { patientname, fullName, age, symptoms, phone, gender } = req.body;
    const updated = await Patient.findByIdAndUpdate(
      id,
      { fullName: fullName || patientname, age, symptoms, phone, gender },
      { new: true }
    );
    res.status(200).json({ success: true, message: "Patient updated successfully", patient: updated });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = { patientRegister, viewAllPatients, deletePatient, updatePatient };
