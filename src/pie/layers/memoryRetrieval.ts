import type { PipelineContext, PipelineOptions, RetrievedMemory } from "../types";
import { resolveRepository } from "../pipeline";
import type { RequestContextOverride } from "../repository/BrainRepository";

interface RetrievalContext {
  maxSources?: number;
}

function extractRequestContext(ctx: PipelineContext): RequestContextOverride | undefined {
  const extra = ctx.request.extraContext;
  if (!extra) return undefined;
  if (!extra.brainCards && !extra.recentJournals && !extra.brainTree) return undefined;
  return {
    brainCards: extra.brainCards,
    recentJournals: extra.recentJournals,
    brainTree: extra.brainTree,
  };
}

export function retrieveMemory(
  ctx: PipelineContext,
  options: RetrievalContext = {},
  pipelineOptions?: PipelineOptions
): RetrievedMemory {
  const maxSources = options.maxSources ?? pipelineOptions?.maxRetrievalSources ?? 30;

  if (!ctx.intent.requiresContext) {
    return {
      sources: [],
      queryFragments: ctx.intent.keywords.slice(0, 10),
    };
  }

  const repo = resolveRepository(pipelineOptions ?? {});
  const requestContext = extractRequestContext(ctx);

  const repoSources = repo.getRelevantMemory({
    keywords: ctx.intent.keywords,
    detectedDimensions: ctx.intent.detectedDimensions,
    detectedBrainTypes: ctx.intent.detectedBrainTypes,
    allowedDimensions: ctx.role.allowedDimensions,
    allowedBrainTypes: ctx.role.allowedBrainTypes,
    maxSources,
    requestContext,
  });

  return {
    sources: repoSources,
    queryFragments: ctx.intent.keywords.slice(0, 10),
  };
}

export function runMemoryRetrieval(
  ctx: PipelineContext,
  options?: PipelineOptions
): PipelineContext {
  try {
    const retrievedMemory = retrieveMemory(ctx, {}, options);
    return { ...ctx, retrievedMemory };
  } catch (err: any) {
    return {
      ...ctx,
      retrievedMemory: { sources: [], queryFragments: [] },
      errors: [...ctx.errors, { layer: "retrieval", message: err?.message ?? "Unknown error", stack: err?.stack }],
    };
  }
}
