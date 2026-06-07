const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");

const getDashboardAnalytics =
  async (req, res) => {
    try {
      const totalDoctors =
        await Doctor.countDocuments();

      const totalAppointments =
        await Appointment.countDocuments();

      const emergencyAppointments =
        await Appointment.countDocuments({
          emergency: true,
        });

      const departmentStats =
        await Appointment.aggregate([
          {
            $group: {
              _id: "$department",
              count: {
                $sum: 1,
              },
            },
          },
          {
            $sort: {
              count: -1,
            },
          },
          {
            $limit: 1,
          },
        ]);

      const avgQueue =
        await Doctor.aggregate([
          {
            $group: {
              _id: null,
              averageQueueLoad: {
                $avg:
                  "$currentQueueLoad",
              },
            },
          },
        ]);

      res.json({
        success: true,

        analytics: {
          totalDoctors,

          totalAppointments,

          emergencyAppointments,

          topDepartment:
            departmentStats[0]?._id ||
            "N/A",

          averageQueueLoad:
            avgQueue[0]
              ?.averageQueueLoad || 0,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

module.exports = {
  getDashboardAnalytics,
};