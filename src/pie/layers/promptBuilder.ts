import type { PipelineContext, BuiltPrompt } from "../types";
import { LIFE_DIMENSIONS } from "../../types";
import type { LifeDimension } from "../../types";

interface BuildOptions {
  maxContextItems?: number;
  maxContextChars?: number;
}

function dimLabel(id?: LifeDimension): string {
  if (!id) return "";
  return LIFE_DIMENSIONS.find((d) => d.id === id)?.label ?? id;
}

function formatRankedSource(src: {
  kind: string;
  title: string;
  content: string;
  dimension?: LifeDimension;
  brainType?: string;
  tags: string[];
  totalScore: number;
}): string {
  const dl = dimLabel(src.dimension);
  const dimStr = dl ? `[${dl}]` : "";
  const typeStr = src.brainType ? `${src.brainType}|` : "";
  const tagsStr = src.tags.length > 0 ? " #" + src.tags.join(" #") : "";
  const content = src.content ? ` — ${src.content.slice(0, 120)}` : "";
  return `${typeStr}${dimStr}${src.title}${content}${tagsStr}`;
}

function buildSystemPrompt(ctx: PipelineContext): string {
  const role = ctx.role;
  const extraSys = ctx.request.extraContext?.customSystemPrompt;
  if (extraSys) return extraSys;

  const strategyNote: Record<string, string> = {
    concise: "ตอบกระชับ ไม่ยาวเกินไป",
    detailed: "ตอบละเอียด มีรายละเอียดเพียงพอ",
    socratic: "ใช้คำถามนำทาง ผู้ใช้ค้นพบคำตอบเอง",
    reflective: "ตอบแบบทบทวน ลึกซึ้ง สะท้อนความรู้สึกของผู้ใช้",
  };

  const parts: string[] = [role.persona];
  parts.push(`Tone: ${role.tone}`);
  if (strategyNote[role.promptStrategy]) {
    parts.push(`Prompt Strategy: ${strategyNote[role.promptStrategy]}`);
  }
  parts.push("ตอบภาษาไทย");
  return parts.join("\n");
}

function buildContextBlock(ctx: PipelineContext, opts: BuildOptions): { text: string; usedCount: number } {
  const maxItems = opts.maxContextItems ?? 8;
  const maxChars = opts.maxContextChars ?? 2800;

  const srcs = ctx.rankedMemory.sources;
  if (srcs.length === 0) return { text: "", usedCount: 0 };

  const lines: string[] = [];
  let totalChars = 0;
  let used = 0;

  for (const s of srcs.slice(0, maxItems)) {
    const line = formatRankedSource(s);
    if (totalChars + line.length > maxChars) break;
    lines.push(line);
    totalChars += line.length;
    used += 1;
  }

  if (lines.length === 0) return { text: "", usedCount: 0 };

  return {
    text: `[BRAIN CONTEXT]\n${lines.join("\n")}\n[/BRAIN CONTEXT]`,
    usedCount: used,
  };
}

function buildJournalBlock(ctx: PipelineContext, maxChars: number): string {
  const journals = ctx.request.extraContext?.recentJournals ?? [];
  if (journals.length === 0) return "";

  const lines: string[] = [];
  let total = 0;
  for (const j of journals.slice(0, 3)) {
    const snippet = j.content.slice(0, 80);
    const line = `[Journal ${j.date}] (${j.mood}) ${j.title ? j.title + ": " : ""}${snippet}`;
    if (total + line.length > maxChars) break;
    lines.push(line);
    total += line.length;
  }
  if (lines.length === 0) return "";
  return `[RECENT JOURNALS]\n${lines.join("\n")}\n[/RECENT JOURNALS]`;
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export function buildPrompt(ctx: PipelineContext, options: BuildOptions = {}): BuiltPrompt {
  const opts: Required<BuildOptions> = {
    maxContextItems: 8,
    maxContextChars: 2800,
    ...options,
  };

  const systemPrompt = buildSystemPrompt(ctx);
  const { text: contextBlock, usedCount } = buildContextBlock(ctx, opts);

  const userParts: string[] = [];

  const prefix = ctx.request.extraContext?.customUserPrefix;
  if (prefix) userParts.push(prefix);

  if (contextBlock) userParts.push(contextBlock);

  const journalBlock = buildJournalBlock(ctx, 900);
  if (journalBlock) userParts.push(journalBlock);

  if (ctx.intent.keywords.length > 0 && ctx.rankedMemory.sources.length === 0) {
    // Note to AI: no matching context
  }

  userParts.push(`[ข้อความของผู้ใช้]: ${ctx.request.userInput}`);

  const suffix = ctx.request.extraContext?.customUserSuffix;
  if (suffix) userParts.push(suffix);

  if (ctx.request.extraContext?.outputFormat === "json") {
    userParts.push("[คำสั่งพิเศษ]: ตอบเป็น JSON เท่านั้น ไม่มีข้อความอื่นๆ");
  }

  const userPrompt = userParts.join("\n\n");
  const contextTokenEstimate = estimateTokens(systemPrompt) + estimateTokens(userPrompt);

  return {
    systemPrompt,
    userPrompt,
    contextTokenEstimate,
    usedMemoryCount: usedCount,
  };
}

export function runPromptBuilder(ctx: PipelineContext): PipelineContext {
  try {
    const prompt = buildPrompt(ctx);
    return { ...ctx, prompt };
  } catch (err: any) {
    return {
      ...ctx,
      prompt: { systemPrompt: "", userPrompt: ctx.request.userInput, contextTokenEstimate: 0, usedMemoryCount: 0 },
      errors: [...ctx.errors, { layer: "prompt_build", message: err?.message ?? "Unknown error", stack: err?.stack }],
    };
  }
}
