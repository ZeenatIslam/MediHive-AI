const { Type } = require("@google/genai");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const Patient = require("../models/Patient");
const ai = require("../config/gemini");


const { analyzeSymptoms, DEPARTMENTS } = require("../services/triageAgent");
const { assignDoctor } = require("../services/doctorAssignmentService");
const { createAppointment } = require("../services/appointmentService");
const {
  getDashboardSummary,
  getExpenseSummary,
} = require("../services/analyticsService");

// Normalize a symptoms input (string or array) into a clean string array.
const toSymptomArray = (symptoms) => {
  if (typeof symptoms === "string") {
    symptoms = symptoms.split(",");
  }
  if (!Array.isArray(symptoms)) return [];
  return symptoms.map((s) => String(s).trim()).filter(Boolean);
};

const doctorPublic = (d) => ({
  id: d._id,
  name: d.name,
  department: d.department,
  specialization: d.specialization,
  available: d.available,
  rating: d.rating,
  currentQueueLoad: d.currentQueueLoad,
  patientsToday: d.patientsToday,
  maxPatientsPerDay: d.maxPatientsPerDay,
  shift: d.shift,
});

// ---- Tool implementations (each returns a plain, serializable object) ----

const toolImplementations = {
  triage_symptoms: async ({ symptoms }) => {
    return await analyzeSymptoms(toSymptomArray(symptoms));
  },

  book_appointment: async ({ patientName, patientPhone, symptoms }) => {
    const symptomList = toSymptomArray(symptoms);
    if (!patientName || !patientPhone || symptomList.length === 0) {
      throw new Error(
        "patientName, patientPhone, and at least one symptom are required to book."
      );
    }

    const triage = await analyzeSymptoms(symptomList);
    const doctor = await assignDoctor(triage.department, triage.emergency);
    const appointmentId = `MH-${Date.now()}`;

    const appointment = await createAppointment({
      appointmentId,
      patientName,
      patientPhone,
      symptoms: symptomList,
      doctor,
      triage,
    });

    return {
      triage,
      doctor: doctorPublic(doctor),
      appointment,
    };
  },

  find_available_doctor: async ({ department, emergency = false }) => {
    const doctor = await assignDoctor(department, emergency);
    return doctorPublic(doctor);
  },

  list_doctors: async ({ department, availableOnly = false } = {}) => {
    const query = {};
    if (department) query.department = department;
    if (availableOnly) query.available = true;
    const doctors = await Doctor.find(query)
      .sort({ currentQueueLoad: 1 })
      .limit(50);
    return { count: doctors.length, doctors: doctors.map(doctorPublic) };
  },

  list_appointments: async ({
    status,
    department,
    emergency,
    limit = 10,
  } = {}) => {
    const query = {};
    if (status) query.status = status;
    if (department) query.department = department;
    if (typeof emergency === "boolean") query.emergency = emergency;
    const appointments = await Appointment.find(query)
      .sort({ createdAt: -1 })
      .limit(Math.min(Number(limit) || 10, 50));
    return { count: appointments.length, appointments };
  },

  search_patients: async ({ query }) => {
    const term = String(query || "").trim();
    if (!term) throw new Error("A search query is required.");
    const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const patients = await Patient.find({
      $or: [{ fullName: regex }, { phone: regex }],
    }).limit(20);
    return { count: patients.length, patients };
  },

  get_dashboard_analytics: async () => {
    return await getDashboardSummary();
  },

  get_expense_analytics: async () => {
    return await getExpenseSummary();
  },
  analyze_medical_report: async ({ fileUri, mimeType }) => {
    if (!fileUri || !mimeType) {
      throw new Error("fileUri and mimeType are required.");
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              fileData: {
                fileUri,
                mimeType,
              },
            },
            {
              text: `
Analyze this medical report and return:

1. Patient Summary
2. Key Findings
3. Abnormal Values
4. Diagnoses Mentioned
5. Medications Mentioned
6. Clinical Concerns
7. Recommended Follow-up

Return valid JSON only.
Do not wrap JSON in markdown.
Do not include \`\`\`json or \`\`\`.

            `,
            },
          ],
        },
      ],
    });

    return {
      analysis: response.text,
    };
  },
};

