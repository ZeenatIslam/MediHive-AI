const fs = require("fs");
const ai = require("../config/gemini");
const { toolImplementations } = require("../agent/tools");

const uploadReport = async (req, res) => {
  try {
    console.log("FILE RECEIVED:", req.file);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded",
      });
    }

    // Upload file to Gemini
    const uploaded = await ai.files.upload({
      file: req.file.path,
      config: {
        mimeType: req.file.mimetype,
      },
    });

    console.log(
      "UPLOADED FILE:",
      JSON.stringify(uploaded, null, 2)
    );

    // Handle different SDK response formats
    const fileUri =
      uploaded?.uri ||
      uploaded?.file?.uri;

    const mimeType =
      uploaded?.mimeType ||
      uploaded?.file?.mimeType ||
      req.file.mimetype;

    if (!fileUri) {
      throw new Error(
        "Gemini upload succeeded but no file URI was returned."
      );
    }

    // Use your existing tool
    const result =
      await toolImplementations.analyze_medical_report({
        fileUri,
        mimeType,
      });

    // Cleanup local temp file
    try {
      fs.unlinkSync(req.file.path);
    } catch (e) {
      console.log("Temp file cleanup skipped");
    }

    return res.status(200).json({
      success: true,
      analysis: result.analysis,
    });
  } catch (error) {
    console.error("REPORT ANALYSIS ERROR:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  uploadReport,
};