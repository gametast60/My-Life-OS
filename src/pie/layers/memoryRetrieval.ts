import type { PipelineContext, PipelineOptions, RetrievedMemory, RetrievalSource } from "../types";
import { resolveRepository } from "../pipeline";
import type { RequestContextOverride } from "../repository/BrainRepository";
import { RoomBrainIntelligenceRepository } from "../bie/RoomBrainIntelligenceRepository";
import type { IdentityRow, Insight, TimelineItem } from "../bie/types";

interface RetrievalContext {
  maxSources?: number;
}

/** Max confirmed insights injected into PIE context per retrieval pass. */
const MAX_APPLIED_INSIGHTS = 5;

/** Max timeline buckets injected into PIE context per retrieval pass. */
const MAX_TIMELINE_ITEMS = 3;

/** Ranking boost via rawRef.hits — ensures BIE context surfaces in prompt block. */
const BIE_CONTEXT_HIT_BOOST = 10;

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

function formatTopLabels(entries: { label: string; confidence: number }[], limit = 3): string {
  if (entries.length === 0) return "";
  return entries
    .slice(0, limit)
    .map((e) => `${e.label} (${Math.round(e.confidence * 100)}%)`)
    .join(", ");
}

function formatIdentitySummary(profile: IdentityRow): string {
  const parts: string[] = [];
  if (profile.summary?.trim()) {
    parts.push(profile.summary.trim());
  }
  const coreValues = formatTopLabels(profile.coreValues);
  if (coreValues) parts.push(`คุณค่าหลัก: ${coreValues}`);
  const goals = formatTopLabels(profile.goals);
  if (goals) parts.push(`เป้าหมาย: ${goals}`);
  const strengths = formatTopLabels(profile.strengths, 2);
  if (strengths) parts.push(`จุดแข็ง: ${strengths}`);
  return parts.join(" | ");
}

function formatTimelineItem(item: TimelineItem): string {
  const themes = item.themeBreakdown
    .slice(0, 3)
    .map((t) => `${t.dimension} ${t.percent}%`)
    .join(", ");
  const milestoneLabels = item.milestones
    .slice(0, 2)
    .map((m) => m.label)
    .join("; ");
  const parts: string[] = [];
  if (themes) parts.push(`ธีม: ${themes}`);
  if (milestoneLabels) parts.push(`ไฮไลท์: ${milestoneLabels}`);
  return parts.join(" | ") || `ช่วง ${item.periodKey}`;
}

function buildIdentitySource(profile: IdentityRow): RetrievalSource {
  return {
    kind: "bie_identity_summary",
    id: "bie-identity-singleton",
    title: "[Identity Profile — ยืนยันแล้ว]",
    content: formatIdentitySummary(profile),
    dimension: "identity",
    timestamp: profile.generatedAt,
    tags: ["bie", "identity", "confirmed"],
    rawRef: { hits: BIE_CONTEXT_HIT_BOOST, bieContext: "identity" },
  };
}

function buildInsightSource(insight: Insight): RetrievalSource {
  return {
    kind: "bie_insight",
    id: `bie-insight-${insight.id}`,
    title: `[Insight — ${insight.kind}] ${insight.title}`,
    content: insight.description,
    timestamp: insight.generatedAt,
    tags: ["bie", "insight", "confirmed", insight.kind],
    rawRef: { hits: BIE_CONTEXT_HIT_BOOST - 2, bieContext: "insight" },
  };
}

function buildTimelineSource(item: TimelineItem): RetrievalSource {
  return {
    kind: "bie_timeline",
    id: `bie-timeline-${item.periodKey}`,
    title: `[Timeline ${item.periodKey}]`,
    content: formatTimelineItem(item),
    timestamp: item.generatedAt,
    tags: ["bie", "timeline", item.periodKind],
    rawRef: { hits: BIE_CONTEXT_HIT_BOOST - 4, bieContext: "timeline" },
  };
}

