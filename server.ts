import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Helper to get Gemini Client with fallback
function getGeminiClient(customApiKey?: string) {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health Check API
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Test Connection Endpoint
app.post("/api/ai/test-connection", async (req, res) => {
  try {
    const { apiKey, model = "gemini-3.6-flash" } = req.body || {};
    const ai = getGeminiClient(apiKey);
    const response = await ai.models.generateContent({
      model: model || "gemini-3.6-flash",
      contents: "Respond with the single word 'CONNECTED' to confirm the connection.",
    });
    res.json({ success: true, response: response.text });
  } catch (err: any) {
    console.error("Test connection error:", err);
    res.status(400).json({ success: false, error: err.message || "Failed to connect to AI Provider." });
  }
});

// AI Chat Endpoint with mode system instructions and local context
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { prompt, mode = "Life Coach", userContext, customApiKey, model = "gemini-3.6-flash" } = req.body;
    const ai = getGeminiClient(customApiKey);

    const modePrompts: Record<string, string> = {
      "Therapist": "You are a empathetic, compassionate, CBT-focused AI Therapist for 'My Life OS'. Help the user process emotions, reframe negative thoughts, and maintain mental clarity. Be gentle, warm, and non-judgmental.",
      "Life Coach": "You are a high-agency, insightful, empowering AI Life Coach for 'My Life OS'. Guide the user to turn their life goals into small 15-minute actionable pebbles. Help them focus on who they are becoming.",
      "Goal Coach": "You are a strategic, performance-driven Goal Coach. Help the user break down complex milestones, establish clear deadlines, prioritize, and stay accountable.",
      "Decision Helper": "You are an objective Decision Matrix Helper. Analyze pros, cons, long-term impact on the user's 5-year future self, and help them gain crisp clarity.",
      "Weekly Reflection": "You are a thoughtful Weekly Reflection Companion. Synthesize the user's habits, gratitude notes, and progress over the past week into deep life insights.",
      "Monthly Reflection": "You are a big-picture Monthly Review Coach. Highlight momentum, identity changes, character status growth, and trajectory adjustments.",
      "Future Self": "You speak from the perspective of the user's Future Self (5 years from now)—wise, fulfilled, proud, and gently encouraging them to take today's small steps.",
      "General Chat": "You are the central AI Companion of 'My Life OS', a personalized Life Operating System. You speak with high agency, clarity, warmth, and supportive energy.",
    };

    const systemInstruction = `${modePrompts[mode] || modePrompts["Life Coach"]}
Respond in the language the user speaks in (default to Thai if prompt/context is in Thai).
Always speak concisely, thoughtfully, and with actionable wisdom.
If user context is provided below, use it seamlessly to offer deeply tailored guidance:
${userContext ? JSON.stringify(userContext) : "No context provided."}`;

    const response = await ai.models.generateContent({
      model: model || "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text });
  } catch (err: any) {
    console.error("AI Chat error:", err);
    res.status(500).json({ error: err.message || "An error occurred while communicating with AI." });
  }
});

// AI Reflection Endpoint
app.post("/api/ai/reflect", async (req, res) => {
  try {
    const { entries, characterStats, customApiKey, model = "gemini-3.6-flash" } = req.body;
    const ai = getGeminiClient(customApiKey);

    const prompt = `Analyze these recent user entries and character stats from 'My Life OS' and generate a 2-3 sentence personalized life insight with actionable advice.
Entries & Stats:
${JSON.stringify({ entries, characterStats })}

Return output in Thai language matching this tone:
"คุณ Productive มากขึ้น 38% หลังออกกำลังกายในช่วงเช้า... สิ่งที่ควรทำ: ..."`;

    const response = await ai.models.generateContent({
      model: model || "gemini-3.6-flash",
      contents: prompt,
    });

    res.json({ insight: response.text });
  } catch (err: any) {
    console.error("AI Reflect error:", err);
    res.status(500).json({ error: err.message || "Failed to generate reflection." });
  }
});

// Vite Middleware & Production Setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
