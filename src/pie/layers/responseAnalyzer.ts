import type { PipelineContext, AnalyzedResponse, ExtractedFact } from "../types";

const ACTION_VERBS_TH = ["ทำ", "เริ่ม", "สร้าง", "จด", "ตั้ง", "วางแผน", "ติดตาม", "ลอง", "ปรับ", "แก้ไข"];
const ACTION_VERBS_EN = ["do", "start", "create", "write", "set", "plan", "track", "try", "fix", "improve", "build"];

function detectTone(text: string): string {
  const lower = text.toLowerCase();
  const scores: Record<string, number> = {
    กระตือรือร้น: 0,
    อบอุ่น: 0,
    รุนแรง: 0,
    มืออาชีพ: 0,
    สบายๆ: 0,
    ลึกซึ้ง: 0,
  };

  const warmThai = ["ค่ะ", "ครับ", "สู้ๆ", "เข้าใจ", "ดีใจ", "เห็นด้วย", "ยินดี"];
  const energetic = ["เริ่ม!", "ไปเลย", "ทำได้", "อย่าลืม", "ลอง", "action", "✅", "🎯", "💪", "🔥", "⚡"];
  const professional = ["สรุป", "วิเคราะห์", "แผนการ", "ขั้นตอน", "strategy", "framework", "ข้อพิจารณา"];
  const deep = ["ทะลุทะลาย", "ลึกซึ้ง", "คิดดู", "ทบทวน", "reflect", "insight", "meaning"];

  for (const w of warmThai) if (text.includes(w)) scores["อบอุ่น"] += 1;
  for (const w of energetic) if (lower.includes(w.toLowerCase())) scores["กระตือรือร้น"] += 1;
  for (const w of professional) if (lower.includes(w.toLowerCase())) scores["มืออาชีพ"] += 1;
  for (const w of deep) if (lower.includes(w.toLowerCase())) scores["ลึกซึ้ง"] += 1;

  const entries = Object.entries(scores).sort(([, a], [, b]) => b - a);
  if (entries[0][1] === 0) return "ทั่วไป";
  return entries[0][0];
}

function detectLengthCat(text: string): "short" | "medium" | "long" {
  const len = text.length;
  if (len < 200) return "short";
  if (len < 800) return "medium";
  return "long";
}

function containsActionable(text: string): boolean {
  const lower = text.toLowerCase();
  for (const v of [...ACTION_VERBS_TH, ...ACTION_VERBS_EN]) {
    if (lower.includes(v.toLowerCase())) return true;
  }
  if (/^\s*[\d]+\.\s/m.test(text)) return true;
  if (/[-•]\s+\S/.test(text)) return true;
  return false;
}

function containsQuestion(text: string): boolean {
  if (text.includes("?") || text.includes("？")) return true;
  const thaiQ = ["ไหม", "มั้ย", "หรือ", "อะไร", "ไหน", "เมื่อไหร่", "ทำไม", "ยังไง"];
  return thaiQ.some((q) => text.includes(q));
}

function extractFactsFromText(text: string): ExtractedFact[] {
  const facts: ExtractedFact[] = [];

  const boldPattern = /\*\*(.+?)\*\*/g;
  let match;
  while ((match = boldPattern.exec(text)) !== null) {
    if (match[1].length > 3 && match[1].length < 200) {
      facts.push({
        fact: match[1].trim(),
        confidence: 0.8,
      });
    }
  }

  const bulletLines = text.split(/\r?\n/).filter((l) => /^\s*(?:[-•*]|\d+\.)\s+/.test(l));
  for (const line of bulletLines.slice(0, 10)) {
    const clean = line.replace(/^\s*(?:[-•*]|\d+\.)\s+/, "").trim();
    if (clean.length > 5 && clean.length < 300) {
      facts.push({
        fact: clean,
        confidence: 0.7,
      });
    }
  }

  return facts.slice(0, 15);
}

function detectSuggestedMemories(text: string): AnalyzedResponse["suggestedMemories"] {
  const suggested: AnalyzedResponse["suggestedMemories"] = [];

  const patterns = [
    /บันทึก(?:ลง Brain)?[:：]\s*(.+?)(?:\n|$)/i,
    /เราควร(?:ที่จะ)?จด(?:ไว้)?[:：]\s*(.+?)(?:\n|$)/i,
    /Remember to[:：]\s*(.+?)(?:\n|$)/i,
    /Key (?:insight|takeaway|lesson)[:：]?\s*(.+?)(?:\n|$)/i,
  ];

  for (const p of patterns) {
    const m = text.match(p);
    if (m && m[1] && m[1].trim().length > 5) {
      suggested.push({
        title: m[1].trim().slice(0, 60),
        content: m[1].trim(),
        reasoning: "Pattern matched in AI response",
        confidence: 0.65,
      });
    }
  }

  return suggested.slice(0, 5);
}

function computeConfidence(ctx: PipelineContext): number {
  const base = ctx.providerResult.success ? 0.7 : 0.2;
  const rank = ctx.rankedMemory.sources.length;
  const memoryBonus = Math.min(0.15, rank * 0.02);
  const latency = ctx.providerResult.latencyMs;
  const latencyPenalty = latency > 15000 ? 0.05 : latency > 8000 ? 0.02 : 0;
  const errorPenalty = ctx.errors.length * 0.03;
  return Math.max(0.1, Math.min(0.98, base + memoryBonus - latencyPenalty - errorPenalty));
}

export function analyzeResponse(ctx: PipelineContext): AnalyzedResponse {
  const text = ctx.providerResult.success ? ctx.providerResult.rawText : "";

  return {
    rawText: text,
    metadata: {
      tone: detectTone(text),
      lengthCategory: detectLengthCat(text),
      containsActionable: containsActionable(text),
      containsQuestion: containsQuestion(text),
    },
    confidence: computeConfidence(ctx),
    extractedFacts: extractFactsFromText(text),
    suggestedMemories: detectSuggestedMemories(text),
  };
}

export function runResponseAnalyzer(ctx: PipelineContext): PipelineContext {
  try {
    const analysis = analyzeResponse(ctx);
    return { ...ctx, analysis };
  } catch (err: any) {
    return {
      ...ctx,
      analysis: {
        rawText: ctx.providerResult.rawText,
        metadata: { tone: "ทั่วไป", lengthCategory: "medium", containsActionable: false, containsQuestion: false },
        confidence: 0.3,
        extractedFacts: [],
        suggestedMemories: [],
      },
      errors: [...ctx.errors, { layer: "analysis", message: err?.message ?? "Unknown error", stack: err?.stack }],
    };
  }
}
