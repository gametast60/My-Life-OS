// ─────────────────────────────────────────────────────────────────────
// BIE — BrainIntelligenceRepository Interface
// Phase 4A S1 — Interface ONLY (no implementation)
// ─────────────────────────────────────────────────────────────────────
//
// Single Source of Truth repository for the BIE sidecar (hard constraint
// P4-7 + the SSOT pattern established in Phase 3 for the Core repo).
//
// Dependency rule: BIE modules call this interface; the implementation
// (RoomBrainIntelligenceRepository — to be added in S4) wraps the
// `bie_*` RoomDatabase tables. BIE modules MUST NOT call RoomDatabase
// `setBie*` directly (mirrors the Phase 3 SSOT rule).
//
// HITL rule (P4-12): every write to a STRUCTURAL table (graph edges,
// identity, applied=true insight) goes through the Pending Queue first.
// Direct applied=true writes from AI are forbidden. Methods below that
// append pending items are the ONLY write surface for BIE structural data.
//
// All methods are declared here even though some tables belong to later
// sub-phases (4B graph, 4D identity/insight/timeline). This lets S1 lock
// the contract; later sub-phases only fill in the implementation.
// ─────────────────────────────────────────────────────────────────────

import type {
  BiePendingKind,
  EmbeddingRecord,
  EntityResolutionCandidate,
  GraphEdge,
  GraphEdgeProposal,
  GraphEdgeType,
  GraphNode,
  GraphNodeKind,
  IdentityProfile,
  IdentityRow,
  Insight,
  InsightKind,
  PendingLearning,
  TimelineItem,
  TimelinePeriodKind,
} from "./types";

// ─────────────────────────────────────────────────────────────────────
// Embedding cache (bie_embeddings) — Phase 4A primary use
// ─────────────────────────────────────────────────────────────────────

import type { LifeDimension } from "../../types";

export interface EmbeddingLookupParams {
  /** Optional nodeId filter. */
  id?: string;
  /** Look up by contentHash (preferred — never regenerate on match). */
  contentHash?: string;
  /** Filter by provider method. */
  method?: EmbeddingRecord["method"];
}

export interface BrainIntelligenceRepository {
  // ─── Embeddings ──────────────────────────────────────────────────
  /** Read embedding cache by contentHash (preferred) or id. */
  getEmbedding(params: EmbeddingLookupParams): EmbeddingRecord | undefined;
  /** Return all cached embeddings (used by vectorIndex for linear scan). */
  getEmbeddings(): EmbeddingRecord[];
  /** Upsert a cached embedding. Keyed by id; contentHash MUST be unique. */
  saveEmbedding(record: EmbeddingRecord): void;
  /** Delete a cached embedding by id. */
  deleteEmbedding(id: string): void;

  // ─── Knowledge Graph nodes (bie_graph_nodes) — Phase 4B ─────────
  getGraphNodes(filter?: { kind?: GraphNodeKind; dimension?: LifeDimension }): GraphNode[];
  getGraphNodesByDimension?(dimension: LifeDimension): GraphNode[];
  getGraphNodesByKind?(kind: GraphNodeKind): GraphNode[];
  getGraphNode(id: string): GraphNode | undefined;
  /** Upsert a node. Non-structural (no HITL) — nodes describe existing tags. */
  saveGraphNode(node: GraphNode): void;
  deleteGraphNode(id: string): void;

  // ─── Knowledge Graph edges (bie_graph_edges) — Phase 4B ─────────
  getGraphEdges(filter?: { type?: GraphEdgeType; appliedOnly?: boolean }): GraphEdge[];
  /** Fetch all graph edges associated with a specific node (either as source or target). */
  getGraphEdgesByNode(nodeId: string): GraphEdge[];
  /**
   * Persist a graph edge. Per P4-12, AI-detected edges are stored with
   * applied=false and routed through the Pending Queue via `appendPending`.
   * This method is the low-level write surface; the high-level, HITL-safe
   * path is `appendPending({ kind: "graph_edge" })`.
   */
  saveGraphEdge(edge: GraphEdge): void;
  /** Mark an edge as User-confirmed (applied=true). Call site = Confirm UI only. */
  applyGraphEdge(id: string): void;
  deleteGraphEdge(id: string): void;
  /** Helper stub: Propose a new edge with enforced applied=false structural invariant. */
  proposeEdge?(fromId: string, toId: string, type: GraphEdgeType, confidence?: number, reason?: string): GraphEdgeProposal;
  /** Helper stub: Find candidate duplicate nodes for entity resolution. */
  findDuplicateCandidates?(): EntityResolutionCandidate[];

  // ─── Identity (bie_identity) — Phase 4D ─────────────────────────
  /** Singleton row (id="singleton"). */
  getIdentity(): IdentityProfile | undefined;
  /** Overwrite the identity aggregate. Per HITL, AI writes use applied=false. */
  saveIdentity(profile: IdentityProfile): void;
  /** Mark the identity profile as User-confirmed. Confirm UI only. */
  applyIdentity(): void;
  /**
   * [Phase 4D S24] Fetch the identity singleton as a DB row (IdentityRow).
   * Returns undefined until the first profile is built and persisted.
   */
  getIdentityProfile(): IdentityRow | undefined;
  /**
   * [Phase 4D S24] Persist an IdentityRow to bie_identity storage.
   * AI callers MUST pass applied=false (P4-12 HITL invariant).
   * Confirm UI may call with applied=true after user review.
   */
  saveIdentityProfile(profile: IdentityRow): void;

  // ─── Insights (bie_insights, FIFO 100) — Phase 4D ───────────────
  getInsights(filter?: { kind?: InsightKind; appliedOnly?: boolean }): Insight[];
  /** Append an insight. Implementations enforce FIFO cap at 100 rows. */
  appendInsight(insight: Insight): void;
  /** Mark an insight as User-confirmed. Confirm UI only. */
  applyInsight(id: string): void;
  /** Drop a rejected insight. Confirm UI only. */
  deleteInsight(id: string): void;

  // ─── Timeline (bie_timeline, cache) — Phase 4D ──────────────────
  getTimelineItems(filter?: { periodKind?: TimelinePeriodKind }): TimelineItem[];
  getTimelineItem(periodKey: string): TimelineItem | undefined;
  /** Upsert a timeline bucket (contentHash-invalidated, rebuildable). */
  saveTimelineItem(item: TimelineItem): void;
  /** Wipe the cache (forces rebuild from current evidence). */
  clearTimeline(): void;

  // ─── Pending Queue (bie_pending_queue) — HITL, cross-phase ──────
  /** All pending items, newest last (createdAt ascending). */
  getPendingBieItems(): PendingLearning[];
  getPendingBieItemsByKind(kind: BiePendingKind): PendingLearning[];
  /** Append a pending item (applied=false by definition). FIFO cap enforced. */
  appendPendingBieItem(item: PendingLearning): void;
  /** Mark a pending item resolved (and apply the underlying change). */
  applyPendingBieItem(id: string): void;
  /** Discard a pending item (user rejected). */
  rejectPendingBieItem(id: string): void;

  // ─── Proposal Helpers — Phase 4D S27 ────────────────────────────
  /** Helper: Propose an identity update into the HITL pending queue (applied=false enforced). */
  proposeIdentityUpdate?(profile: IdentityProfile | IdentityRow, reason?: string): PendingLearning;
  /** Helper: Propose an insight into the HITL pending queue (applied=false enforced). */
  proposeInsightProposal?(insight: Insight, reason?: string): PendingLearning;
}
