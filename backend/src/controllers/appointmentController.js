const { analyzeSymptoms } = require("../services/triageAgent");
const { assignDoctor } = require("../services/doctorAssignmentService");
const { createAppointment } = require("../services/appointmentService");
const Appointment = require("../models/Appointment");

const bookAppointment = async (req, res) => {
  try {
    const { patientName, patientPhone, symptoms, department, emergency, status } = req.body;

    if (!patientName?.trim()) {
      return res.status(400).json({ success: false, message: "Patient name is required" });
    }
    if (!symptoms?.length) {
      return res.status(400).json({ success: false, message: "Symptoms are required for triage" });
    }
    if (patientPhone && !/^\+?[\d\s\-().]{7,15}$/.test(patientPhone.trim())) {
      return res.status(400).json({ success: false, message: "Invalid phone number format" });
    }

    const triage = await analyzeSymptoms(symptoms);

    // User-supplied emergency flag overrides triage if explicitly set to true
    if (emergency === true || emergency === "true") triage.emergency = true;
    // User-supplied department preference overrides triage (unless emergency — emergency routing takes priority)
    if (department && !triage.emergency) triage.department = department;

    const doctor = await assignDoctor(triage.department, triage.emergency);
    const appointmentId = `MH-${Date.now()}`;

    const appointment = await createAppointment({
      appointmentId,
      patientName,
      patientPhone: patientPhone?.trim() || '',
      symptoms,
      doctor,
      triage,
      status: status || "Pending",
    });

    const result = appointment.toObject();
    result.doctorName = doctor.name;

    res.json({
      success: true,
      triage,
      doctor: { id: doctor._id, name: doctor.name, department: doctor.department },
      appointment: result,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const listAppointments = async (req, res) => {
  try {
    const { emergency, status, department, doctorId, limit } = req.query;
    const query = {};
    if (emergency === "true") query.emergency = true;
    if (emergency === "false") query.emergency = false;
    if (status) query.status = status;
    if (department) query.department = department;
    if (doctorId) query.doctorId = doctorId;

    const lim = Math.min(parseInt(limit) || 20, 100);
    const appointments = await Appointment.find(query)
      .sort({ createdAt: -1 })
      .limit(lim)
      .lean();

    res.json({ success: true, appointments });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { bookAppointment, listAppointments };
