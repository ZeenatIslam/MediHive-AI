const mongoose = require("mongoose");

const appointmentSchema =
  new mongoose.Schema(
    {
      appointmentId: {
        type: String,
        unique: true
      },
      patientName: {
        type: String,
        required: true,
      },

      patientPhone: {
        type: String,
        default: '',
      },

      symptoms: [String],

      doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
      },

      department: String,

      severity: String,

      emergency: Boolean,

      queueNumber: Number,

      estimatedWaitTime: Number,

      status: {
        type: String,
        default: "Pending",
      },
    },
    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "Appointment",
    appointmentSchema
  );