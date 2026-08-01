// ─────────────────────────────────────────────────────────────────────
// BIE — Conflict Detector Stub Implementation
// Phase 4C S17 — Reflection Type & Provider Contracts Kickoff
// ─────────────────────────────────────────────────────────────────────

import type { BrainEvidence } from "../../../types";
import type { ConflictDetector, ConflictItem } from "./types";

export class DefaultConflictDetector implements ConflictDetector {
  /**
   * Scan evidence rows and identify conflicting statements / opposing tags.
   * Stub implementation returning an empty list of proposals (applied: false invariant).
   */
  detectConflicts(_evidences: BrainEvidence[] = []): ConflictItem[] {
    return [];
  }
}