/**
 * Phase 4D S28 — enrich retrieved memory with user-confirmed BIE context.
 *
 * P4-12 HITL: only `applied: true` identity rows and insights are injected.
 * Timeline cache is rebuildable (not HITL-gated) and included when available.
 * P4-14 Disable Switch: returns sources unchanged when `bieEnabled === false`.
 */
function enrichWithBieContext(
  sources: RetrievalSource[],
  bieEnabled: boolean
): Pick<RetrievedMemory, "sources" | "bieEnrichment"> {
  if (bieEnabled === false) {
    return { sources };
  }

  try {
    const bieRepo = new RoomBrainIntelligenceRepository();
    const bieSources: RetrievalSource[] = [];

    const identityRow = bieRepo.getIdentityProfile();
    const identityApplied = identityRow?.applied === true;
    if (identityApplied && identityRow) {
      const summaryText = formatIdentitySummary(identityRow);
      if (summaryText.trim()) {
        bieSources.push(buildIdentitySource(identityRow));
      }
    }

    const appliedInsights = bieRepo.getInsights({ appliedOnly: true }).slice(0, MAX_APPLIED_INSIGHTS);
    for (const insight of appliedInsights) {
      bieSources.push(buildInsightSource(insight));
    }

    const timelineItems = bieRepo
      .getTimelineItems()
      .sort((a, b) => b.periodKey.localeCompare(a.periodKey))
      .slice(0, MAX_TIMELINE_ITEMS);
    for (const item of timelineItems) {
      bieSources.push(buildTimelineSource(item));
    }

    if (bieSources.length === 0) {
      return { sources };
    }

    return {
      sources: [...bieSources, ...sources],
      bieEnrichment: {
        identityApplied,
        insightCount: appliedInsights.length,
        timelineCount: timelineItems.length,
      },
    };
  } catch {
    return { sources };
  }
}

export async function retrieveMemory(
  ctx: PipelineContext,
  options: RetrievalContext = {},
  pipelineOptions?: PipelineOptions
): Promise<RetrievedMemory> {
  const maxSources = options.maxSources ?? pipelineOptions?.maxRetrievalSources ?? 30;

  if (!ctx.intent.requiresContext) {
    return {
      sources: [],
      queryFragments: ctx.intent.keywords.slice(0, 10),
    };
  }

  const repo = resolveRepository(pipelineOptions ?? {});
  const requestContext = extractRequestContext(ctx);

  const repoSourcesResult = repo.getRelevantMemory({
    keywords: ctx.intent.keywords,
    detectedDimensions: ctx.intent.detectedDimensions,
    detectedBrainTypes: ctx.intent.detectedBrainTypes,
    allowedDimensions: ctx.role.allowedDimensions,
    allowedBrainTypes: ctx.role.allowedBrainTypes,
    maxSources,
    requestContext,
    bieEnabled: ctx.options.bieEnabled,
  });

  const repoSources = repoSourcesResult instanceof Promise
    ? await repoSourcesResult
    : repoSourcesResult;

  const enriched = enrichWithBieContext(repoSources, ctx.options.bieEnabled);

  return {
    sources: enriched.sources,
    queryFragments: ctx.intent.keywords.slice(0, 10),
    ...(enriched.bieEnrichment ? { bieEnrichment: enriched.bieEnrichment } : {}),
  };
}

export async function runMemoryRetrieval(
  ctx: PipelineContext,
  options?: PipelineOptions
): Promise<PipelineContext> {
  try {
    const retrievedMemory = await retrieveMemory(ctx, {}, options);
    return { ...ctx, retrievedMemory };
  } catch (err: any) {
    return {
      ...ctx,
      retrievedMemory: { sources: [], queryFragments: [] },
      errors: [...ctx.errors, { layer: "retrieval", message: err?.message ?? "Unknown error", stack: err?.stack }],
    };
  }
}
