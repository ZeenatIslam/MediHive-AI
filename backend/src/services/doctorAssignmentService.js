const Doctor = require("../models/Doctor");

const assignDoctor = async (
  department,
  emergency = false
) => {
  try {
    let doctor;

    if (emergency) {
      doctor = await Doctor.findOne({
        department,
        available: true,
      }).sort({
        currentQueueLoad: 1,
        emergencyCasesHandled: 1,
      });
    } else {
      doctor = await Doctor.findOne({
        department,
        available: true,
      }).sort({
        currentQueueLoad: 1,
        patientsToday: 1,
      });
    }
    
    if (!doctor) {
      throw new Error(
        "Doctor Not Available"
      );
    }

    return doctor;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  assignDoctor,
};