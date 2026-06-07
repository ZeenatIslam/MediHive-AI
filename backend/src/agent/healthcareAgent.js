const ai = require("../config/gemini");
const { functionDeclarations, toolImplementations } = require("./tools");

const MODEL = "gemini-2.5-flash";
const MAX_TURNS = 6;
const MAX_RETRIES = 3;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Call the model with retry/backoff on transient rate-limit (429) errors.
const generateWithRetry = async (params) => {
  let lastError;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await ai.models.generateContent(params);
    } catch (err) {
      const status = err?.status || err?.code;
      const is429 =
        status === 429 ||
        /RESOURCE_EXHAUSTED|quota|rate.?limit/i.test(err?.message || "");
      if (!is429 || attempt === MAX_RETRIES) throw err;
      lastError = err;
      // Exponential backoff: 2s, 4s, 8s.
      await sleep(2000 * Math.pow(2, attempt));
    }
  }
  throw lastError;
};

const SYSTEM_INSTRUCTION = `You are MediHive, the AI operations assistant for a hospital management system.
You help staff with patient triage, appointment booking, doctor availability, and analytics.

Guidelines:
- For READ-ONLY questions (doctor availability, appointments, patients, analytics, triage), call the relevant tool IMMEDIATELY and answer. Never ask the user for permission to look something up, and never say you "cannot" provide data that a tool can return — call the tool and report what it gives back. "list_doctors" already includes each doctor's queue load and patient counts.
- Base every factual claim about doctors, appointments, patients, or analytics on tool results, not assumptions.
- For triage and clinical questions, be conservative: when symptoms could be serious, escalate.
- Booking is the ONLY action that needs confirmation. To BOOK an appointment you need the patient's full name, phone number, and symptoms. If any are missing, ask for them. Only call "book_appointment" after the user has explicitly confirmed all three.
- When you book, summarize the outcome clearly: assigned doctor, department, severity, queue number, and estimated wait time.
- Be concise and professional. Use short paragraphs or bullet points. You are assisting staff, not patients directly.
- You are not a substitute for a licensed clinician's judgment; flag emergencies clearly.`;

// Convert the chat history coming from the API into Gemini "contents".
const toContents = (messages = []) =>
  messages
    .filter((m) => m && (m.content || m.text))
    .map((m) => ({
      role: m.role === "assistant" || m.role === "model" ? "model" : "user",
      parts: [{ text: String(m.content ?? m.text) }],
    }));

const runAgent = async (messages) => {
  const contents = toContents(messages);

  if (contents.length === 0) {
    throw new Error("At least one user message is required.");
  }

  const config = {
    systemInstruction: SYSTEM_INSTRUCTION,
    temperature: 0.2,
    tools: [{ functionDeclarations }],
    // Disable extended thinking: this is a tool-routing assistant, not a deep
    // reasoner. Thinking mode intermittently emits empty thought-only turns
    // (no parts) with gemini-2.5-flash + tools; turning it off is more
    // reliable, faster, and cheaper for this workload.
    thinkingConfig: { thinkingBudget: 0 },
  };

  const toolsUsed = [];

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const response = await generateWithRetry({
      model: MODEL,
      contents,
      config,
    });

    const calls = response.functionCalls;

    if (!calls || calls.length === 0) {
      const reply =
        response.text ||
        "I couldn't produce a response for that. Could you rephrase or try again?";
      return { reply, toolsUsed };
    }

    // Record the model's tool-call turn verbatim so the next request keeps full
    // context. Pushing the original content preserves `thoughtSignature` parts,
    // which Gemini 2.5 thinking models require across function-calling turns.
    const modelContent = response.candidates?.[0]?.content;
    contents.push(
      modelContent || {
        role: "model",
        parts: calls.map((fc) => ({ functionCall: fc })),
      }
    );

    // Execute each requested tool and feed results back to the model.
    const responseParts = [];
    for (const fc of calls) {
      toolsUsed.push(fc.name);
      const impl = toolImplementations[fc.name];

      let result;
      try {
        if (!impl) throw new Error(`Unknown tool: ${fc.name}`);
        result = await impl(fc.args || {});
      } catch (err) {
        result = { error: err.message || String(err) };
      }

      responseParts.push({
        functionResponse: {
          name: fc.name,
          response: { result },
        },
      });
    }

    contents.push({ role: "user", parts: responseParts });
  }

  return {
    reply:
      "I wasn't able to complete that within the allowed number of steps. Could you narrow the request or try again?",
    toolsUsed,
  };
};

module.exports = { runAgent };
