const Appointment = require(
  "../models/Appointment"
);

const createAppointment =
  async ({
    appointmentId,
    patientName,
    patientPhone,
    symptoms,
    doctor,
    triage,
    status,
  }) => {
    const queueNumber =
      triage.emergency
        ? 1
        : doctor.currentQueueLoad + 1;

    const estimatedWaitTime =
      triage.emergency
        ? 0
        : doctor.currentQueueLoad * 15;

    const appointment =
      await Appointment.create({
         appointmentId,
        patientName,
        patientPhone,
        symptoms,

        doctorId: doctor._id,

        department:
          doctor.department,

        severity:
          triage.severity,

        emergency:
          triage.emergency,

        queueNumber,

        estimatedWaitTime,

        status: status || "Pending",
      });

    doctor.currentQueueLoad += 1;

    doctor.patientsToday += 1;

    if (triage.emergency) {
      doctor.emergencyCasesHandled += 1;
    }

    doctor.lastAssignedAt =
      new Date();

    await doctor.save();

    return appointment;
  };

module.exports = {
  createAppointment,
};