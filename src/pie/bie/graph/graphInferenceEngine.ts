// ─────────────────────────────────────────────────────────────────────
// BIE — Graph Inference & Context Enrichment Engine
// Phase 4B S15 — Graph Context Enrichment & Inference Engine
// ─────────────────────────────────────────────────────────────────────
//
// Features:
//   1. 2-hop Transitive Inference:
//      Infers implicit relationships across 2-edge paths (A → B → C).
//      E.g., "A causes B" + "B conflicts C" ⇒ "A indirect conflicts C".
//   2. Graph Context Enrichment:
//      Formats Knowledge Graph subgraphs & inferred links into structured
//      context text for PIE memory retrieval and LLM prompt enrichment.
//
// Hard Constraints:
//   P4-8  Strict Widening Only — additive additions, zero breaking changes.
//   P4-2  Zero UX/UI change — data-level inference & context formatting only.
//   P4-12 HITL Preserved — 100% read-only views, zero auto-applied DB writes.
// ─────────────────────────────────────────────────────────────────────

import type { BrainIntelligenceRepository } from "../BrainIntelligenceRepository";
import { GraphQueryService } from "./graphQueryService";
import type { GraphEdge, GraphEdgeType, GraphNode } from "../types";

/** Structure representing a 2-hop inferred relationship candidate. */
export interface InferredRelationship {
  fromId: string;
  toId: string;
  inferredType: GraphEdgeType;
  viaNodeId: string;
  confidence: number;
  explanation: string;
}

/**
 * 2-hop Transitive Inference Matrix.
 * Maps (EdgeType1, EdgeType2) → InferredEdgeType
 */
function composeEdgeTypes(type1: GraphEdgeType, type2: GraphEdgeType): GraphEdgeType {
  if (type1 === "causes" && type2 === "causes") return "causes";
  if (type1 === "causes" && type2 === "conflicts") return "conflicts";
  if (type1 === "supports" && type2 === "supports") return "supports";
  if (type1 === "supports" && type2 === "conflicts") return "conflicts";
  if (type1 === "derived_from" && type2 === "derived_from") return "derived_from";
  if (type1 === "opposes" || type2 === "opposes") return "opposes";
  return "related";
}

/**
 * Infer 2-hop transitive relationships across a set of graph edges.
 *
 * Algorithm:
 * Finds paths A → B → C where A !== C and no direct edge A → C exists.
 * Calculates composite confidence = `edge1.confidence * edge2.confidence * 0.85`.
 *
 * @param nodes - List of graph nodes in scope.
 * @param edges - List of graph edges in scope (defaults to appliedOnly if desired by caller).
 * @returns Array of `InferredRelationship` candidates (read-only views).
 */
