// ─────────────────────────────────────────────────────────────────────
// BIE — Edge Proposal Queue Helper Stubs
// Phase 4B S10 — Knowledge Graph + Relationship Engine Kickoff
// ─────────────────────────────────────────────────────────────────────
//
// Structural invariant helper: All AI edge creation calls MUST generate proposals
// with `applied: false` and route through the Pending Queue (`bie_pending_queue`).
// Direct applied=true write paths from AI modules are forbidden (P4-12 HITL).
// ─────────────────────────────────────────────────────────────────────

import type { PendingLearning } from "../types";
import type { GraphEdgeProposal, GraphEdgeType } from "./types";

/**
 * Generate a type-safe GraphEdgeProposal carrying the mandatory `applied: false` invariant.
 *
 * @param fromId Source graph node ID.
 * @param toId Target graph node ID.
 * @param type Canonical edge relationship type (one of 6).
 * @param confidence AI confidence score [0.0 - 1.0].
 * @param reason Human-readable explanation for HITL review.
 */
export function proposeEdge(
  fromId: string,
  toId: string,
  type: GraphEdgeType,
  confidence = 0.8,
  reason = "AI-suggested relationship candidate"
): GraphEdgeProposal {
  return {
    id: `bie-prop-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    fromId,
    toId,
    type,
    confidence,
    reason,
    applied: false,
    createdAt: Date.now(),
  };
}

/**
 * Convert a GraphEdgeProposal into a standard BIE PendingLearning queue item
 * ready for `appendPendingBieItem()`.
 *
 * @param proposal The edge proposal object.
 * @returns PendingLearning item with kind "graph_edge".
 */
export function createPendingEdgeItem(proposal: GraphEdgeProposal): PendingLearning {
  return {
    id: proposal.id,
    kind: "graph_edge",
    payload: {
      fromId: proposal.fromId,
      toId: proposal.toId,
      type: proposal.type,
      applied: proposal.applied, // always false
    },
    reason: proposal.reason,
    confidence: proposal.confidence,
    createdAt: proposal.createdAt,
  };
}
