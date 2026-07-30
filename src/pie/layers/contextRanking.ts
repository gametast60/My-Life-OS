import type { PipelineContext, RankedMemory, RetrievalSource, PipelineOptions } from "../types";
import type { LifeDimension, BrainType } from "../../types";

interface RankingOptions {
  maxSources?: number;
  relevanceWeight?: number;
  recencyWeight?: number;
  confidenceWeight?: number;
  dimensionPriorityBoost?: number;
  goalPriorityBoost?: number;
}

function computeRelevanceScore(ctx: PipelineContext, src: RetrievalSource): number {
  const intent = ctx.intent;
  if (intent.keywords.length === 0 && intent.detectedDimensions.length === 0 && intent.detectedBrainTypes.length === 0) {
    return 0.4;
  }

  let score = 0;
  const hitsFromRef = (src.rawRef as { hits?: number })?.hits ?? 0;
  if (hitsFromRef > 0) {
    score = Math.min(1, hitsFromRef * 0.2);
  }

  if (intent.detectedDimensions.length > 0 && src.dimension) {
    if (intent.detectedDimensions.includes(src.dimension as LifeDimension)) {
      score += 0.2;
    }
  }

  if (intent.detectedBrainTypes.length > 0 && src.brainType) {
    if (intent.detectedBrainTypes.includes(src.brainType as BrainType)) {
      score += 0.2;
    }
  }

  const priorityDims = ctx.role.contextPriority;
  if (priorityDims.length > 0 && src.dimension) {
    const idx = priorityDims.indexOf(src.dimension as LifeDimension);
    if (idx >= 0) {
      score += (priorityDims.length - idx) * 0.03;
    }
  }

  const lowerContent = `${src.title} ${src.content}`.toLowerCase();
  for (const kw of intent.keywords) {
    if (lowerContent.includes(kw.toLowerCase())) {
      score += 0.05;
    }
  }

  return Math.min(1, score);
}

function computeRecencyScore(src: RetrievalSource): number {
  if (!src.timestamp) return 0.3;
  const now = Date.now();
  const diffDays = (now - src.timestamp) / (1000 * 60 * 60 * 24);

  if (diffDays <= 1) return 1.0;
  if (diffDays <= 7) return 0.9 - ((diffDays - 1) / 6) * 0.2;
  if (diffDays <= 30) return 0.7 - ((diffDays - 7) / 23) * 0.2;
  if (diffDays <= 90) return 0.5 - ((diffDays - 30) / 60) * 0.2;
  if (diffDays <= 365) return 0.3 - ((diffDays - 90) / 275) * 0.15;
  return 0.1;
}

function computeConfidenceScore(src: RetrievalSource): number {
  switch (src.kind) {
    case "brain_card_legacy":
      return 0.85;
    case "journal":
      return 0.9;
    case "brain_tree_tag":
      return 0.95;
    case "brain_tree_dimension":
      return 0.8;
    case "brain_tree_type":
      return 0.7;
    default:
      return 0.5;
  }
}

export function rankContext(ctx: PipelineContext, options: RankingOptions = {}): RankedMemory {
  const opts: Required<RankingOptions> = {
    maxSources: 10,
    relevanceWeight: 0.5,
    recencyWeight: 0.25,
    confidenceWeight: 0.25,
    dimensionPriorityBoost: 0.1,
    goalPriorityBoost: 0.05,
    ...options,
  };

  const role = ctx.role;
  const memoryWeight = role.memoryWeight;
  const goalWeight = role.goalWeight;

  const scored = ctx.retrievedMemory.sources.map((src) => {
    const relevance = computeRelevanceScore(ctx, src);
    const recency = computeRecencyScore(src);
    const confidence = computeConfidenceScore(src);

    let base =
      relevance * opts.relevanceWeight +
      recency * opts.recencyWeight +
      confidence * opts.confidenceWeight;

    base = base * (0.4 + memoryWeight * 0.3 + goalWeight * 0.3);

    const hits = (src.rawRef as { hits?: number })?.hits ?? 0;
    if (hits > 0 && relevance < 0.5) {
      base = Math.max(base, Math.min(1, hits * 0.1 + 0.3));
    }

    const totalScore = Math.min(1, base);

    return {
      ...src,
      relevance,
      confidence,
      recency,
      totalScore,
    };
  });

  scored.sort((a, b) => b.totalScore - a.totalScore);

  const ranked = scored.slice(0, opts.maxSources);

  const topRelevancePct =
    scored.length > 0 && scored[0].totalScore > 0
      ? Math.round(ranked.filter((s) => s.totalScore >= scored[0].totalScore * 0.7).length / scored.length * 100)
      : 0;

  return {
    sources: ranked,
    topRelevancePct,
  };
}

export function runContextRanking(
  ctx: PipelineContext,
  options?: PipelineOptions
): PipelineContext {
  try {
    const rankedMemory = rankContext(ctx, {
      maxSources: options?.maxRankedSources ?? 10,
    });
    return { ...ctx, rankedMemory };
  } catch (err: any) {
    return {
      ...ctx,
      rankedMemory: { sources: [], topRelevancePct: 0 },
      errors: [...ctx.errors, { layer: "ranking", message: err?.message ?? "Unknown error", stack: err?.stack }],
    };
  }
}
