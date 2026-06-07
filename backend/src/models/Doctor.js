const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        default: '',
    },
    department: {
        type: String,
        required: true,
    },
    specialization: [String],
    experience: {
        type: Number,
        default: 0,
    },
    rating: {
        type: Number,
        default: 4.0,
    },
    available: {
        type: Boolean,
        default: true,
    },
    patientsToday: {
        type: Number,
        default: 0,
    },
    maxPatientsPerDay: {
        type: Number,
        default: 20,
    },
    currentQueueLoad: {
        type: Number,
        default: 0,
    },
    emergencyCasesHandled: {
        type: Number,
        default: 0,
    },

    shift: {
        type: String, // morning / evening / night
    },

    lastAssignedAt: {
        type: Date,
    },
}, { timestamps: true });

module.exports = mongoose.model("Doctor", doctorSchema);