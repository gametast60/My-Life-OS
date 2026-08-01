// ─────────────────────────────────────────────────────────────────────
// BIE — Knowledge Graph Query & Neighbourhood Traversal Service
// Phase 4B S13 — Graph Query & Neighbourhood Traversal
// ─────────────────────────────────────────────────────────────────────
//
// Provides read-only query helpers for Knowledge Graph traversal:
//   1. getNeighbourhood — extract N-hop subgraph around a focal node
//   2. findShortestPath — BFS search for shortest path between two nodes
//   3. getSubgraphByDimension — filter subgraph by LifeDimension
//
// Hard Constraints honored:
//   P4-8  Strict Widening Only — additive functionality, zero breaking changes.
//   P4-2  Zero UX/UI change — pure data query service.
//   P4-12 HITL Preserved — 100% read-only operations, zero DB writes.
// ─────────────────────────────────────────────────────────────────────

import type { LifeDimension } from "../../../types";
import type { BrainIntelligenceRepository } from "../BrainIntelligenceRepository";
import type { GraphEdge, GraphNode, GraphNodeKind } from "../types";

/** Subgraph data container returned by query helpers. */
export interface GraphQueryResult {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/** Result shape for shortest path queries. */
export interface GraphPathResult {
  nodes: GraphNode[];
  edges: GraphEdge[];
  distance: number;
}

/**
 * Service for executing read-only graph queries and traversal over a
 * BrainIntelligenceRepository instance.
 */
export class GraphQueryService {
  private readonly _repo: BrainIntelligenceRepository;

  constructor(repo: BrainIntelligenceRepository) {
    this._repo = repo;
  }

  /**
   * Extract an N-hop neighbourhood subgraph surrounding a focal node.
   *
   * @param nodeId - ID of the target focal node.
   * @param depth  - Traversal depth (default 1 hop). Clamped to [1, 5].
   * @param appliedOnly - If true, consider only confirmed edges (applied=true).
   * @returns `GraphQueryResult` containing all nodes & edges within N hops.
   */
  getNeighbourhood(nodeId: string, depth = 1, appliedOnly = false): GraphQueryResult {
    const maxDepth = Math.min(5, Math.max(1, depth));
    const visitedNodes = new Set<string>([nodeId]);
    const collectedEdges = new Set<GraphEdge>();
    let currentFrontier = [nodeId];

    for (let d = 0; d < maxDepth; d++) {
      const nextFrontier: string[] = [];

      for (const currId of currentFrontier) {
        const edges = this._repo.getGraphEdgesByNode(currId);

        for (const edge of edges) {
          if (appliedOnly && !edge.applied) continue;

          collectedEdges.add(edge);
          const neighborId = edge.fromId === currId ? edge.toId : edge.fromId;

          if (!visitedNodes.has(neighborId)) {
            visitedNodes.add(neighborId);
            nextFrontier.push(neighborId);
          }
        }
      }

      currentFrontier = nextFrontier;
      if (currentFrontier.length === 0) break;
    }

    const nodes: GraphNode[] = [];
    for (const id of visitedNodes) {
      const node = this._repo.getGraphNode(id);
      if (node) nodes.push(node);
    }

    return {
      nodes,
      edges: Array.from(collectedEdges),
    };
  }

  /**
   * Find the shortest path between two graph nodes using Breadth-First Search (BFS).
   *
   * @param fromId - Starting node ID.
   * @param toId   - Target destination node ID.
   * @param appliedOnly - If true, traverse only confirmed edges (applied=true).
   * @returns `GraphPathResult` with distance, nodes, and edges, or `null` if unreachable.
   */
  findShortestPath(fromId: string, toId: string, appliedOnly = false): GraphPathResult | null {
    if (fromId === toId) {
      const startNode = this._repo.getGraphNode(fromId);
      if (!startNode) return null;
      return { nodes: [startNode], edges: [], distance: 0 };
    }

    const queue: Array<{ nodeId: string; pathNodes: string[]; pathEdges: GraphEdge[] }> = [
      { nodeId: fromId, pathNodes: [fromId], pathEdges: [] },
    ];
    const visited = new Set<string>([fromId]);

    while (queue.length > 0) {
      const current = queue.shift()!;

      const connectedEdges = this._repo.getGraphEdgesByNode(current.nodeId);

      for (const edge of connectedEdges) {
        if (appliedOnly && !edge.applied) continue;

        const neighborId = edge.fromId === current.nodeId ? edge.toId : edge.fromId;

        if (neighborId === toId) {
          const fullNodeIds = [...current.pathNodes, toId];
          const fullEdges = [...current.pathEdges, edge];

          const nodes: GraphNode[] = [];
          for (const nid of fullNodeIds) {
            const n = this._repo.getGraphNode(nid);
            if (n) nodes.push(n);
          }

          return {
            nodes,
            edges: fullEdges,
            distance: fullEdges.length,
          };
        }

        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          queue.push({
            nodeId: neighborId,
            pathNodes: [...current.pathNodes, neighborId],
            pathEdges: [...current.pathEdges, edge],
          });
        }
      }
    }

    return null; // No path found
  }

  /**
   * Extract a subgraph containing all nodes associated with a specific LifeDimension,
   * plus all edges connecting nodes within this set.
   *
   * @param dimension - Target LifeDimension.
   * @param appliedOnly - If true, consider only confirmed edges.
   * @returns `GraphQueryResult` for the specified dimension.
   */
  getSubgraphByDimension(dimension: LifeDimension, appliedOnly = false): GraphQueryResult {
    const nodes = this._repo.getGraphNodes({ dimension });
    const nodeSet = new Set(nodes.map((n) => n.id));
    const allEdges = this._repo.getGraphEdges({ appliedOnly });

    const edges = allEdges.filter((e) => nodeSet.has(e.fromId) && nodeSet.has(e.toId));

    return { nodes, edges };
  }

  /**
   * Extract a subgraph containing all nodes of a specific GraphNodeKind,
   * plus connecting edges between them.
   *
   * @param kind - Target GraphNodeKind.
   * @param appliedOnly - If true, consider only confirmed edges.
   * @returns `GraphQueryResult` for the specified kind.
   */
  getSubgraphByKind(kind: GraphNodeKind, appliedOnly = false): GraphQueryResult {
    const nodes = this._repo.getGraphNodes({ kind });
    const nodeSet = new Set(nodes.map((n) => n.id));
    const allEdges = this._repo.getGraphEdges({ appliedOnly });

    const edges = allEdges.filter((e) => nodeSet.has(e.fromId) && nodeSet.has(e.toId));

    return { nodes, edges };
  }
}
