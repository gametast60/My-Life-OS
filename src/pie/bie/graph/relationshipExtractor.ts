// ─────────────────────────────────────────────────────────────────────
// BIE — Relationship Extraction Engine
// Phase 4B S14 — Relationship Extraction Engine
// ─────────────────────────────────────────────────────────────────────
//
// Extracts candidate relationship edges between Knowledge Graph nodes using:
//   1. Evidence co-occurrence analysis (shared BrainEvidence tag links)
//   2. Semantic vector affinity (cosine similarity of embeddings)
//   3. Canonical 6 relationship type classification (supports, conflicts, causes, derived_from, related, opposes)
//
// Structural invariant (P4-12 HITL):
//   All extracted relationships are generated as GraphEdgeProposal objects
//   carrying `applied: false`. They are routed through `appendPendingBieItem`
//   into `bie_pending_queue` awaiting human review. Zero auto-applied writes.
// ─────────────────────────────────────────────────────────────────────

import type { BrainEvidence } from "../../../types";
import type { BrainIntelligenceRepository } from "../BrainIntelligenceRepository";
import type { PendingLearning } from "../types";
import { createPendingEdgeItem, proposeEdge } from "./edgeProposalQueue";
import type { BIEGraphNode, GraphEdgeProposal, GraphEdgeType } from "./types";
import { cosineSimilarity } from "../utils";

/** Options for relationship extraction tuning. */
export interface ExtractRelationshipsOpts {
  /** Minimum evidence co-occurrence count to trigger a candidate edge. Default: 2. */
  minCoOccurrence?: number;
  /** Minimum semantic vector cosine similarity threshold. Default: 0.70. */
  minSemanticSimilarity?: number;
}

/** Keyword maps for heuristics-based edge type classification. */
const CONFLICT_KEYWORDS = ["conflict", "ขัดแย้ง", "ปัญหา", "กลัว", "fear", "anxiety", "กดดัน", "เครียด", "oppose"];
const CAUSE_KEYWORDS = ["because", "สาเหตุ", "ทำให้", "ส่งผล", "cause", "lead to", "เนื่องจาก", "ผลลัพธ์"];
const DERIVED_KEYWORDS = ["learn", "เรียนรู้", "บทเรียน", "lesson", "experience", "ประสบการณ์", "derived", "originate"];

/** Helper to extract numeric embedding array from node metadata if present. */
function getNodeEmbedding(node: BIEGraphNode): number[] | null {
  const emb = node.metadata?.["embedding"];
  if (Array.isArray(emb) && emb.length > 0 && typeof emb[0] === "number") {
    return emb as number[];
  }
  return null;
}

/**
 * Scan graph nodes and evidence items to extract relationship candidates.
 *
 * Evaluates node pairs across 3 extraction mechanisms:
 *   1. **Co-occurrence**: Shared `brainTreeTagIds` in `BrainEvidence` rows.
 *   2. **Semantic Affinity**: Cosine similarity of node embeddings ≥ threshold.
 *   3. **Type Classification**: Maps candidates to one of 6 canonical edge types:
 *      `supports`, `conflicts`, `causes`, `derived_from`, `related`, `opposes`.
 *
 * @param nodes     - Array of BIEGraphNode objects to analyze.
 * @param evidences - Array of BrainEvidence objects to check for co-occurrences.
 * @param opts      - Extraction thresholds & tuning parameters.
 * @returns List of `GraphEdgeProposal` items (all with `applied: false`).
 */
