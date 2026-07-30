import type { PipelineContext, ProviderResult, ProviderName } from "../types";
import type { APIProvider } from "../../types";

const OPENROUTER_FREE_MODELS = [
  "openrouter/free",
  "google/gemma-4-31b-it:free",
  "openai/gpt-oss-20b:free",
  "google/gemma-2-9b-it:free",
];

async function callGemini(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const activeModel = model?.trim() || "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${encodeURIComponent(apiKey.trim())}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      systemInstruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined,
    }),
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const msg = body?.error?.message || `HTTP ${response.status}`;
    if (response.status === 429 || msg.includes("quota") || msg.includes("RESOURCE_EXHAUSTED")) {
      throw new Error(`QUOTA: ${msg}`);
    }
    throw new Error(msg);
  }

  const text = body?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty response from Gemini");
  return text;
}

async function callGroq(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const activeModel = model?.trim() || "llama-3.3-70b-versatile";
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey.trim()}`,
    },
    body: JSON.stringify({
      model: activeModel,
      messages: [
        ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
        { role: "user", content: userPrompt },
      ],
      max_tokens: 2048,
    }),
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const msg = body?.error?.message || `HTTP ${response.status}`;
    if (response.status === 429) throw new Error(`QUOTA: ${msg}`);
    throw new Error(msg);
  }

  const text = body?.choices?.[0]?.message?.content;
  if (!text) throw new Error("Empty response from Groq");
  return text;
}

async function callOpenRouter(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  freeModelIndex = 0
): Promise<string> {
  const modelClean = model?.trim() || "";
  const activeModel =
    freeModelIndex > 0
      ? OPENROUTER_FREE_MODELS[freeModelIndex % OPENROUTER_FREE_MODELS.length]
      : !modelClean || modelClean === "auto-free" ? "openrouter/free" : modelClean;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey.trim()}`,
    },
    body: JSON.stringify({
      model: activeModel,
      messages: [
        ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
        { role: "user", content: userPrompt },
      ],
    }),
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const msg = body?.error?.message || `HTTP ${response.status}`;
    if (response.status === 429) throw new Error(`QUOTA: ${msg}`);
    if (freeModelIndex < OPENROUTER_FREE_MODELS.length - 1) {
      console.warn(`[PIE ProviderRouter] OpenRouter model ${activeModel} failed (${msg}), trying backup free model...`);
      return callOpenRouter(apiKey, model, systemPrompt, userPrompt, freeModelIndex + 1);
    }
    throw new Error(msg);
  }

  const text = body?.choices?.[0]?.message?.content;
  if (!text) throw new Error("Empty response from OpenRouter");
  return text;
}

export async function callProviderByName(
  provider: APIProvider,
  systemPrompt: string,
  userPrompt: string
): Promise<{ text: string; providerId: string; providerName: ProviderName; model: string; latencyMs: number }> {
  const start = Date.now();

  switch (provider.name) {
    case "Gemini": {
      const text = await callGemini(provider.apiKey, provider.model, systemPrompt, userPrompt);
      return {
        text,
        providerId: provider.id,
        providerName: "Gemini",
        model: provider.model || "gemini-2.5-flash",
        latencyMs: Date.now() - start,
      };
    }
    case "Groq": {
      const text = await callGroq(provider.apiKey, provider.model, systemPrompt, userPrompt);
      return {
        text,
        providerId: provider.id,
        providerName: "Groq",
        model: provider.model || "llama-3.3-70b-versatile",
        latencyMs: Date.now() - start,
      };
    }
    case "OpenRouter": {
      const text = await callOpenRouter(provider.apiKey, provider.model, systemPrompt, userPrompt);
      return {
        text,
        providerId: provider.id,
        providerName: "OpenRouter",
        model: provider.model || "openrouter/free",
        latencyMs: Date.now() - start,
      };
    }
    default:
      throw new Error(`Unknown provider: ${provider.name}`);
  }
}

export async function routeToProvider(providers: APIProvider[], systemPrompt: string, userPrompt: string): Promise<ProviderResult> {
  const active = providers
    .filter((p) => p.enabled && p.apiKey?.trim())
    .sort((a, b) => a.priority - b.priority);

  if (active.length === 0) {
    return {
      providerId: "none",
      providerName: "Gemini",
      model: "",
      rawText: "",
      latencyMs: 0,
      success: false,
      error: "ยังไม่ได้ตั้งค่า AI Provider กรุณาเพิ่ม API Key ในหน้า Manage AI",
    };
  }

  let lastError: Error = new Error("No providers available");

  for (const provider of active) {
    try {
      const result = await callProviderByName(provider, systemPrompt, userPrompt);
      provider.status = "ok";
      provider.lastUsedAt = Date.now();
      return {
        providerId: result.providerId,
        providerName: result.providerName,
        model: result.model,
        rawText: result.text,
        latencyMs: result.latencyMs,
        success: true,
      };
    } catch (err: any) {
      lastError = err;
      const msg = err?.message || "";
      if (msg.startsWith("QUOTA:")) {
        provider.status = "quota";
      } else {
        provider.status = "error";
      }
    }
  }

  return {
    providerId: "failed",
    providerName: "Gemini",
    model: "",
    rawText: "",
    latencyMs: 0,
    success: false,
    error: lastError?.message || "Unknown error",
  };
}

export async function runProviderRouter(ctx: PipelineContext): Promise<PipelineContext> {
  try {
    const result = await routeToProvider(ctx.providers, ctx.prompt.systemPrompt, ctx.prompt.userPrompt);
    return { ...ctx, providerResult: result };
  } catch (err: any) {
    return {
      ...ctx,
      providerResult: {
        providerId: "error",
        providerName: "Gemini",
        model: "",
        rawText: "",
        latencyMs: 0,
        success: false,
        error: err?.message ?? "Unknown error",
      },
      errors: [...ctx.errors, { layer: "provider_call", message: err?.message ?? "Unknown error", stack: err?.stack }],
    };
  }
}

export async function testProviderConnection(provider: APIProvider): Promise<{ success: boolean; message: string }> {
  try {
    const result = await callProviderByName(
      { ...provider, priority: 1, enabled: true },
      "",
      "Respond with the single word CONNECTED"
    );
    const ok = result.text.trim().toUpperCase().includes("CONNECTED");
    return {
      success: ok,
      message: ok ? `✅ ${provider.name} เชื่อมต่อสำเร็จ` : `⚠️ ${provider.name} ตอบกลับแต่ไม่ตรงตามคาด`,
    };
  } catch (err: any) {
    return { success: false, message: `❌ ${provider.name}: ${err.message}` };
  }
}
