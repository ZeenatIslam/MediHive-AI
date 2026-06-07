const Patient=require("../models/patient-model")
const patientRegister = async (req, res) => {
  try {
    const { patientname, age, symptoms,phone } = req.body;
    
    const addPatient=await Patient.create({
      patientname,
      age,
      symptoms,
      phone
    });
    res.status(201).json({
      success:true,
      message:"Patient Registered successfully",
      patient:addPatient    })
  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

const viewAllPatients=async(req,res)=>{
  try{
    const allPatients=await Patient.find();
    res.status(200).json({
      patients: allPatients
    });

  }catch(error){
    res.status(500).json({
      message:"Internal server error"
    })
  }
}

const login = async (req, res) => {
  try {

    res.status(200).json({
      message: "Login Success",
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });
  }
};

const deletePatient=async(req,res)=>{
    try{
        const {id}=req.params;
        await Patient.findByIdAndDelete(id);
        res.status(200).json({
            message:"Patient deleted successfully"
        })
    }catch(error){
        res.status(500).json({
            message:"Internal server error"
        })
    }
}
const updatePatient=async(req,res)=>{
    try{
        const {id}=req.params;
        const {patientname,age,symptoms,phone}=req.body;
        const updatedPatient=await Patient.findByIdAndUpdate(id,{
            patientname,
            age,
            symptoms,
            phone
        },{new:true});
        res.status(200).json({
            message:"Patient updated successfully",
            patient:updatedPatient
        })
    }catch(error){
        res.status(500).json({
            message:"Internal server error"
        })
    }
}

module.exports = {
  patientRegister,
  deletePatient,
  login,
  viewAllPatients
};