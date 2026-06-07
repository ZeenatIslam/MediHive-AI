const Doctor = require("../models/doctor-model");

const doctorRegister = async (req, res) => {

    try {

        const {
            name,
            email,
            department,
            specialization,
            rating,
            maxPatientsPerDay,
            shift,
            lastAssignmentAt,
            experience
        } = req.body;

        // check existing doctor
        const existingDoctor = await Doctor.findOne({ email });

        if (existingDoctor) {

            return res.status(400).json({
                success: false,
                message: "Doctor already exists",
            });
        }

        // create doctor
        const doctor = await Doctor.create({
            name,
            email,
            department,
            specialization,
            rating,
            maxPatientsPerDay,
            shift,
            
            lastAssignmentAt,
            experience
        });

        res.status(201).json({
            success: true,
            message: "Doctor registered successfully",
            doctor,
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};
const deleteDoctor=async(req,res)=>{
    const {Id}=req.params;
    try{
        await Doctor.findByIdAndDelete(Id);
        res.status(200).json({
            success:true,
            message:"Doctor deleted successfully"
        })

    }catch(error){
res.status(500).json({
    message:"error "
})
    }

}

module.exports = {
    doctorRegister,
};