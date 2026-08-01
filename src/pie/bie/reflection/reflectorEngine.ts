// ─────────────────────────────────────────────────────────────────────
// BIE — Reflector Engine Implementation (P4-11 Background Reflect Job)
// Phase 4C S21 — Background Reflect Job Runner (P4-11)
// ─────────────────────────────────────────────────────────────────────

import type { BrainEvidence } from "../../../types";
import type { BrainIntelligenceRepository } from "../BrainIntelligenceRepository";
import type { BIEGraphNode, EntityResolutionCandidate } from "../graph";
import { findDuplicateCandidates } from "../graph/entityResolver";
import type { PendingLearning } from "../types";
import { DefaultConflictDetector, routeConflictsToPendingQueue } from "./conflictDetector";
import { DefaultDecayEngine } from "./decayEngine";
import { DefaultEvidenceConsolidator } from "./evidenceConsolidator";
import type { ReflectionCycleResult, ReflectorEngine } from "./types";

/** Options parameter for configuring a background reflection cycle run. */
export interface ReflectionCycleOptions {
  evidences?: BrainEvidence[];
  graphNodes?: BIEGraphNode[];
  bieRepo?: BrainIntelligenceRepository;
  now?: number;
}

export class DefaultReflectorEngine implements ReflectorEngine {
  private consolidator: DefaultEvidenceConsolidator;
  private conflictDetector: DefaultConflictDetector;
  private decayEngine: DefaultDecayEngine;

  constructor(
    consolidator = new DefaultEvidenceConsolidator(),
    conflictDetector = new DefaultConflictDetector(),
    decayEngine = new DefaultDecayEngine()
  ) {
    this.consolidator = consolidator;
    this.conflictDetector = conflictDetector;
    this.decayEngine = decayEngine;
  }

  /**
   * Run a background reflection cycle (Consolidate -> Conflict -> Merge -> Propose).
   * P4-11: Non-blocking async background runner.
   * P4-12: Every generated proposal routes to pending queue with applied: false invariant.
   */
  async runReflectionCycle(
    options: ReflectionCycleOptions = {}
  ): Promise<ReflectionCycleResult> {
    const now = options.now || Date.now();
    const bieRepo = options.bieRepo;

    let evidencesConsolidated = 0;
    let conflictsDetected = 0;
    let mergesProposed = 0;

    try {
      // Fetch inputs safely with fallback
      const evidences: BrainEvidence[] = options.evidences || [];
      let graphNodes: BIEGraphNode[] = options.graphNodes || [];

      if (graphNodes.length === 0 && bieRepo && typeof bieRepo.getGraphNodes === "function") {
        const rawNodes = bieRepo.getGraphNodes();
        graphNodes = rawNodes.map((n) => ({
          id: n.id,
          label: n.label,
          nodeType: (n.kind as unknown as BIEGraphNode["nodeType"]) || "Tag",
          createdAt: n.createdAt,
          updatedAt: n.updatedAt,
        }));
      }

      // Stage 1: Evidence Consolidation & Dangling Reference Cleanup
      if (evidences.length > 0) {
        for (const ev of evidences) {
          if (!ev || !Array.isArray(ev.brainTreeTagIds)) continue;
          const originalCount = ev.brainTreeTagIds.length;
          const cleanTags = ev.brainTreeTagIds.filter(
            (id) => typeof id === "string" && id.trim().length > 0
          );
          if (cleanTags.length < originalCount) {
            evidencesConsolidated += originalCount - cleanTags.length;
          }
        }
      }

      // Stage 2: Contradiction & Conflict Detection
      const conflicts = this.conflictDetector.detectConflicts(evidences);
      conflictsDetected = conflicts.length;
      if (conflicts.length > 0 && bieRepo) {
        routeConflictsToPendingQueue(conflicts, bieRepo);
      }

      // Stage 3: Duplicate Tag / Entity Node Merge Proposals
      if (graphNodes.length > 1) {
        const duplicateCandidates = findDuplicateCandidates(graphNodes);
        mergesProposed = duplicateCandidates.length;

        if (duplicateCandidates.length > 0 && bieRepo && typeof bieRepo.appendPendingBieItem === "function") {
          for (const candidate of duplicateCandidates) {
            const pendingMergeItem = this.createPendingMergeItem(candidate, now);
            bieRepo.appendPendingBieItem(pendingMergeItem);
          }
        }
      }
    } catch (err) {
      console.warn("[ReflectorEngine] Non-fatal background reflect warning:", err);
    }

    return {
      mergesProposed,
      conflictsDetected,
      evidencesConsolidated,
      executedAt: now,
    };
  }

  /** Helper to format duplicate tag candidates into HITL pending merge proposals. */
  private createPendingMergeItem(
    candidate: EntityResolutionCandidate,
    now: number
  ): PendingLearning {
    return {
      id: `pending-merge-${candidate.sourceNodeId}-${candidate.targetNodeId}`,
      kind: "graph_merge",
      payload: {
        sourceNodeId: candidate.sourceNodeId,
        targetNodeId: candidate.targetNodeId,
        matchScore: candidate.matchScore,
        similarityType: candidate.similarityType,
        applied: false, // 🔒 P4-12 HITL structural invariant
      },
      reason: candidate.reason || `เสนอรวมแท็กที่ซ้ำซ้อน: "${candidate.sourceNodeId}" → "${candidate.targetNodeId}"`,
      confidence: candidate.matchScore,
      createdAt: now,
    };
  }

  getConsolidator() {
    return this.consolidator;
  }

  getConflictDetector() {
    return this.conflictDetector;
  }

  getDecayEngine() {
    return this.decayEngine;
  }
}

/** Standalone helper for executing a background reflection cycle. */
export async function runBackgroundReflectionCycle(
  options: ReflectionCycleOptions = {}
): Promise<ReflectionCycleResult> {
  const engine = new DefaultReflectorEngine();
  return engine.runReflectionCycle(options);
}
