// ─────────────────────────────────────────────────────────────────────
// BIE — Journal Memory Resolver (Architect Fix 1)
// ─────────────────────────────────────────────────────────────────────
//
// Problem: BrainEvidence.preview is truncated to 140 chars (unchanged —
// createJournalEvidence() is NOT touched by this file). That is not
// sufficient for BIE to reason over "accumulated Journal Memory" per the
// approved architecture:
//
//   Journal        = canonical memory source
//   BrainEvidence   = derived evidence/reference (sourceId -> Journal)
//   BIE             = long-term intelligence layer
//
// This file is the smallest possible read-only integration boundary:
// given evidence.sourceId (== JournalEntry.id for kind:"journal"
// evidence — see createJournalEvidence in brainTreeService.ts, unchanged),
// resolve the ORIGINAL JournalEntry on demand.
//
// Explicitly NOT done here:
//   - No second storage table / no duplication of Journal records.
//   - No mutation of BrainEvidence.preview.
//   - No change to createJournalEvidence() semantics.
//
// Architect Fix 1 (Final): this resolver is now actually consumed by the
// BIE reasoning engines (identityEngine / insightGenerator /
// timelineBuilder) via the shared analysisContext.ts helper
// (resolveEvidenceText), not just echoed through the orchestrator
// boundary — see bieOrchestrator.ts, analysisContext.ts.
//
// This is a plain in-memory lookup function built fresh per BIE run from
// RoomDatabase.getJournals() (already the canonical source) — nothing
// persisted, nothing cached beyond the lifetime of one resolver instance.
// ─────────────────────────────────────────────────────────────────────

import type { JournalEntry } from "../../types";

/** The real Journal memory a piece of BrainEvidence points to. */
export interface ResolvedJournalMemory {
  sourceId: string;
  title: string;
  content: string;
  timestamp: number;
}

export type JournalMemoryResolver = (sourceId: string) => ResolvedJournalMemory | undefined;

/**
 * Build a read-only resolver: BrainEvidence.sourceId -> original JournalEntry.
 *
 * @param journals The current, canonical Journal list (e.g.
 *   `RoomDatabase.getJournals()`). Not copied into any new persisted
 *   store — held only as a Map for O(1) lookup during this BIE run.
 */
export function createJournalMemoryResolver(journals: JournalEntry[]): JournalMemoryResolver {
  const byId = new Map<string, JournalEntry>();
  for (const j of journals) byId.set(j.id, j);

  return (sourceId: string): ResolvedJournalMemory | undefined => {
    const j = byId.get(sourceId);
    if (!j) return undefined;
    return {
      sourceId: j.id,
      title: j.title || j.date,
      content: j.content,
      timestamp: j.timestamp || 0,
    };
  };
}
