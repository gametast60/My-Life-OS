// ─────────────────────────────────────────────────────────────────────
// BIE — Memory Intelligence & Reflection Engine Contracts
// Phase 4C S17 — Reflection Type & Provider Contracts Kickoff
// ─────────────────────────────────────────────────────────────────────
//
// Single source of truth for Phase 4C Reflection Engine type contracts,
// conflict detection structures, decay calculation models, and evidence
// consolidation interfaces.
//
// Hard Constraints:
//   P4-8  Strict Widening Only — additive contracts only, zero breaking changes.
//   P4-12 HITL Preserved — all conflict resolutions and reflection proposals
//         carry `applied: false` invariant.
//   P4-11 Async Reflect — background jobs run non-blocking overnight/idle.
// ─────────────────────────────────────────────────────────────────────

import type { BrainEvidence } from "../../../types";
import type { PendingLearning } from "../types";

/** Summary report of an evidence consolidation operation. */
export interface EvidenceConsolidationReport {
  sourceTagId: string;
  targetTagId: string;
  reassignedEvidenceCount: number;
  danglingReferencesRemoved: number;
  updatedAt: number;
}

/** Severity level for evidence-based contradiction items. */
export type ConflictSeverity = "low" | "medium" | "high";

/** Structure representing a detected memory contradiction or conflict. */
export interface ConflictItem {
  id: string;
  /** Primary statement / tag A */
  statementA: string;
  /** Contradictory statement / tag B */
  statementB: string;
  evidenceIdsA: string[];
  evidenceIdsB: string[];
  severity: ConflictSeverity;
  /** Suggested human-readable resolution proposal */
  suggestedResolution: string;
  /** 🔒 STRUCTURAL INVARIANT: Must be false until user confirms in UI */
  readonly applied: false;
  createdAt: number;
}

/** Decay score structure for exponential tag decay calculation. */
export interface DecayScore {
  tagId: string;
  lastEvidenceAt: number;
  daysIdle: number;
  originalScore: number;
  decayedScore: number;
  decayPercent: number;
}

/** Result summary of a background reflection cycle. */
export interface ReflectionCycleResult {
  mergesProposed: number;
  conflictsDetected: number;
  evidencesConsolidated: number;
  executedAt: number;
}

// ─────────────────────────────────────────────────────────────────────
// Provider Interfaces (Phase 4C Core Engine Contracts)
// ─────────────────────────────────────────────────────────────────────

/** Interface for evidence reference cleanup post tag merge. */
export interface EvidenceConsolidator {
  /**
   * Consolidate evidence references from a source tag to a target tag.
   * Cleans up dangling references and re-points source IDs to target ID.
   */
  consolidateTagReferences(
    sourceTagId: string,
    targetTagId: string,
    evidences?: BrainEvidence[]
  ): EvidenceConsolidationReport;
}

/** Interface for evidence-based contradiction detection. */
export interface ConflictDetector {
  /**
   * Scan evidence rows and identify conflicting statements / opposing tags.
   * Returns list of `ConflictItem` objects with `applied: false`.
   */
  detectConflicts(evidences: BrainEvidence[]): ConflictItem[];
}

/** Interface for tag growth exponential decay calculation. */
export interface DecayEngine {
  /**
   * Calculate decayed growth score based on time elapsed since last evidence.
   */
  calculateTagDecay(
    tagId: string,
    lastEvidenceAt: number,
    currentScore: number,
    now?: number
  ): DecayScore;
}

/** Interface for the background reflection job runner (P4-11). */
export interface ReflectorEngine {
  /**
   * Run a background reflection cycle (Consolidate → Conflict → Merge → Propose).
   * Generates pending queue items carrying `applied: false`.
   */
  runReflectionCycle(): Promise<ReflectionCycleResult>;
}
