// ─────────────────────────────────────────────────────────────────────
// BIE — bieDiscoveryService (S31.1 Query/API Layer)
// Phase 5A S31 — BIE Discovery & Review Surface Service
// ─────────────────────────────────────────────────────────────────────

import { RoomBrainIntelligenceRepository } from "./RoomBrainIntelligenceRepository";
import { SemanticService, createDefaultSemanticService } from "./semanticService";
import { VectorIndex } from "./vectorIndex";
import { RoomDatabase } from "../../lib/db";
import type { BiePendingKind, PendingLearning } from "./types";

const repo = new RoomBrainIntelligenceRepository();

function getSemanticService(): SemanticService {
  const settings = RoomDatabase.getSettings();
  return createDefaultSemanticService(settings?.apiProviders ?? []);
}

export interface GetPendingBieOptions {
  kind?: BiePendingKind;
  page?: number;
  limit?: number;
  bieEnabled?: boolean;
}

export interface GetPendingBieResult {
  items: PendingLearning[];
  total: number;
  hasMore: boolean;
}

export interface SemanticSearchOptions {
  limit?: number;
  minScore?: number;
  bieEnabled?: boolean;
}

export interface SemanticSearchResult {
  matches: Array<{
    id: string;
    text: string;
    score: number;
    metadata?: Record<string, unknown>;
  }>;
  query: string;
}

/**
 * Fetch pending BIE queue items with optional filtering and pagination.
 * Honors `bieEnabled`: returns empty set if `bieEnabled === false` (P4-14).
 */
export function getPendingBieQueue(options: GetPendingBieOptions = {}): GetPendingBieResult {
  const { kind, page = 1, limit = 20, bieEnabled = true } = options;

  if (bieEnabled === false) {
    return { items: [], total: 0, hasMore: false };
  }

  const all = kind
    ? repo.getPendingBieItemsByKind(kind)
    : repo.getPendingBieItems();

  const total = all.length;
  const startIndex = (page - 1) * limit;
  const items = all.slice(startIndex, startIndex + limit);
  const hasMore = startIndex + limit < total;

  return { items, total, hasMore };
}

/**
 * Search semantic embeddings for matching tags or memory items using VectorIndex linear scan.
 * Honors `bieEnabled`: returns empty matches if `bieEnabled === false` (P4-14).
 */
export async function searchBieSemantics(
  query: string,
  options: SemanticSearchOptions = {}
): Promise<SemanticSearchResult> {
  const { limit = 10, minScore = 0.3, bieEnabled = true } = options;

  if (bieEnabled === false || !query.trim()) {
    return { matches: [], query };
  }

  try {
    const service = getSemanticService();
    const index = new VectorIndex(repo, service);
    const queryEmbed = await service.embedText(query);
    const hits = index.findSimilar(queryEmbed.embedding, limit);

    // Join hits with tag names if matched
    const allTags = RoomDatabase.getBrainTreeTags();

    const matches = hits
      .filter((h) => h.score >= minScore)
      .map((h) => {
        const tagMatch = allTags.find((t) => t.id === h.id);
        const text = tagMatch ? tagMatch.name : `Embedding (${h.contentHash.slice(0, 8)})`;
        return {
          id: h.id,
          text,
          score: h.score,
          metadata: { contentHash: h.contentHash },
        };
      });

    return { matches, query };
  } catch (error) {
    console.error("[bieDiscoveryService] searchBieSemantics error:", error);
    return { matches: [], query };
  }
}

/**
 * Confirm a pending BIE proposal. Calls `applyPendingBieItem`.
 * Supports optional `editedPayload` for in-place edit before confirmation.
 */
export function confirmPendingBieItem(
  id: string,
  editedPayload?: Record<string, unknown>
): { success: boolean } {
  try {
    repo.applyPendingBieItem(id, editedPayload);
    return { success: true };
  } catch (error) {
    console.error("[bieDiscoveryService] confirmPendingBieItem error:", error);
    return { success: false };
  }
}

/**
 * Reject a pending BIE proposal. Drops item from pending queue.
 */