// ---- Gemini function declarations (schemas the model sees) ----

const functionDeclarations = [
  {
    name: "triage_symptoms",
    description:
      "Analyze a patient's symptoms and return severity, the recommended department, and whether it is an emergency. Use this before booking, or whenever asked to assess symptoms.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        symptoms: {
          type: Type.STRING,
          description: "Comma-separated list of the patient's symptoms.",
        },
      },
      required: ["symptoms"],
    },
  },
  {
    name: "analyze_medical_report",
    description:
      "Analyze uploaded medical reports, lab reports, prescriptions, discharge summaries, scans, and medical images.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        fileUri: {
          type: Type.STRING,
          description: "Gemini uploaded file URI",
        },
        mimeType: {
          type: Type.STRING,
          description:
            "File MIME type such as application/pdf or image/jpeg",
        },
      },
      required: ["fileUri", "mimeType"],
    },
  },
  {
    name: "book_appointment",
    description:
      "Book a hospital appointment end-to-end: triage the symptoms, assign the best available doctor in the right department, and create the appointment. Only call this AFTER the user has explicitly confirmed the patient name, phone number, and symptoms.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        patientName: { type: Type.STRING, description: "Full name of the patient." },
        patientPhone: { type: Type.STRING, description: "Patient phone number." },
        symptoms: {
          type: Type.STRING,
          description: "Comma-separated list of the patient's symptoms.",
        },
      },
      required: ["patientName", "patientPhone", "symptoms"],
    },
  },
  {
    name: "find_available_doctor",
    description:
      "Find the best available doctor for a department without booking anything. Use to check availability or suggest a doctor.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        department: {
          type: Type.STRING,
          enum: DEPARTMENTS,
          description: "Department to search for an available doctor.",
        },
        emergency: {
          type: Type.BOOLEAN,
          description: "Whether this is an emergency (changes prioritization).",
        },
      },
      required: ["department"],
    },
  },
  {
    name: "list_doctors",
    description:
      "List doctors, optionally filtered by department and/or availability. Each result includes the doctor's name, department, specialization, availability, rating, current queue load, patients seen today, and max capacity. Use to answer any question about staff, capacity, queue load, or availability.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        department: { type: Type.STRING, enum: DEPARTMENTS },
        availableOnly: {
          type: Type.BOOLEAN,
          description: "If true, only return doctors currently marked available.",
        },
      },
    },
  },
  {
    name: "list_appointments",
    description:
      "List recent appointments, optionally filtered by status, department, or emergency flag. Use for queue, scheduling, and operational questions.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        status: {
          type: Type.STRING,
          description: 'Appointment status, e.g. "Pending".',
        },
        department: { type: Type.STRING, enum: DEPARTMENTS },
        emergency: { type: Type.BOOLEAN },
        limit: {
          type: Type.NUMBER,
          description: "Max number of appointments to return (default 10, max 50).",
        },
      },
    },
  },
  {
    name: "search_patients",
    description:
      "Search registered patients by name or phone number.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: {
          type: Type.STRING,
          description: "Name or phone fragment to search for.",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "get_dashboard_analytics",
    description:
      "Get hospital-wide operational analytics: total doctors, total and emergency appointments, busiest department, and average queue load. Use for insights and status summaries.",
    parameters: { type: Type.OBJECT, properties: {} },
  },
  {
    name: "get_expense_analytics",
    description:
      "Get expense analytics: total expenses, and breakdowns by department and category.",
    parameters: { type: Type.OBJECT, properties: {} },
  },
];

module.exports = {
  functionDeclarations,
  toolImplementations,
};
