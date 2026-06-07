const {analyzeSymptoms} = require("../services/triageAgent");
const {assignDoctor} = require("../services/doctorAssignmentService");
const {createAppointment} = require("../services/appointmentService");

const bookAppointment =
  async (req, res) => {
    try {
      const {
        patientName,
        patientPhone,
        symptoms,
      } = req.body;

      const triage =
        await analyzeSymptoms(
          symptoms
        );

      const doctor =
        await assignDoctor(
          triage.department,
          triage.emergency
        );
const appointmentId =
  `MH-${Date.now()}`;
      const appointment =
        await createAppointment({
          patientName,
          patientPhone,
          symptoms,
          doctor,
          triage,
          appointmentId,
        });

      res.json({
        success: true,

        triage,

        doctor: {
          id: doctor._id,
          name: doctor.name,
          department:
            doctor.department,
        },

        appointment,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

module.exports = {
  bookAppointment,
};