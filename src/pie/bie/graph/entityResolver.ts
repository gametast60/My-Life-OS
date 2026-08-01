// ─────────────────────────────────────────────────────────────────────
// BIE — Entity Resolution & Duplicate Detection
// Phase 4B S11 — Entity Resolution & Duplicate Tag Matcher
// ─────────────────────────────────────────────────────────────────────
//
// Implements:
//   1. findDuplicateCandidates   — detect duplicate tag/entity node pairs
//      via three strategy tiers (exact label, synonym dictionary, semantic
//      cosine similarity ≥ 0.82).
//   2. generateDuplicateMergeReport — produce a dry-run merge diff preview
//      without touching the DB (applied=false invariant, P4-12 HITL).
//   3. resolveEntityNode         — normalize whitespace/casing and
//      construct a canonical BIEGraphNode structure.
//
// Hard Constraints honored:
//   P4-8  Strict Widening Only — additive implementation, no removal of
//         any exported symbol. Stubs replaced with real logic.
//   P4-2  Zero UX/UI change — this file is background matching logic only.
//   P4-12 HITL: dry-run report / proposals only — zero auto-merge,
//         zero auto-deletion, applied=false preserved throughout.
//   P4-3  Edge & Merge Proposals: pending only (applied=false).
//
// Strategy thresholds (per S11 spec):
//   Semantic cosine threshold : ≥ 0.82  (EntityResolutionCandidate.matchScore)
//   Exact match score         : 1.0
//   Synonym match score       : 0.90
// ─────────────────────────────────────────────────────────────────────

import type {
  BIEGraphNode,
  DuplicateDetectionResult,
  EntityResolutionCandidate,
  GraphNodeType,
} from "./types";
import { expandSynonyms } from "../synonyms";
import { cosineSimilarity } from "../utils";

// ─────────────────────────────────────────────────────────────────────
// Internal constants
// ─────────────────────────────────────────────────────────────────────

/** Minimum cosine similarity score to flag two nodes as semantic duplicates. */
const SEMANTIC_SIMILARITY_THRESHOLD = 0.82;

/** Score assigned when two labels match exactly (case-insensitive, normalized). */
const EXACT_MATCH_SCORE = 1.0;

/** Score assigned when one node's label appears in the other's synonym set. */
const SYNONYM_MATCH_SCORE = 0.9;

// ─────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────

/**
 * Normalize a node label for comparison:
 *   - trim leading/trailing whitespace
 *   - collapse internal whitespace runs to single space
 *   - lowercase
 */
function normalizeLabel(label: string): string {
  return label.trim().replace(/\s+/g, " ").toLowerCase();
}

/**
 * Check whether `candidateLabel` appears as a synonym of `sourceLabel`
 * in the SYNONYM_DICTIONARY (bidirectional single-hop check).
 *
 * @param sourceLabel   - Normalized label of the source node.
 * @param candidateLabel - Normalized label of the target node.
 * @returns true if either direction contains the other in its synonym list.
 */
function isSynonymMatch(sourceLabel: string, candidateLabel: string): boolean {
  // Forward: source → candidate
  const sourceSynonyms = expandSynonyms(sourceLabel);
  if (sourceSynonyms.includes(candidateLabel)) return true;

  // Reverse: candidate → source (symmetric check)
  const candidateSynonyms = expandSynonyms(candidateLabel);
  if (candidateSynonyms.includes(sourceLabel)) return true;

  return false;
}

/**
 * Extract a vector embedding from a node's metadata if available.
 * The field `metadata.embedding` is a number[] produced by SemanticService
 * and stored by the BIE pipeline. Returns null if unavailable.
 */
function extractNodeEmbedding(node: BIEGraphNode): number[] | null {
  const emb = node.metadata?.["embedding"];
  if (!Array.isArray(emb) || emb.length === 0) return null;
  // Validate that the array contains only finite numbers.
  for (const v of emb) {
    if (typeof v !== "number" || !Number.isFinite(v)) return null;
  }
  return emb as number[];
}