export function extractRelationshipCandidates(
  nodes: BIEGraphNode[],
  evidences: BrainEvidence[] = [],
  opts?: ExtractRelationshipsOpts
): GraphEdgeProposal[] {
  const minCoOccur = opts?.minCoOccurrence ?? 2;
  const minSemSim = opts?.minSemanticSimilarity ?? 0.7;

  const proposals: GraphEdgeProposal[] = [];
  const proposedPairKeys = new Set<string>();

  // ── 1. Co-occurrence Matrix Construction ──────────────────────────
  const coOccurMap = new Map<string, { count: number; evidenceIds: string[] }>();

  for (const ev of evidences) {
    const tagIds = ev.brainTreeTagIds;
    if (!tagIds || tagIds.length < 2) continue;

    for (let i = 0; i < tagIds.length; i++) {
      for (let j = i + 1; j < tagIds.length; j++) {
        const idA = tagIds[i];
        const idB = tagIds[j];
        const key = idA < idB ? `${idA}:::${idB}` : `${idB}:::${idA}`;

        const existing = coOccurMap.get(key) ?? { count: 0, evidenceIds: [] };
        existing.count += 1;
        if (!existing.evidenceIds.includes(ev.id)) {
          existing.evidenceIds.push(ev.id);
        }
        coOccurMap.set(key, existing);
      }
    }
  }

  // Map nodes by ID for fast lookup
  const nodeMap = new Map<string, BIEGraphNode>(nodes.map((n) => [n.id, n]));

  // ── 2. Evaluate Co-occurrence Candidates ──────────────────────────
  for (const [key, info] of coOccurMap.entries()) {
    if (info.count < minCoOccur) continue;

    const [idA, idB] = key.split(":::");
    const nodeA = nodeMap.get(idA);
    const nodeB = nodeMap.get(idB);
    if (!nodeA || !nodeB) continue;

    // Determine edge type based on labels and node kinds
    const edgeType = classifyEdgeType(nodeA, nodeB);
    const confidence = Math.min(0.95, 0.5 + info.count * 0.15);
    const reason = `Co-occurrence in ${info.count} evidence items (${info.evidenceIds.length} unique sources)`;

    const prop = proposeEdge(nodeA.id, nodeB.id, edgeType, confidence, reason);
    proposals.push(prop);
    proposedPairKeys.add(key);
  }

  // ── 3. Evaluate Semantic Affinity Candidates (Vector Cosine) ─────
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const nodeA = nodes[i];
      const nodeB = nodes[j];

      const pairKey = nodeA.id < nodeB.id ? `${nodeA.id}:::${nodeB.id}` : `${nodeB.id}:::${nodeA.id}`;
      if (proposedPairKeys.has(pairKey)) continue; // Already extracted via co-occurrence

      const vecA = getNodeEmbedding(nodeA);
      const vecB = getNodeEmbedding(nodeB);

      if (vecA && vecB) {
        const sim = cosineSimilarity(vecA, vecB);
        if (sim >= minSemSim) {
          const edgeType = classifyEdgeType(nodeA, nodeB);
          const reason = `Semantic vector affinity cosine similarity = ${sim.toFixed(3)}`;

          const prop = proposeEdge(nodeA.id, nodeB.id, edgeType, sim, reason);
          proposals.push(prop);
          proposedPairKeys.add(pairKey);
        }
      }
    }
  }

  return proposals;
}

/**
 * Classify candidate pair into one of 6 canonical edge types:
 * `supports`, `conflicts`, `causes`, `derived_from`, `related`, `opposes`.
 */
function classifyEdgeType(nodeA: BIEGraphNode, nodeB: BIEGraphNode): GraphEdgeType {
  const combinedText = `${nodeA.label} ${nodeA.description ?? ""} ${nodeB.label} ${nodeB.description ?? ""}`.toLowerCase();

  // Check for conflict / opposes
  for (const kw of CONFLICT_KEYWORDS) {
    if (combinedText.includes(kw)) {
      return nodeA.nodeType === "fear" || nodeB.nodeType === "fear" ? "opposes" : "conflicts";
    }
  }

  // Check for causes
  for (const kw of CAUSE_KEYWORDS) {
    if (combinedText.includes(kw)) return "causes";
  }

  // Check for derived_from
  for (const kw of DERIVED_KEYWORDS) {
    if (combinedText.includes(kw) || nodeA.nodeType === "lesson" || nodeB.nodeType === "lesson") {
      return "derived_from";
    }
  }

  // Same dimension or high affinity -> supports
  if (nodeA.dimension && nodeA.dimension === nodeB.dimension) {
    return "supports";
  }

  return "related";
}

/**
 * Route extracted relationship proposals into `bie_pending_queue`.
 * Preserves P4-12 HITL invariant: all proposals carry `applied: false`.
 *
 * @param proposals - Array of GraphEdgeProposal items to queue.
 * @param repo      - BrainIntelligenceRepository instance.
 */
export function routeProposalsToPendingQueue(
  proposals: GraphEdgeProposal[],
  repo: BrainIntelligenceRepository
): void {
  for (const proposal of proposals) {
    const item: PendingLearning = createPendingEdgeItem(proposal);
    repo.appendPendingBieItem(item);
  }
}