export function rejectPendingBieItem(id: string): { success: boolean } {
  try {
    repo.rejectPendingBieItem(id);
    return { success: true };
  } catch (error) {
    console.error("[bieDiscoveryService] rejectPendingBieItem error:", error);
    return { success: false };
  }
}

/**
 * Undo a previously applied BIE proposal.
 */
export function undoAppliedBieItem(
  kind: string,
  targetId: string
): { success: boolean; message: string } {
  try {
    repo.undoAppliedBieItem(kind, targetId);
    return { success: true, message: "Reverted successfully" };
  } catch (error) {
    console.error("[bieDiscoveryService] undoAppliedBieItem error:", error);
    return { success: false, message: "Failed to undo item" };
  }
}

// ─────────────────────────────────────────────────────────────────────
// S32 — Identity & Insight Surface Helpers
// ─────────────────────────────────────────────────────────────────────

import type { IdentityRow, Insight, InsightKind } from "./types";

/**
 * Fetch stored identity profile singleton from `bie_identity`.
 */
export function getBieIdentityProfile(bieEnabled = true): IdentityRow | undefined {
  if (bieEnabled === false) return undefined;
  return repo.getIdentityProfile();
}

/**
 * Confirm/apply identity profile (`applied: true`).
 */
export function confirmBieIdentity(): { success: boolean } {
  try {
    repo.applyIdentity();
    return { success: true };
  } catch (error) {
    console.error("[bieDiscoveryService] confirmBieIdentity error:", error);
    return { success: false };
  }
}

/**
 * Save/update identity profile row.
 */
export function saveBieIdentityProfile(profile: IdentityRow): { success: boolean } {
  try {
    repo.saveIdentityProfile(profile);
    return { success: true };
  } catch (error) {
    console.error("[bieDiscoveryService] saveBieIdentityProfile error:", error);
    return { success: false };
  }
}

/**
 * Fetch stored insights from `bie_insights`.
 */
export function getBieInsights(
  filter?: { kind?: InsightKind; appliedOnly?: boolean },
  bieEnabled = true
): Insight[] {
  if (bieEnabled === false) return [];
  return repo.getInsights(filter);
}

/**
 * Confirm/apply an insight (`applied: true`).
 */
export function confirmBieInsight(id: string): { success: boolean } {
  try {
    repo.applyInsight(id);
    return { success: true };
  } catch (error) {
    console.error("[bieDiscoveryService] confirmBieInsight error:", error);
    return { success: false };
  }
}

/**
 * Reject/delete an insight.
 */
export function rejectBieInsight(id: string): { success: boolean } {
  try {
    repo.deleteInsight(id);
    return { success: true };
  } catch (error) {
    console.error("[bieDiscoveryService] rejectBieInsight error:", error);
    return { success: false };
  }
}

// ─────────────────────────────────────────────────────────────────────
// S33 — Timeline & Context Enrichment Helpers
// ─────────────────────────────────────────────────────────────────────

import type { TimelineItem, TimelinePeriodKind } from "./types";

/**
 * Fetch cached timeline entries from `bie_timeline`.
 */
export function getBieTimelineItems(
  filter?: { periodKind?: TimelinePeriodKind },
  bieEnabled = true
): TimelineItem[] {
  if (bieEnabled === false) return [];
  return repo.getTimelineItems(filter);
}

/**
 * Fetch aggregate BIE retrieval enrichment status summary.
 * Used by status badges and context indicators.
 */
export function getBieContextSummary(bieEnabled = true): {
  identityApplied: boolean;
  appliedInsightCount: number;
  pendingInsightCount: number;
  timelineBucketCount: number;
} {
  if (bieEnabled === false) {
    return {
      identityApplied: false,
      appliedInsightCount: 0,
      pendingInsightCount: 0,
      timelineBucketCount: 0,
    };
  }

  const identityRow = repo.getIdentityProfile();
  const insights = repo.getInsights();
  const timelineItems = repo.getTimelineItems();

  return {
    identityApplied: identityRow?.applied === true,
    appliedInsightCount: insights.filter((i) => i.applied).length,
    pendingInsightCount: insights.filter((i) => !i.applied).length,
    timelineBucketCount: timelineItems.length,
  };
}