// ─────────────────────────────────────────────────────────────────────
// S11 Step 2 — Duplicate Detection Engine
// ─────────────────────────────────────────────────────────────────────

/**
 * Scan a list of graph nodes and identify candidate duplicate pairs.
 *
 * Three strategy tiers (evaluated in priority order per pair):
 *   1. **Exact** — normalized labels are identical → score 1.0
 *   2. **Synonym** — one label appears in the other's synonym set → score 0.90
 *   3. **Semantic** — cosine similarity of `metadata.embedding` vectors ≥ 0.82
 *
 * Each pair (i, j) where i < j is evaluated at most once, so the same
 * pair is never emitted twice. If multiple strategies match, only the
 * highest-priority strategy result is returned for that pair.
 *
 * ### HITL compliance (P4-12):
 * This function is **pure read-only** — no DB writes, no auto-merge.
 * All returned candidates are pending proposals awaiting HITL review.
 *
 * @param nodes - List of BIEGraphNode objects to evaluate. Typically all
 *                nodes in a user's graph, or a filtered subset by nodeType.
 * @returns Array of `EntityResolutionCandidate` objects (may be empty).
 *
 * @example
 *   const candidates = findDuplicateCandidates(allGraphNodes);
 *   // → [{ sourceNodeId, targetNodeId, matchScore: 0.9, similarityType: "synonym", reason: "..." }]
 */
export function findDuplicateCandidates(
  nodes: BIEGraphNode[] = []
): EntityResolutionCandidate[] {
  const candidates: EntityResolutionCandidate[] = [];

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const nodeA = nodes[i];
      const nodeB = nodes[j];

      const labelA = normalizeLabel(nodeA.label);
      const labelB = normalizeLabel(nodeB.label);

      // ── Tier 1: Exact label match ─────────────────────────────────
      if (labelA === labelB) {
        candidates.push({
          sourceNodeId: nodeA.id,
          targetNodeId: nodeB.id,
          matchScore: EXACT_MATCH_SCORE,
          similarityType: "exact",
          reason: `Exact label match: "${nodeA.label}" ≡ "${nodeB.label}"`,
        });
        continue; // highest confidence — skip lower tiers for this pair
      }

      // ── Tier 2: Synonym dictionary match ─────────────────────────
      if (isSynonymMatch(labelA, labelB)) {
        candidates.push({
          sourceNodeId: nodeA.id,
          targetNodeId: nodeB.id,
          matchScore: SYNONYM_MATCH_SCORE,
          similarityType: "synonym",
          reason: `Synonym dictionary match: "${nodeA.label}" ↔ "${nodeB.label}"`,
        });
        continue; // synonym match is definitive — skip semantic for this pair
      }

      // ── Tier 3: Semantic cosine similarity ───────────────────────
      const vecA = extractNodeEmbedding(nodeA);
      const vecB = extractNodeEmbedding(nodeB);

      if (vecA !== null && vecB !== null) {
        const score = cosineSimilarity(vecA, vecB);
        if (score >= SEMANTIC_SIMILARITY_THRESHOLD) {
          candidates.push({
            sourceNodeId: nodeA.id,
            targetNodeId: nodeB.id,
            matchScore: score,
            similarityType: "semantic",
            reason: `Semantic cosine similarity ${score.toFixed(4)} ≥ ${SEMANTIC_SIMILARITY_THRESHOLD} between "${nodeA.label}" and "${nodeB.label}"`,
          });
        }
      }
    }
  }

  return candidates;
}

// ─────────────────────────────────────────────────────────────────────
// S11 Step 3 — Dry-Run Merge Diff Report
// ─────────────────────────────────────────────────────────────────────

