const ai = require("../config/gemini");

const analyzeSymptoms = async (symptoms ) => {
  try {
    if (typeof symptoms === "string") {
      symptoms = symptoms
        .split(",")
        .map(item => item.trim());
    }

    if (!Array.isArray(symptoms) || symptoms.length === 0) {
      throw new Error("Symptoms are required");
    }



    const prompt = `
Analyze these symptoms:
${symptoms.join(", ")}

Return ONLY valid JSON:

{
  "severity":"Low | Medium | High",
  "department":"Department Name",
  "emergency":true
}
  
Possible departments:
Cardiology,
Neurology,
Orthopedics,
Gastroenterology,
Pulmonology,
Dermatology,
Pediatrics,
Gynecology

`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
      config: {
        timeout: 30000,
      },
      systemInstruction: "Keep your answers short (maximum in 200 characters), concise, and to the point. Avoid unnecessary elaboration.",
      temperature: 0.3,
    });

    const text = response.text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(text);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports = {
  analyzeSymptoms,
};