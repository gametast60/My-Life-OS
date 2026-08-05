// ─────────────────────────────────────────────────────────────────────
// BIE — Orchestrator (Phase 5 Hotfix: Trigger Gap Fix)
// ─────────────────────────────────────────────────────────────────────
//
// Provides a single entry point to run the full BIE analysis pipeline:
//   1. Identity Engine → proposeIdentityUpdate
//   2. Insight Generator → proposeInsightProposal (loop)
//   3. Timeline Builder → saveTimelineItem
//   4. Relationship Extractor → routeProposalsToPendingQueue
//   5. Background Reflection Cycle
//
// All proposals carry `applied: false` (P4-12 HITL invariant).
// Wrapped in non-fatal try/catch (P4-11 pattern — errors don't propagate).
// ─────────────────────────────────────────────────────────────────────

import type {
  BrainEvidence,
  BrainTreeDimension,
  BrainTreeTag,
  LifeDimension,
} from "../../types";
import { DefaultIdentityEngine } from "./identity/identityEngine";
import type { IdentityBuildContext, IdentityProfile } from "./identity";
import { DefaultInsightGenerator } from "./identity/insightGenerator";
import type { InsightGeneratorContext, InsightItem } from "./identity";
import { DefaultTimelineBuilder } from "./identity/timelineBuilder";
import type { TimelineBuilderContext, TimelineEntry, TimelineGranularity } from "./identity";
import { extractRelationshipCandidates, routeProposalsToPendingQueue } from "./graph/relationshipExtractor";
import type { BIEGraphNode, GraphEdgeProposal } from "./graph/types";
import { runBackgroundReflectionCycle } from "./reflection/reflectorEngine";
import type { ReflectionCycleOptions } from "./reflection/reflectorEngine";
import type { BrainIntelligenceRepository } from "./BrainIntelligenceRepository";
import type { PendingLearning } from "./types";
import type { InsightType } from "./identity";
import type { JournalMemoryResolver } from "./journalMemoryResolver";

/** Map InsightType (identity layer) to InsightKind (legacy S1 interface). */
function mapInsightTypeToKind(type: InsightType): import("./types").InsightKind {
  switch (type) {
    case "reflection":
    case "pattern":
    case "milestone":
    case "gap":
    case "conflict":
    case "prediction":
      return type as import("./types").InsightKind;
    default:
      return "pattern";
  }
}

/** Context object for the full BIE analysis orchestrator. */
export interface BieOrchestratorContext {
  /** All evidence records available (Brain Tree / Journal sources). */
  evidences: BrainEvidence[];
  /** All Brain Tree tags. */
  tags: BrainTreeTag[];
  /** All Brain Tree dimensions. */
  dimensions: BrainTreeDimension[];
  /** Graph nodes for relationship extraction. */
  graphNodes: BIEGraphNode[];
  /** BIE repository for persisting proposals to pending queue. */
  bieRepo: BrainIntelligenceRepository;
  /** Current Unix ms timestamp. Defaults to Date.now(). */
  nowMs?: number;
  /** Max insights to generate. Defaults to 20. */
  maxInsights?: number;
  /** Timeline granularities to build. Defaults to ["month", "quarter", "year"]. */
  timelineGranularities?: TimelineGranularity[];
  /**
   * Architect Fix 1: read-only resolver from BrainEvidence.sourceId to the
   * original JournalEntry (canonical memory). Optional and additive —
   * existing engines (identityEngine/insightGenerator/etc.) are NOT
   * modified and keep reasoning from `evidences` exactly as before. When
   * provided, it is echoed back on the result so BIE-boundary consumers
   * (e.g. a HITL review surface) can resolve full Journal memory for a
   * given proposal's evidence on demand, without Journal being duplicated
   * into BIE storage.
   */
  resolveJournalMemory?: JournalMemoryResolver;
}

/** Result of the orchestrator run. */
export interface BieOrchestratorResult {
  identityProposed: boolean;
  insightsProposed: number;
  timelineBucketsSaved: number;
  relationshipsProposed: number;
  reflectionCycleResult: Awaited<ReturnType<typeof runBackgroundReflectionCycle>>;
  executedAt: number;
  /** Present iff a resolver was supplied in context (Architect Fix 1). */
  resolveJournalMemory?: JournalMemoryResolver;
}

/**
 * Run the full BIE analysis pipeline.
 *
 * Pipeline steps (all non-fatal, errors logged but don't throw):
 * 1. Identity Engine: buildProfile → proposeIdentityUpdate
 * 2. Insight Generator: generateInsights → proposeInsightProposal (each)
 * 3. Timeline Builder: buildTimeline (per granularity) → saveTimelineItem
 * 4. Relationship Extractor: extractRelationshipCandidates → routeProposalsToPendingQueue
 * 5. Background Reflection Cycle
 *
 * HITL Invariant (P4-12): All proposals carry `applied: false`.
 * Non-fatal pattern (P4-11): Errors caught and logged, execution continues.
 */
