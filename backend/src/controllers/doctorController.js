const Doctor = require("../models/Doctor");

const listDoctors = async (req, res) => {
  try {
    const { department, availableOnly, limit } = req.query;
    const query = {};
    if (department) query.department = department;
    if (availableOnly === "true") query.available = true;
    const lim = parseInt(limit) || 0;
    const q = Doctor.find(query).sort({ department: 1, name: 1 });
    if (lim > 0) q.limit(lim);
    const doctors = await q.lean();
    res.status(200).json({ success: true, doctors });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const doctorRegister = async (req, res) => {
  try {
    const { name: nameField, doctorname, email, department, specialization, rating, maxPatientsPerDay, shift, experience } = req.body;
    const name = (nameField || doctorname || '').trim();

    if (!name) return res.status(400).json({ success: false, message: "Doctor name is required" });
    if (!department) return res.status(400).json({ success: false, message: "Department is required" });

    // Only check email uniqueness when an email is actually provided
    if (email && email.trim()) {
      const existingDoctor = await Doctor.findOne({ email: email.trim() });
      if (existingDoctor) {
        return res.status(400).json({ success: false, message: "A doctor with this email already exists" });
      }
    }

    // experience may come as "8 years" or "8" — extract leading number
    const expNum = experience ? parseInt(String(experience)) || 0 : 0;

    const doctor = await Doctor.create({
      name,
      email: email ? email.trim() : '',
      department,
      specialization: Array.isArray(specialization) ? specialization : (specialization ? [specialization] : []),
      rating: rating ? Number(rating) : undefined,
      maxPatientsPerDay: maxPatientsPerDay ? Number(maxPatientsPerDay) : undefined,
      shift,
      experience: expNum,
    });

    res.status(201).json({ success: true, message: "Doctor registered successfully", doctor });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message || "Server Error" });
  }
};

const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    await Doctor.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Doctor deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = { listDoctors, doctorRegister, deleteDoctor };
