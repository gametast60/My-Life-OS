// ─────────────────────────────────────────────────────────────────────
// BIE — Evidence Consolidator Stub Implementation
// Phase 4C S17 — Reflection Type & Provider Contracts Kickoff
// ─────────────────────────────────────────────────────────────────────

import type { BrainEvidence } from "../../../types";
import type { EvidenceConsolidator, EvidenceConsolidationReport } from "./types";

export class DefaultEvidenceConsolidator implements EvidenceConsolidator {
  /**
   * Consolidate evidence references from sourceTagId to targetTagId.
   * Stub implementation returning a read-only report summary.
   */
  consolidateTagReferences(
    sourceTagId: string,
    targetTagId: string,
    _evidences: BrainEvidence[] = []
  ): EvidenceConsolidationReport {
    return {
      sourceTagId,
      targetTagId,
      reassignedEvidenceCount: 0,
      danglingReferencesRemoved: 0,
      updatedAt: Date.now(),
    };
  }
}