export async function runBieAnalysisOrchestrator(
  ctx: BieOrchestratorContext
): Promise<BieOrchestratorResult> {
  const {
    evidences,
    tags,
    dimensions,
    graphNodes,
    bieRepo,
    nowMs = Date.now(),
    maxInsights = 20,
    timelineGranularities = ["month", "quarter", "year"],
    resolveJournalMemory,
  } = ctx;

  let identityProposed = false;
  let insightsProposed = 0;
  let timelineBucketsSaved = 0;
  let relationshipsProposed = 0;

  // ── 1. Identity Engine ──────────────────────────────────────────────
  try {
    const identityEngine = new DefaultIdentityEngine();
    const identityCtx: IdentityBuildContext = {
      evidences,
      tags,
      dimensions,
      nowMs,
      topN: 5,
    };
    const profile: IdentityProfile = await identityEngine.buildProfile(identityCtx);
    // Propose to pending queue (applied: false enforced by proposeIdentityUpdate)
    if (bieRepo.proposeIdentityUpdate) {
      bieRepo.proposeIdentityUpdate(profile, "AI-suggested identity update from orchestrator");
      identityProposed = true;
    }
  } catch (err) {
    console.warn("[bieOrchestrator] Identity engine step failed (non-fatal):", err);
  }

  // ── 2. Insight Generator ────────────────────────────────────────────
  try {
    const insightGenerator = new DefaultInsightGenerator();
    const insightCtx: InsightGeneratorContext = {
      evidences,
      tags,
      dimensions,
      nowMs,
      maxInsights,
    };
    const insights: InsightItem[] = await insightGenerator.generateInsights(insightCtx);
    // Propose each insight to pending queue (convert InsightItem → Insight for proposeInsightProposal)
    for (const insight of insights) {
      const insightForProposal: import("./types").Insight = {
        id: insight.id,
        kind: mapInsightTypeToKind(insight.type),
        title: insight.title,
        description: insight.description,
        severity: "info",
        dataContext: insight.dataContext,
        confidence: insight.confidence,
        generatedAt: insight.generatedAt,
        applied: false,
      };
      if (bieRepo.proposeInsightProposal) {
        bieRepo.proposeInsightProposal(insightForProposal, "AI-generated insight from orchestrator");
        insightsProposed++;
      }
    }
  } catch (err) {
    console.warn("[bieOrchestrator] Insight generator step failed (non-fatal):", err);
  }

  // ── 3. Timeline Builder ─────────────────────────────────────────────
  try {
    const timelineBuilder = new DefaultTimelineBuilder();
    for (const granularity of timelineGranularities) {
      const timelineCtx: TimelineBuilderContext = {
        evidences,
        tags,
        dimensions,
        granularity,
        nowMs,
      };
      const entries: TimelineEntry[] = await timelineBuilder.buildTimeline(timelineCtx);
      for (const entry of entries) {
        // Convert TimelineEntry (identity layer) → TimelineItem (legacy S1 interface)
        const timelineItem: import("./types").TimelineItem = {
          periodKey: entry.periodKey,
          periodKind: entry.granularity,
          themeBreakdown: entry.themeBreakdown.map((t) => ({
            dimension: t.dimension,
            percent: t.percent,
            tagIds: t.tagIds,
          })),
          milestones: entry.milestones.map((m) => ({
            id: m.id,
            label: m.label,
            occurredAt: m.occurredAt,
            dimension: m.dimension,
          })),
          generatedAt: entry.generatedAt,
          contentHash: entry.contentHash,
        };
        bieRepo.saveTimelineItem(timelineItem);
        timelineBucketsSaved++;
      }
    }
  } catch (err) {
    console.warn("[bieOrchestrator] Timeline builder step failed (non-fatal):", err);
  }

  // ── 4. Relationship Extractor ───────────────────────────────────────
  try {
    const proposals: GraphEdgeProposal[] = extractRelationshipCandidates(
      graphNodes,
      evidences,
      { minCoOccurrence: 2, minSemanticSimilarity: 0.7 }
    );
    if (proposals.length > 0) {
      routeProposalsToPendingQueue(proposals, bieRepo);
      relationshipsProposed = proposals.length;
    }
  } catch (err) {
    console.warn("[bieOrchestrator] Relationship extractor step failed (non-fatal):", err);
  }

  // ── 5. Background Reflection Cycle ──────────────────────────────────
  let reflectionCycleResult: Awaited<ReturnType<typeof runBackgroundReflectionCycle>> = {
    mergesProposed: 0,
    conflictsDetected: 0,
    evidencesConsolidated: 0,
    executedAt: nowMs,
  };
  try {
    const reflectionOpts: ReflectionCycleOptions = {
      evidences,
      graphNodes,
      bieRepo,
      now: nowMs,
    };
    reflectionCycleResult = await runBackgroundReflectionCycle(reflectionOpts);
  } catch (err) {
    console.warn("[bieOrchestrator] Background reflection cycle failed (non-fatal):", err);
  }

  return {
    identityProposed,
    insightsProposed,
    timelineBucketsSaved,
    relationshipsProposed,
    reflectionCycleResult,
    executedAt: nowMs,
    resolveJournalMemory,
  };
}