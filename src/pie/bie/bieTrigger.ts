// ─────────────────────────────────────────────────────────────────────
// BIE — Learning Cycle Trigger (Phase Upgrade A+B)
// ─────────────────────────────────────────────────────────────────────
//
// This is the ONLY new integration boundary added for Phase Upgrade A+B.
// It connects the existing, unchanged A pipeline
//   (Journal → A Placement → User Confirm → createJournalEvidence)
// to the existing BIE orchestrator (B / long-term learning layer)
// WITHOUT calling runBieAnalysisOrchestrator() on every Journal save.
//
// Reused (not reinvented) mechanisms:
//   - `UserSettings.bieLastRunAt`  (declared in types.ts, previously
//     unused anywhere in the codebase — this file is what finally reads
//     and writes it, acting as the throttle for the BIE cycle).
//   - `bieEnabled` disable-switch convention (P4-14 / S7, opt-out model:
//     `bieEnabled !== false` ⇒ enabled), already used throughout
//     src/pie/** and src/pie/bie/bieDiscoveryService.ts.
//   - `MIN_EVIDENCE_FOR_FULL_CONFIDENCE` (identityEngine.ts) as the
//     reference order-of-magnitude for "sufficient accumulated evidence"
//     — no new scoring system is introduced (BIE Safety Rule: a single
//     Journal event must not trigger a full learning cycle by itself;
//     confidence-per-category sufficiency is still handled inside
//     identityEngine/insightGenerator exactly as before).
//   - `BrainEvidence.sourceId` as the existing read-through reference to
//     Journal memory. Journal records are NOT duplicated into a second
//     memory store.
//
// HITL is unaffected: this file only decides WHEN
// runBieAnalysisOrchestrator() may run. Everything that orchestrator
// produces still lands in the pending queue (applied: false) exactly as
// before — see bieOrchestrator.ts.
//
// Architect Fix 1 (Final): builds the read-only Journal-memory resolver
// (journalMemoryResolver.ts) from `journals` and passes it into the
// orchestrator context. From there it now reaches identityEngine /
// insightGenerator / timelineBuilder (via analysisContext.ts), so BIE
// reasoning actually classifies/scans the real Journal content for
// kind:"journal" evidence — not only BrainEvidence.preview — without
// duplicating Journal storage.
//
// Architect Fix 2: `bieEnabled` here is just a parameter — it is the
// CALLER's responsibility (see App.tsx) to pass the real, persisted
// `settings.bieEnabled` explicitly rather than relying on this
// function's own default.
// ─────────────────────────────────────────────────────────────────────

import type {
  BrainEvidence,
  BrainTreeDimension,
  BrainTreeTag,
  JournalEntry,
  UserSettings,
} from "../../types";
import { runBieAnalysisOrchestrator } from "./bieOrchestrator";
import type { BrainIntelligenceRepository } from "./BrainIntelligenceRepository";
import type { GraphNode } from "./types";
import type { BIEGraphNode } from "./graph/types";
import { createJournalMemoryResolver } from "./journalMemoryResolver";

/**
 * Minimum time between BIE learning cycles (throttle), reusing the
 * `bieLastRunAt` field on UserSettings. 6 hours keeps BIE a background
 * "long-term learning" cadence rather than a per-event trigger.
 */
export const BIE_MIN_INTERVAL_MS = 6 * 60 * 60 * 1000;

/**
 * Minimum total Brain Evidence rows that must exist before BIE may run
 * at all. Matches identityEngine's own evidence-sufficiency reference
 * point so this file does not introduce a second, competing threshold.
 */
export const BIE_MIN_EVIDENCE_COUNT = 5;

/** Adapt the legacy `GraphNode` (bie_graph_nodes storage shape) to the
 * `BIEGraphNode` shape the orchestrator expects. Field-rename only
 * (`kind` → `nodeType`); no new data is synthesized. */
function toBieGraphNode(n: GraphNode): BIEGraphNode {
  return {
    id: n.id,
    nodeType: n.kind,
    label: n.label,
    description: n.description,
    coreType: n.coreType,
    dimension: n.dimension,
    createdAt: n.createdAt,
    updatedAt: n.updatedAt,
  };
}

export interface MaybeRunBieParams {
  evidences: BrainEvidence[];
  tags: BrainTreeTag[];
  dimensions: BrainTreeDimension[];
  /**
   * Architect Fix 1: canonical Journal list (e.g. RoomDatabase.getJournals()),
   * used only to build a read-only sourceId -> JournalEntry resolver for
   * this run. Not stored, not duplicated.
   */
  journals: JournalEntry[];
  bieRepo: BrainIntelligenceRepository;
  settings: UserSettings;
  /**
   * Architect Fix 2: the caller MUST pass the actual persisted
   * `settings.bieEnabled` value explicitly (do not rely on this
   * parameter's own default when a real user setting exists). Only
   * callers with no real setting to read may omit it, in which case it
   * defaults to true (P4-14 opt-out convention).
   */
  bieEnabled?: boolean;
  nowMs?: number;
}

export type MaybeRunBieReason =
  | "disabled"
  | "insufficient_evidence"
  | "throttled"
  | "ran"
  | "error";

export interface MaybeRunBieResult {
  ran: boolean;
  reason: MaybeRunBieReason;
  /** When ran=true, caller must persist this (RoomDatabase.saveSettings + setSettings). */
  updatedSettings?: UserSettings;
}

/**
 * Decide whether the BIE long-term learning cycle should run right now,
 * and run it if so.
 *
 * Call this AFTER createJournalEvidence() — i.e. from
 * handleConfirmJournalPlacement — never from every raw Journal save
 * (Quick Note, unconfirmed placements, etc. must never reach this).
 *
 * Non-fatal: any internal error is caught and reported via reason
 * "error", mirroring the orchestrator's own non-fatal pattern. Never
 * throws.
 */
export async function maybeRunBieLearningCycle(
  params: MaybeRunBieParams
): Promise<MaybeRunBieResult> {
  const {
    evidences,
    tags,
    dimensions,
    journals,
    bieRepo,
    settings,
    bieEnabled = true,
    nowMs = Date.now(),
  } = params;

  if (bieEnabled === false) {
    return { ran: false, reason: "disabled" };
  }

  if (evidences.length < BIE_MIN_EVIDENCE_COUNT) {
    return { ran: false, reason: "insufficient_evidence" };
  }

  const lastRun = settings.bieLastRunAt ?? 0;
  if (nowMs - lastRun < BIE_MIN_INTERVAL_MS) {
    return { ran: false, reason: "throttled" };
  }

  try {
    const graphNodes = (bieRepo.getGraphNodes?.() ?? []).map(toBieGraphNode);
    const resolveJournalMemory = createJournalMemoryResolver(journals);
    await runBieAnalysisOrchestrator({
      evidences,
      tags,
      dimensions,
      graphNodes,
      bieRepo,
      nowMs,
      resolveJournalMemory,
    });
    return {
      ran: true,
      reason: "ran",
      updatedSettings: { ...settings, bieLastRunAt: nowMs },
    };
  } catch (err) {
    console.warn("[bieTrigger] BIE learning cycle failed (non-fatal):", err);
    return { ran: false, reason: "error" };
  }
}
