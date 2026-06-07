const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true
    },

    age: Number,

    gender: String,

    phone: String,

    symptoms: [String],

    medicalHistory: [String]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "Patient",
  patientSchema
);