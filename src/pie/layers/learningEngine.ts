import type { PipelineContext, LearnResult, PipelineOptions } from "../types";
import { resolveRepository } from "../pipeline";

interface LearningOptions {
  autoApply?: boolean;
  minConfidence?: number;
  maxItemsToPersist?: number;
}

function shouldPersistFact(confidence: number, minConf: number, context: PipelineContext): boolean {
  if (confidence < minConf) return false;
  if (context.intent.messageType === "greeting") return false;
  if (!context.intent.requiresContext && confidence < 0.85) return false;
  return true;
}

export function decideLearning(ctx: PipelineContext, options: LearningOptions = {}): LearnResult {
  const opts: Required<LearningOptions> = {
    autoApply: false,
    minConfidence: 0.7,
    maxItemsToPersist: 3,
    ...options,
  };

  const items: LearnResult["itemsToPersist"] = [];

  for (const sug of ctx.analysis.suggestedMemories) {
    if (!shouldPersistFact(sug.confidence, opts.minConfidence, ctx)) continue;
    if (items.length >= opts.maxItemsToPersist) break;
    items.push({
      kind: "brain_card",
      payload: {
        title: sug.title,
        description: sug.content,
        dimension: ctx.intent.detectedDimensions[0] ?? "mindset",
        brainType: ctx.intent.detectedBrainTypes[0] ?? "Knowledge",
        tags: ctx.intent.keywords.slice(0, 5),
        confidence: sug.confidence,
      },
      reason: sug.reasoning || "Suggested by AI response pattern",
      confidence: sug.confidence,
    });
  }

  const relevantFacts = ctx.analysis.extractedFacts.filter((f) => f.confidence >= opts.minConfidence);
  for (const fact of relevantFacts) {
    if (items.length >= opts.maxItemsToPersist) break;
    if (items.some((i) => String(i.payload.title).toLowerCase() === fact.fact.toLowerCase().slice(0, 60))) continue;
    items.push({
      kind: "brain_card",
      payload: {
        title: fact.fact.slice(0, 80),
        description: fact.fact,
        dimension: fact.suggestedDimension ?? ctx.intent.detectedDimensions[0] ?? "mindset",
        brainType: fact.suggestedBrainType ?? ctx.intent.detectedBrainTypes[0] ?? "Knowledge",
        tags: fact.suggestedTag ? [fact.suggestedTag] : ctx.intent.keywords.slice(0, 3),
        confidence: fact.confidence,
      },
      reason: "Extracted from AI response content",
      confidence: fact.confidence,
    });
  }

  const shouldPersist = items.length > 0;

  return {
    shouldPersist,
    itemsToPersist: items.slice(0, opts.maxItemsToPersist),
    applied: opts.autoApply && shouldPersist ? false : false,
  };
}

export function runLearningEngine(
  ctx: PipelineContext,
  options?: PipelineOptions
): PipelineContext {
  try {
    const learnResult = decideLearning(ctx, {
      autoApply: false,
      minConfidence: 0.72,
      maxItemsToPersist: 3,
    });

    if (learnResult.shouldPersist && learnResult.itemsToPersist.length > 0 && options) {
      const repo = resolveRepository(options);
      try {
        repo.savePendingLearning(learnResult.itemsToPersist);
      } catch (e) {
        // non-fatal: persistence failure should not break AI response
      }
    }

    return { ...ctx, learnResult };
  } catch (err: any) {
    return {
      ...ctx,
      learnResult: { shouldPersist: false, itemsToPersist: [], applied: false },
      errors: [...ctx.errors, { layer: "learning", message: err?.message ?? "Unknown error", stack: err?.stack }],
    };
  }
}
