require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./src/config/db");

const triageRoutes = require("./src/routes/triageRoutes");
const analyticsRoutes = require("./src/routes/analyticsRoutes");
const appointmentRoutes = require("./src/routes/appointmentRoutes");
const expenseRoutes = require("./src/routes/expenseRoutes");
const agentRoutes = require("./src/routes/agentRoutes");
const patientRoutes = require("./src/routes/patientRoutes");
const doctorRoutes = require("./src/routes/doctorRoutes");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/triage", triageRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/agent", agentRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/doctors", doctorRoutes);

app.get("/", (req, res) => {
  res.json({ success: true, message: "MediHive AI Backend Running" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server Running On Port ${PORT}`);
});
