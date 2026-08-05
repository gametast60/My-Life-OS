// ─────────────────────────────────────────────────────────────────────
// BIE — Identity Layer
// Phase 4D S26 — Life Timeline Builder (M/Q/Y View)
// ─────────────────────────────────────────────────────────────────────
//
// Provides:
//   TimelineBuilder        — provider interface (DI-injectable)
//   DefaultTimelineBuilder — concrete implementation
//
// Algorithm (DefaultTimelineBuilder):
//   1. Group evidences by period key according to granularity (Month / Quarter / Year).
//   2. For each period group:
//      - Resolve dimension for each evidence via its primary tag.
//      - Calculate themeBreakdown percentage share of each LifeDimension.
//      - Extract milestones using keyword check on evidence preview.
//      - Compute contentHash by sorting contributing evidence IDs and hashing
//        the comma-separated string.
//   3. Return TimelineEntry[] sorted by periodKey descending.
//
// Hard constraints honored:
//   P4-8  Additive only — no removal of existing types.
//   P4-2  Zero UX/UI change — pure engine logic, no UI components.
//   P4-7  No PIE layer imports — BIE types + utils only.
//   P4-5  Fallback safety — handles invalid/empty inputs gracefully.
// ─────────────────────────────────────────────────────────────────────

import type {
  BrainEvidence,
  BrainTreeDimension,
  BrainTreeTag,
  LifeDimension,
} from "../../../types";
import { contentHash } from "../utils";
import { resolveEvidenceText } from "../analysisContext";
import type { JournalMemoryResolver } from "../journalMemoryResolver";
import type {
  TimelineEntry,
  TimelineGranularity,
  TimelineMilestoneEntry,
  TimelineThemeBreakdown,
} from "./types";

/** Context object for timeline builder. */
export interface TimelineBuilderContext {
  /** All evidence records to consider. */
  evidences: BrainEvidence[];
  /** All Brain Tree tags for resolving dimensionId. */
  tags: BrainTreeTag[];
  /** All Brain Tree dimensions for mapping dimensionId to LifeDimension. */
  dimensions: BrainTreeDimension[];
  /** Target granularity of timeline buckets. */
  granularity: TimelineGranularity;
  /** Current Unix ms timestamp. Defaults to Date.now(). */
  nowMs?: number;
  /**
   * Architect Fix 1 (Final): read-only resolver from BrainEvidence.sourceId
   * to the original JournalEntry. When supplied, milestone detection scans
   * the real Journal content instead of only the 140-char `preview`.
   * Optional and backward-compatible.
   */
  resolveJournalMemory?: JournalMemoryResolver;
}

/** Interface for TimelineBuilder. */
export interface TimelineBuilder {
  /**
   * Scan evidence → group by periods → build TimelineEntry[].
   * Rebuildable cache design: checks contentHash for invalidation.
   */
  buildTimeline(context: TimelineBuilderContext): Promise<TimelineEntry[]>;
}

// ─────────────────────────────────────────────────────────────────────
// Helper Utilities
// ─────────────────────────────────────────────────────────────────────

const MILESTONE_KEYWORDS = [
  "complete", "finish", "achieve", "success", "done", "launch",
  "สำเร็จ", "ทำได้", "เสร็จ", "ผ่าน", "ได้รับ", "เริ่ม", "เปิดตัว",
  "milestone", "first time", "ครั้งแรก",
];

/** Check if a preview string indicates a milestone. */
function isMilestone(preview: string): boolean {
  const p = preview.toLowerCase();
  return MILESTONE_KEYWORDS.some((kw) => p.includes(kw));
}

/** Formats a Unix timestamp into a string period key based on granularity. */
function formatPeriod(timestamp: number, granularity: TimelineGranularity): string {
  if (!Number.isFinite(timestamp) || timestamp <= 0) {
    timestamp = Date.now();
  }
  const date = new Date(timestamp);
  let year = date.getFullYear();
  if (isNaN(year)) {
    year = new Date().getFullYear();
  }
  const month = isNaN(date.getMonth()) ? 1 : date.getMonth() + 1;
  if (granularity === "year") {
    return `${year}`;
  }
  if (granularity === "month") {
    const monthStr = month < 10 ? `0${month}` : `${month}`;
    return `${year}-${monthStr}`;
  }
  // quarter
  const quarter = Math.ceil(month / 3);
  return `${year}-Q${quarter}`;
}