export function inferTransitiveRelationships(
  nodes: GraphNode[],
  edges: GraphEdge[]
): InferredRelationship[] {
  const nodeMap = new Map<string, GraphNode>(nodes.map((n) => [n.id, n]));
  const directEdgeKeys = new Set<string>();

  // Map direct edges for fast lookup & directional adjacency
  const adj = new Map<string, Array<{ toId: string; edge: GraphEdge }>>();

  for (const edge of edges) {
    directEdgeKeys.add(`${edge.fromId}:::${edge.toId}`);
    directEdgeKeys.add(`${edge.toId}:::${edge.fromId}`);

    // Forward link: fromId → toId
    const fwd = adj.get(edge.fromId) ?? [];
    fwd.push({ toId: edge.toId, edge });
    adj.set(edge.fromId, fwd);

    // Bidirectional/Reverse link if relationship implies affinity
    const rev = adj.get(edge.toId) ?? [];
    rev.push({ toId: edge.fromId, edge });
    adj.set(edge.toId, rev);
  }

  const inferred: InferredRelationship[] = [];
  const inferredKeys = new Set<string>();

  // Scan 2-hop paths A → B → C
  for (const nodeA of nodes) {
    const firstHops = adj.get(nodeA.id) ?? [];

    for (const hop1 of firstHops) {
      const nodeBId = hop1.toId;
      const secondHops = adj.get(nodeBId) ?? [];

      for (const hop2 of secondHops) {
        const nodeCId = hop2.toId;

        // Skip reflexive 2-hops (A → B → A)
        if (nodeCId === nodeA.id) continue;

        const directKey = `${nodeA.id}:::${nodeCId}`;
        const inferredKey = `${nodeA.id}->${nodeBId}->${nodeCId}`;

        // Infer only if no direct edge exists and pair hasn't been emitted
        if (!directEdgeKeys.has(directKey) && !inferredKeys.has(inferredKey)) {
          inferredKeys.add(inferredKey);

          const inferredType = composeEdgeTypes(hop1.edge.type, hop2.edge.type);
          const confidence = Number((hop1.edge.confidence * hop2.edge.confidence * 0.85).toFixed(3));

          const nodeB = nodeMap.get(nodeBId);
          const nodeC = nodeMap.get(nodeCId);
          const bLabel = nodeB ? nodeB.label : nodeBId;
          const cLabel = nodeC ? nodeC.label : nodeCId;

          const explanation = `Transitive 2-hop inference: "${nodeA.label}" ${hop1.edge.type} "${bLabel}" which ${hop2.edge.type} "${cLabel}"`;

          inferred.push({
            fromId: nodeA.id,
            toId: nodeCId,
            inferredType,
            viaNodeId: nodeBId,
            confidence,
            explanation,
          });
        }
      }
    }
  }

  return inferred;
}

/**
 * Format Knowledge Graph context into structured text for PIE memory retrieval.
 *
 * @param seedNodeIds - Focal node IDs to start graph traversal from.
 * @param repo        - BrainIntelligenceRepository instance.
 * @param depth       - Neighbourhood depth (default 1).
 * @returns Formatted markdown string summarizing graph relations & inferences.
 */
export function enrichContextWithGraph(
  seedNodeIds: string[],
  repo: BrainIntelligenceRepository,
  depth = 1
): string {
  if (!seedNodeIds || seedNodeIds.length === 0) return "";

  const queryService = new GraphQueryService(repo);
  const allNodesMap = new Map<string, GraphNode>();
  const allEdgesMap = new Map<string, GraphEdge>();

  // Collect N-hop neighbourhood for each seed node
  for (const seedId of seedNodeIds) {
    const sub = queryService.getNeighbourhood(seedId, depth, false);
    for (const n of sub.nodes) allNodesMap.set(n.id, n);
    for (const e of sub.edges) allEdgesMap.set(e.id, e);
  }

  const nodes = Array.from(allNodesMap.values());
  const edges = Array.from(allEdgesMap.values());

  if (nodes.length === 0) return "";

  const lines: string[] = ["### Knowledge Graph Context:"];

  // Direct edges
  if (edges.length > 0) {
    lines.push("Relationships:");
    for (const edge of edges) {
      const fromNode = allNodesMap.get(edge.fromId) ?? repo.getGraphNode(edge.fromId);
      const toNode = allNodesMap.get(edge.toId) ?? repo.getGraphNode(edge.toId);
      if (fromNode && toNode) {
        const status = edge.applied ? "confirmed" : "suggested";
        lines.push(`- "${fromNode.label}" [${edge.type}] "${toNode.label}" (${status}, confidence: ${edge.confidence})`);
      }
    }
  }

  // Transitive 2-hop inferences
  const inferences = inferTransitiveRelationships(nodes, edges);
  if (inferences.length > 0) {
    lines.push("Inferred Relationships (2-hop):");
    for (const inf of inferences.slice(0, 5)) { // Limit top 5 inferences
      const fromNode = allNodesMap.get(inf.fromId) ?? repo.getGraphNode(inf.fromId);
      const toNode = allNodesMap.get(inf.toId) ?? repo.getGraphNode(inf.toId);
      if (fromNode && toNode) {
        lines.push(`- "${fromNode.label}" [inferred ${inf.inferredType}] "${toNode.label}" (via node ${inf.viaNodeId}, confidence: ${inf.confidence})`);
      }
    }
  }

  return lines.join("\n");
}