/**
 * Generate a dry-run merge diff report for a candidate entity resolution.
 *
 * Calculates the scope of impact: how many evidence items and edges would
 * need to be re-assigned if the `duplicateNodeIds` were merged into
 * `primaryNodeId`. The report is **read-only** — no data is modified.
 *
 * ### HITL compliance (P4-12):
 * `applied=false` by contract. The returned `DuplicateDetectionResult`
 * is a dry-run preview only. Actual merge requires explicit HITL
 * confirmation in the UI before any DB write occurs.
 *
 * @param primaryNodeId    - ID of the canonical node to merge into.
 * @param duplicateNodeIds - IDs of duplicate nodes to be collapsed.
 * @param allEdgeFromCounts - Optional map of nodeId → outgoing edge count
 *                            (used to compute `edgesToConsolidate`). If
 *                            omitted, counts default to 0 (safe but incomplete).
 * @param allEvidenceCounts - Optional map of nodeId → evidence reference count
 *                            (used to compute `evidencesToReassign`). If
 *                            omitted, counts default to 0.
 * @returns `DuplicateDetectionResult` dry-run diff — never modifies DB.
 *
 * @example
 *   const report = generateDuplicateMergeReport("node-abc", ["node-xyz"]);
 *   // report.mergeDiffSummary.evidencesToReassign → count of items to reassign
 *   // report.mergeDiffSummary.edgesToConsolidate  → count of edges to merge
 */
export function generateDuplicateMergeReport(
  primaryNodeId: string,
  duplicateNodeIds: string[],
  allEdgeFromCounts?: ReadonlyMap<string, number>,
  allEvidenceCounts?: ReadonlyMap<string, number>
): DuplicateDetectionResult {
  // Accumulate impact counts from the duplicate node IDs.
  let evidencesToReassign = 0;
  let edgesToConsolidate = 0;

  for (const dupId of duplicateNodeIds) {
    // Evidence count — number of evidence rows referencing this node.
    evidencesToReassign += allEvidenceCounts?.get(dupId) ?? 0;
    // Edge count — outgoing edges from this node that would need re-pointing.
    edgesToConsolidate += allEdgeFromCounts?.get(dupId) ?? 0;
  }

  // Confidence: average of duplicate node count relative to a scale factor.
  // Simple heuristic: more duplicates = higher confidence that a merge is needed.
  const confidence = Math.min(1.0, duplicateNodeIds.length * 0.25 + 0.5);

  return {
    primaryNodeId,
    duplicateNodeIds,
    confidence,
    mergeDiffSummary: {
      evidencesToReassign,
      edgesToConsolidate,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────
// S11 Step 4 — Entity Resolution Helper
// ─────────────────────────────────────────────────────────────────────

/**
 * Normalize whitespace & casing, then construct a canonical `BIEGraphNode`
 * structure for a candidate text entity.
 *
 * The returned node is **unpersisted** — callers must write it to the
 * graph store via the appropriate repository method. The node ID uses a
 * timestamp-random scheme to avoid collisions in client-only environments
 * without a server-issued UUID.
 *
 * Normalization applied:
 *   - trim leading/trailing whitespace
 *   - collapse internal whitespace runs to a single space
 *   - label casing is preserved (do NOT lowercase labels — they are
 *     human-readable display values, not dictionary keys)
 *
 * @param label    - Entity label text (e.g., "John Doe", "Fear of Failure").
 *                   Empty string produces a node with label "".
 * @param nodeType - Graph node category. Defaults to "Entity".
 * @returns New unpersisted `BIEGraphNode` with generated ID and current timestamps.
 *
 * @example
 *   resolveEntityNode("  Fear  of  Failure  ")
 *     // { id: "bie-node-...", nodeType: "Entity", label: "Fear of Failure", ... }
 */
export function resolveEntityNode(
  label: string,
  nodeType: GraphNodeType = "Entity"
): BIEGraphNode {
  // Normalize: trim + collapse internal whitespace (preserve display casing).
  const normalizedLabel = label.trim().replace(/\s+/g, " ");
  const now = Date.now();

  return {
    id: `bie-node-${now}-${Math.random().toString(36).substring(2, 7)}`,
    nodeType,
    label: normalizedLabel,
    createdAt: now,
    updatedAt: now,
  };
}
