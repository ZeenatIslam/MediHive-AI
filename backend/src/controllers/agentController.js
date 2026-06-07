const { runAgent } = require("../agent/healthcareAgent");

const chatWithAgent = async (req, res) => {
  try {
    let { messages, message } = req.body;

    // Accept either a full { messages: [...] } history or a single { message }.
    if (!messages && message) {
      messages = [{ role: "user", content: message }];
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide 'messages' (array) or 'message' (string).",
      });
    }

    const { reply, toolsUsed } = await runAgent(messages);

    res.json({
      success: true,
      reply,
      toolsUsed,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  chatWithAgent,
};