// ─────────────────────────────────────────────────────────────────────
// DefaultTimelineBuilder Implementation
// ─────────────────────────────────────────────────────────────────────

export class DefaultTimelineBuilder implements TimelineBuilder {
  async buildTimeline(context: TimelineBuilderContext): Promise<TimelineEntry[]> {
    const {
      evidences,
      tags,
      dimensions,
      granularity,
      nowMs = Date.now(),
      resolveJournalMemory,
    } = context;

    if (evidences.length === 0) {
      return [];
    }

    // Build map for tagId → tag
    const tagMap = new Map<string, BrainTreeTag>();
    for (const tag of tags) {
      tagMap.set(tag.id, tag);
    }

    // Build map for dimensionId → LifeDimension
    const dimIdMap = new Map<string, LifeDimension>();
    for (const dim of dimensions) {
      dimIdMap.set(dim.id, dim.id as LifeDimension);
    }

    // Group evidences by period key
    const groups = new Map<string, BrainEvidence[]>();
    for (const ev of evidences) {
      const key = formatPeriod(ev.occurredAt, granularity);
      const list = groups.get(key) ?? [];
      list.push(ev);
      groups.set(key, list);
    }

    const entries: TimelineEntry[] = [];

    for (const [periodKey, evList] of groups) {
      const contributingIds: string[] = [];
      const dimCounts = new Map<LifeDimension, number>();
      const dimTags = new Map<LifeDimension, Set<string>>();
      const milestones: TimelineMilestoneEntry[] = [];

      for (const ev of evList) {
        contributingIds.push(ev.id);

        // Resolve dimension from first tagId
        const primaryTagId = ev.brainTreeTagIds[0];
        const tag = primaryTagId ? tagMap.get(primaryTagId) : undefined;
        const dim: LifeDimension | undefined = tag
          ? dimIdMap.get(tag.brainTreeDimensionId)
          : undefined;

        if (dim) {
          dimCounts.set(dim, (dimCounts.get(dim) ?? 0) + 1);
          const tset = dimTags.get(dim) ?? new Set<string>();
          for (const tid of ev.brainTreeTagIds) {
            tset.add(tid);
          }
          dimTags.set(dim, tset);
        }

        // Check if evidence is a milestone. Architect Fix 1 (Final): scan
        // the real Journal content (when resolvable) rather than only the
        // 140-char preview; the short display label stays preview-derived
        // and unchanged.
        const analysisText = resolveEvidenceText(ev, resolveJournalMemory);
        if (isMilestone(analysisText)) {
          milestones.push({
            id: ev.id,
            label: ev.preview.trim().slice(0, 60),
            occurredAt: ev.occurredAt,
            dimension: dim,
          });
        }
      }

      // Calculate total resolved evidences to compute percentage shares
      let totalResolved = 0;
      for (const count of dimCounts.values()) {
        totalResolved += count;
      }

      // Compute theme breakdown
      const themeBreakdown: TimelineThemeBreakdown[] = [];
      for (const [dim, count] of dimCounts.entries()) {
        const percent = totalResolved > 0
          ? Math.round((count / totalResolved) * 100)
          : 0;
        const tagIds = Array.from(dimTags.get(dim) ?? new Set<string>());
        themeBreakdown.push({
          dimension: dim,
          percent,
          tagIds,
        });
      }

      // Sort theme breakdown by percentage descending
      themeBreakdown.sort((a, b) => b.percent - a.percent);

      // Sort milestones by occurredAt descending
      milestones.sort((a, b) => b.occurredAt - a.occurredAt);

      // Compute contentHash (SHA-1 equivalent FNV-1a of sorted contributing evidence IDs)
      contributingIds.sort();
      const hash = contentHash(contributingIds.join(","));

      entries.push({
        periodKey,
        granularity,
        themeBreakdown,
        milestones,
        generatedAt: nowMs,
        contentHash: hash,
      });
    }

    // Sort timeline entries by period key descending (newest first)
    entries.sort((a, b) => b.periodKey.localeCompare(a.periodKey));

    return entries;
  }
}
