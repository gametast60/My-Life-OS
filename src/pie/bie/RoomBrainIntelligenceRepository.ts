// ─────────────────────────────────────────────────────────────────────
// BIE — RoomBrainIntelligenceRepository
// Phase 4A S4 — Repository Implementation (RoomDatabase/localStorage)
// Phase 4B S12 — Graph Persistence (bie_graph_nodes + bie_graph_edges)
// ─────────────────────────────────────────────────────────────────────
//
// Single Source of Truth (SSOT) repository for the BIE sidecar, mirroring
// the Phase 3 pattern of `RoomBrainRepository` for the Core Brain Tree.
//
// Implements the S1 `BrainIntelligenceRepository` interface in full.
// Per the 4A scope, ONLY the following two areas have ACTUAL storage:
//   1. Embeddings        (bie_embeddings — persistent cache, P4-10)
//   2. Pending Queue     (bie_pending_queue — HITL structural changes)
//
// The remaining five areas have type-safe placeholder implementations
// that return empty/undefined values rather than throwing, so that the
// build succeeds and downstream callers can rely on the full method
// surface being present. Their real storage lands in later sub-phases:
//   Graph Nodes / Edges → Phase 4B
//   Identity / Insights / Timeline → Phase 4D
//
// Hard constraints honored:
//   P4-7  BIE never imports PIE layers (only types from S1/S2).
//   P4-12 HITL: write surface for structural data is appendPendingBieItem()
//         only; apply*() / reject*() are reserved for the Confirm UI.
//   P4-8  All signatures match the S1 interface exactly (no changes).
//   P4-10 Embeddings are cache-keyed by contentHash (S2); callers of
//         getEmbedding({ contentHash }) can trust a hit means "no
//         regeneration needed".
//
// Zero consumers yet (wiring lands in S6). This file is deliberately
// unimported by the rest of the codebase in Phase 4A.
// ─────────────────────────────────────────────────────────────────────

import { RoomDatabase } from "../../lib/db";
import type {
  BrainIntelligenceRepository,
  EmbeddingLookupParams,
} from "./BrainIntelligenceRepository";
import type {
  BiePendingKind,
  EmbeddingMethod,
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
  InsightRow,
  PendingLearning,
  TimelineItem,
  TimelinePeriodKind,
  TimelineRow,
} from "./types";
import type { LifeDimension } from "../../types";
import { proposeEdge as createGraphEdgeProposal, findDuplicateCandidates as findGraphDuplicates, createPendingEdgeItem } from "./graph";

/**
 * FIFO capacity for the BIE pending queue. Matches the PIE-core pending
 * learning queue cap of 100 rows; keeps memory footprint bounded for a
 * per-user personal-scale app.
 */
const PENDING_QUEUE_FIFO_CAP = 100;

/**
 * RoomDatabase-backed implementation of the BIE repository interface.
 *
 * Two of the seven sub-areas have real persistent storage for Phase 4A:
 * Embeddings (cache) and the cross-phase HITL Pending Queue. The other
 * five areas (Graph / Identity / Insights / Timeline) return empty
 * type-safe results until their respective sub-phases ship storage.
 *
 * The class carries no mutable state of its own; every read/write goes
 * through `RoomDatabase` so the repository remains a pure adapter.
 */
export class RoomBrainIntelligenceRepository implements BrainIntelligenceRepository {
  // ────────────────────────────────────────────────────────────────
  // 1. Embeddings — bie_embeddings (Phase 4A — REAL STORAGE)
  //    Persistent embedding cache; never regenerate when contentHash
  //    matches (P4-10). Upsert keyed by record.id.
  // ────────────────────────────────────────────────────────────────

  /**
   * Look up a single cached embedding by id, contentHash, or provider
   * method (any combination, AND semantics).
   *
   * @param params — Optional filters. If all omitted, returns
   *                 `undefined` (caller should use `getEmbeddings` for
   *                 the full set).
   * @returns The first matching `EmbeddingRecord`, or `undefined` if
   *          no row matches the supplied filters.
   *
   * @failure-mode Non-fatal: malformed storage rows are silently
   *               skipped by RoomDatabase deserialization (no throw).
   */
  getEmbedding(params: EmbeddingLookupParams): EmbeddingRecord | undefined {
    const all = RoomDatabase.getBieEmbeddings();
    const { id, contentHash, method } = params;
    return all.find((row) => {
      if (id !== undefined && row.id !== id) return false;
      if (contentHash !== undefined && row.contentHash !== contentHash) return false;
      if (method !== undefined && row.method !== method) return false;
      return true;
    });
  }

  /**
   * Return every cached embedding row. Used by `vectorIndex` (S5) to
   * run the full linear cosine scan over the user's Brain Tree tags.
   *
   * @returns Fresh array snapshot of the full cache (never the
   *          internal storage reference). Empty array on first run.
   */
  getEmbeddings(): EmbeddingRecord[] {
    return RoomDatabase.getBieEmbeddings().slice();
  }

  /**
   * Upsert a cached embedding into `bie_embeddings`.
   *
   * Keyed by `record.id`; if a row with the same id already exists it
   * is replaced in place (allows overwrite when contentHash changes
   * and the caller decides to refresh the vector).
   *
   * @param record — Valid `EmbeddingRecord` per S1 schema. Caller is
   *                 responsible for computing `contentHash` via S2
   *                 `contentHash()` before saving; the repository
   *                 does not re-hash to avoid double-work.
   *
   * @failure-mode Storage write failures (e.g. localStorage quota)
   *               are swallowed by `RoomDatabase.set` with a
   *               console.error (throw-safe).
   */
  saveEmbedding(record: EmbeddingRecord): void {
    const all = RoomDatabase.getBieEmbeddings();
    const idx = all.findIndex((r) => r.id === record.id);
    if (idx === -1) {
      all.push(record);
    } else {
      all[idx] = record;
    }
    RoomDatabase.saveBieEmbeddings(all);
  }

  /**
   * Remove one cached embedding row by id. No-op if the id is absent.
   *
   * @param id — Primary key (typically a `brainTreeTagId` or custom
   *             BIE node id).
   */
  deleteEmbedding(id: string): void {
    const all = RoomDatabase.getBieEmbeddings();
    const next = all.filter((r) => r.id !== id);
    if (next.length !== all.length) {
      RoomDatabase.saveBieEmbeddings(next);
    }
  }

  // ────────────────────────────────────────────────────────────────
  // 2. Knowledge Graph Nodes — bie_graph_nodes (Phase 4B — REAL STORAGE)
  // ────────────────────────────────────────────────────────────────

  /**
   * Return all graph nodes, optionally filtered by node kind and/or dimension.
   *
   * @param filter.kind      — Optional node-kind filter.
   * @param filter.dimension — Optional dimension filter.
   * @returns Snapshot of persisted GraphNode rows. Empty array on first run.
   */
  getGraphNodes(filter?: { kind?: GraphNodeKind; dimension?: LifeDimension }): GraphNode[] {
    let all = RoomDatabase.getBieGraphNodes();
    if (filter?.kind) {
      all = all.filter((n) => n.kind === filter.kind);
    }
    if (filter?.dimension) {
      all = all.filter((n) => n.dimension === filter.dimension);
    }
    return all;
  }

  /**
   * Helper: Get graph nodes belonging to a specific LifeDimension.
   */
  getGraphNodesByDimension(dimension: LifeDimension): GraphNode[] {
    return this.getGraphNodes({ dimension });
  }

  /**
   * Helper: Get graph nodes belonging to a specific GraphNodeKind.
   */
  getGraphNodesByKind(kind: GraphNodeKind): GraphNode[] {
    return this.getGraphNodes({ kind });
  }

  /**
   * Fetch a single graph node by id.
   *
   * @param id — Node primary key.
   * @returns The matching GraphNode, or `undefined` if not found.
   */
  getGraphNode(id: string): GraphNode | undefined {
    return RoomDatabase.getBieGraphNodes().find((n) => n.id === id);
  }

  /**
   * Upsert a graph node into `bie_graph_nodes`.
   * Nodes are non-structural (describe existing tags); no HITL required.
   *
   * @param node — GraphNode payload. Keyed by id; existing rows are replaced.
   */
  saveGraphNode(node: GraphNode): void {
    const all = RoomDatabase.getBieGraphNodes();
    const idx = all.findIndex((n) => n.id === node.id);
    if (idx === -1) {
      all.push(node);
    } else {
      all[idx] = node;
    }
    RoomDatabase.saveBieGraphNodes(all);
  }

  /**
   * Remove a graph node by id. Also removes all edges connected to this node
   * to preserve referential consistency.
   *
   * @param id — Node primary key.
   */
  deleteGraphNode(id: string): void {
    const nodes = RoomDatabase.getBieGraphNodes();
    const next = nodes.filter((n) => n.id !== id);
    if (next.length !== nodes.length) {
      RoomDatabase.saveBieGraphNodes(next);
      // Cascade: drop edges connected to this node.
      const edges = RoomDatabase.getBieGraphEdges();
      const nextEdges = edges.filter((e) => e.fromId !== id && e.toId !== id);
      if (nextEdges.length !== edges.length) {
        RoomDatabase.saveBieGraphEdges(nextEdges);
      }
    }
  }

  // ────────────────────────────────────────────────────────────────
  // 3. Knowledge Graph Edges — bie_graph_edges (Phase 4B — REAL STORAGE)
  // ────────────────────────────────────────────────────────────────

  /**
   * Fetch all graph edges, optionally filtered by type and/or applied status.
   *
   * @param filter.type        — Optional edge-type filter.
   * @param filter.appliedOnly — When true, return only confirmed (applied=true) edges.
   * @returns Snapshot of matching GraphEdge rows.
   */
  getGraphEdges(filter?: { type?: GraphEdgeType; appliedOnly?: boolean }): GraphEdge[] {
    let all = RoomDatabase.getBieGraphEdges();
    if (filter?.type) {
      all = all.filter((e) => e.type === filter.type);
    }
    if (filter?.appliedOnly) {
      all = all.filter((e) => e.applied === true);
    }
    return all;
  }

  /**
   * Low-level edge write. Per P4-12, AI-detected edges MUST go
   * through `appendPendingBieItem` first and reach this method only
   * from the Confirm UI (caller responsibility).
   *
   * Upsert by id: replaces an existing edge if id matches.
   *
   * @param edge — GraphEdge payload.
   */
  saveGraphEdge(edge: GraphEdge): void {
    const all = RoomDatabase.getBieGraphEdges();
    const idx = all.findIndex((e) => e.id === edge.id);
    if (idx === -1) {
      all.push(edge);
    } else {
      all[idx] = edge;
    }
    RoomDatabase.saveBieGraphEdges(all);
  }

  /**
   * Confirm UI exclusive: flip an edge's `applied` flag to true.
   * Idempotent — no-op if edge id is not found.
   *
   * @param id — Edge primary key.
   */
  applyGraphEdge(id: string): void {
    const all = RoomDatabase.getBieGraphEdges();
    const idx = all.findIndex((e) => e.id === id);
    if (idx !== -1 && !all[idx].applied) {
      all[idx] = { ...all[idx], applied: true };
      RoomDatabase.saveBieGraphEdges(all);
    }
  }

  /**
   * Remove a graph edge (e.g. user rejected suggestion). Idempotent.
   *
   * @param id — Edge primary key.
   */
  deleteGraphEdge(id: string): void {
    const all = RoomDatabase.getBieGraphEdges();
    const next = all.filter((e) => e.id !== id);
    if (next.length !== all.length) {
      RoomDatabase.saveBieGraphEdges(next);
    }
  }

  /**
   * Fetch all graph edges where the given node is the source OR target.
   * Useful for building neighbourhood sub-graphs.
   *
   * @param nodeId — Target node primary key.
   * @returns All edges connected to nodeId.
   */
  getGraphEdgesByNode(nodeId: string): GraphEdge[] {
    return RoomDatabase.getBieGraphEdges().filter(
      (e) => e.fromId === nodeId || e.toId === nodeId
    );
  }

  /**
   * Helper stub: Construct a GraphEdgeProposal with enforced `applied: false` HITL invariant.
   */
  proposeEdge(
    fromId: string,
    toId: string,
    type: GraphEdgeType,
    confidence = 0.8,
    reason = "AI-suggested relationship"
  ): GraphEdgeProposal {
    return createGraphEdgeProposal(fromId, toId, type, confidence, reason);
  }

  /**
   * Helper stub: Return entity resolution duplicate candidates.
   */
  findDuplicateCandidates(): EntityResolutionCandidate[] {
    return findGraphDuplicates([]);
  }

  /**
   * S12 Step 4: HITL-safe helper that wraps duplicate candidates into
   * pending-queue proposals (applied=false invariant P4-12).
   * Converts each EntityResolutionCandidate into a PendingLearning
   * "graph_merge" proposal and appends to the queue.
   *
   * @param candidates — Output of `findDuplicateCandidates`.
   */
  proposeDuplicateMerges(
    candidates: EntityResolutionCandidate[]
  ): void {
    for (const candidate of candidates) {
      const proposal = createGraphEdgeProposal(
        candidate.sourceNodeId,
        candidate.targetNodeId,
        "related",
        candidate.matchScore,
        `[${candidate.similarityType}] ${candidate.reason}`
      );
      const pendingItem = createPendingEdgeItem(proposal);
      // Override kind to graph_merge for HITL review queue distinction.
      this.appendPendingBieItem({ ...pendingItem, kind: "graph_merge" });
    }
  }

  // ────────────────────────────────────────────────────────────────
  // 4. Identity — bie_identity (Phase 4D — REAL STORAGE S24)
  //    Singleton row (id="singleton"). AI writes applied=false (P4-12);
  //    Confirm UI calls applyIdentity() to flip applied=true.
  // ────────────────────────────────────────────────────────────────

  /**
   * Fetch the identity singleton from bie_identity storage.
   * Returns undefined until the first profile has been built and persisted.
   *
   * @returns Stored IdentityProfile (applied may be true or false), or undefined.
   */
  getIdentity(): IdentityProfile | undefined {
    const row = RoomDatabase.getBieIdentity();
    if (!row) return undefined;
    // Row has `applied: boolean`; cast to IdentityProfile which has `applied: false`
    // only for freshly-built profiles. Safe cast — consumer checks applied flag.
    return row as unknown as IdentityProfile;
  }

  /**
   * Persist the identity singleton to bie_identity storage.
   * Per P4-12 HITL, AI-generated profiles MUST pass `applied: false`.
   * Only the Confirm UI may subsequently call `applyIdentity()`.
   *
   * @param profile — IdentityProfile with applied=false (domain type enforces this).
   */
  saveIdentity(profile: IdentityProfile): void {
    // Domain type has applied: false (readonly literal); cast to IdentityRow for DB.
    const row: IdentityRow = { ...profile, applied: false };
    RoomDatabase.saveBieIdentity(row);
  }

  /**
   * Confirm UI exclusive: flip the identity singleton's applied flag to true.
   * Idempotent — no-op if no identity row exists.
   */
  applyIdentity(): void {
    const current = RoomDatabase.getBieIdentity();
    if (current && !current.applied) {
      RoomDatabase.saveBieIdentity({ ...current, applied: true });
    }
  }

  /**
   * [Phase 4D S24] Fetch the raw IdentityRow from bie_identity storage.
   * Preferred over getIdentity() when the caller needs the mutable
   * `applied: boolean` field (e.g. Confirm UI, temporal compare).
   *
   * @returns The stored IdentityRow, or undefined if none exists.
   */
  getIdentityProfile(): IdentityRow | undefined {
    return RoomDatabase.getBieIdentity();
  }

  /**
   * [Phase 4D S24] Persist an IdentityRow directly to bie_identity storage.
   * AI callers MUST pass applied=false (P4-12 HITL invariant).
   * Confirm UI may call with applied=true after user review.
   *
   * @param profile — IdentityRow to persist (keyed by id="singleton").
   */
  saveIdentityProfile(profile: IdentityRow): void {
    RoomDatabase.saveBieIdentity(profile);
  }

  // ────────────────────────────────────────────────────────────────
  // 5. Insights — bie_insights (Phase 4D — REAL STORAGE S25, FIFO 100)
  //    All AI-generated insights stored with applied=false (P4-12).
  //    applyInsight() / deleteInsight() are Confirm UI exclusives.
  // ────────────────────────────────────────────────────────────────

  /** FIFO cap for bie_insights. Hard limit per spec. */
  private static readonly INSIGHT_FIFO_CAP = 100;

  /**
   * List stored InsightRows, optionally filtered by kind and/or applied status.
   * Bridges the legacy `Insight` / `InsightKind` interface contract (S1) with
   * the canonical `InsightRow` storage format (S23 identity types).
   *
   * @param filter.kind        — Optional insight kind filter (maps InsightKind →
   *                             InsightRow.type via string equality for shared values).
   * @param filter.appliedOnly — When true, returns only confirmed rows.
   */
  getInsights(filter?: { kind?: InsightKind; appliedOnly?: boolean }): Insight[] {
    let rows: InsightRow[] = RoomDatabase.getBieInsights();
    if (filter?.appliedOnly) {
      rows = rows.filter((r) => r.applied === true);
    }
    if (filter?.kind) {
      // InsightKind and InsightType overlap on: "pattern", "milestone".
      // For forward compat, do a loose string match.
      rows = rows.filter((r) => (r.type as string) === filter.kind);
    }
    // Adapt InsightRow → Insight (legacy interface shape).
    return rows.map(
      (r): Insight => ({
        id: r.id,
        kind: r.type as unknown as InsightKind,
        title: r.title,
        description: r.description,
        severity: "info",
        dataContext: r.dataContext,
        confidence: r.confidence,
        generatedAt: r.generatedAt,
        applied: r.applied,
      })
    );
  }

  /**
   * Append one InsightRow to bie_insights with FIFO 100 cap enforcement.
   * Accepts the legacy `Insight` shape (S1 interface); converts to `InsightRow`
   * for canonical storage.
   *
   * Per P4-12: AI path MUST supply insight with applied=false.
   * This method does NOT validate — caller responsibility.
   *
   * @param insight — Insight payload (legacy Insight interface shape).
   */
  appendInsight(insight: Insight): void {
    const row: InsightRow = {
      id: insight.id,
      type: insight.kind as unknown as InsightRow["type"],
      title: insight.title,
      description: insight.description,
      confidence: insight.confidence,
      dataContext: insight.dataContext,
      generatedAt: insight.generatedAt,
      applied: insight.applied,
    };
    const current = RoomDatabase.getBieInsights();
    const next = [...current, row].slice(-RoomBrainIntelligenceRepository.INSIGHT_FIFO_CAP);
    RoomDatabase.saveBieInsights(next);
  }

  /**
   * Confirm UI exclusive: flip one insight's applied flag to true.
   * Idempotent — no-op if id not found.
   *
   * @param id — Insight primary key.
   */
  applyInsight(id: string): void {
    const rows = RoomDatabase.getBieInsights();
    const idx = rows.findIndex((r) => r.id === id);
    if (idx !== -1 && !rows[idx].applied) {
      rows[idx] = { ...rows[idx], applied: true };
      RoomDatabase.saveBieInsights(rows);
    }
  }

  /**
   * Confirm UI exclusive: drop a rejected insight. Idempotent.
   *
   * @param id — Insight primary key.
   */
  deleteInsight(id: string): void {
    const rows = RoomDatabase.getBieInsights();
    const next = rows.filter((r) => r.id !== id);
    if (next.length !== rows.length) {
      RoomDatabase.saveBieInsights(next);
    }
  }

  // ────────────────────────────────────────────────────────────────
  // 6. Timeline — bie_timeline (Phase 4D — REAL STORAGE S26)
  //    Rebuildable timeline cache buckets (contentHash-keyed).
  //    No HITL needed since this is a pure cache.
  // ────────────────────────────────────────────────────────────────

  /**
   * List cached timeline buckets. Optional period-kind granularity filter.
   *
   * @param filter.periodKind — "month" | "quarter" | "year".
   * @returns Snapshot of timeline entries matching the granularity filter.
   */
  getTimelineItems(filter?: { periodKind?: TimelinePeriodKind }): TimelineItem[] {
    let list = RoomDatabase.getBieTimeline();
    if (filter?.periodKind) {
      list = list.filter((item) => item.granularity === filter.periodKind);
    }
    // Cast/Map safely to TimelineItem
    return list.map((item) => ({
      periodKey: item.periodKey,
      periodKind: item.granularity as TimelinePeriodKind,
      themeBreakdown: item.themeBreakdown.map((t) => ({
        dimension: t.dimension,
        percent: t.percent,
        tagIds: t.tagIds,
      })),
      milestones: item.milestones.map((m) => ({
        id: m.id,
        label: m.label,
        occurredAt: m.occurredAt,
        dimension: m.dimension,
      })),
      generatedAt: item.generatedAt,
      contentHash: item.contentHash,
    }));
  }

  /**
   * Fetch one timeline bucket by periodKey (e.g. "2026-Q2").
   *
   * @param periodKey — Bucket primary key.
   * @returns The matching TimelineItem, or undefined if not found.
   */
  getTimelineItem(periodKey: string): TimelineItem | undefined {
    const list = RoomDatabase.getBieTimeline();
    const item = list.find((r) => r.periodKey === periodKey);
    if (!item) return undefined;
    return {
      periodKey: item.periodKey,
      periodKind: item.granularity as TimelinePeriodKind,
      themeBreakdown: item.themeBreakdown.map((t) => ({
        dimension: t.dimension,
        percent: t.percent,
        tagIds: t.tagIds,
      })),
      milestones: item.milestones.map((m) => ({
        id: m.id,
        label: m.label,
        occurredAt: m.occurredAt,
        dimension: m.dimension,
      })),
      generatedAt: item.generatedAt,
      contentHash: item.contentHash,
    };
  }

  /**
   * Upsert one timeline cache bucket.
   *
   * @param item — Timeline cache row.
   */
  saveTimelineItem(item: TimelineItem): void {
    const list = RoomDatabase.getBieTimeline();
    const row: TimelineRow = {
      periodKey: item.periodKey,
      granularity: item.periodKind as any,
      themeBreakdown: item.themeBreakdown.map((t) => ({
        dimension: t.dimension,
        percent: t.percent,
        tagIds: t.tagIds,
      })),
      milestones: item.milestones.map((m) => ({
        id: m.id,
        label: m.label,
        occurredAt: m.occurredAt,
        dimension: m.dimension,
      })),
      generatedAt: item.generatedAt,
      contentHash: item.contentHash,
    };
    const idx = list.findIndex((r) => r.periodKey === item.periodKey);
    if (idx === -1) {
      list.push(row);
    } else {
      list[idx] = row;
    }
    RoomDatabase.saveBieTimeline(list);
  }

  /**
   * Wipe the entire timeline cache to force rebuild.
   */
  clearTimeline(): void {
    RoomDatabase.saveBieTimeline([]);
  }

  // ────────────────────────────────────────────────────────────────
  // 7. Pending Queue — bie_pending_queue (Phase 4A — REAL STORAGE)
  //    HITL cross-phase queue. Every BIE structural change (graph
  //    edges, merges, identity updates, insights) lands HERE first
  //    as `applied = false` and waits for the Confirm UI. This is the
  //    ONLY write path for BIE structural data that AI modules may
  //    call directly (P4-12).
  // ────────────────────────────────────────────────────────────────

  /**
   * Return all pending BIE items, sorted ascending by `createdAt`
   * (oldest first). The S1 contract guarantees order "newest last".
   *
   * @returns Fresh array snapshot (never the storage reference).
   *          Empty array on first run.
   */
  getPendingBieItems(): PendingLearning[] {
    return RoomDatabase.getBiePendingQueue()
      .slice()
      .sort((a, b) => a.createdAt - b.createdAt);
  }

  /**
   * Return pending items filtered to a specific structural-change
   * kind (e.g. "graph_edge" suggestions from the 4B relationship
   * engine, or "insight" rows from the 4D insight generator).
   *
   * @param kind — One of `BiePendingKind` union values.
   * @returns Filtered snapshot; `[]` if no rows of that kind exist.
   */
  getPendingBieItemsByKind(kind: BiePendingKind): PendingLearning[] {
    return this.getPendingBieItems().filter((row) => row.kind === kind);
  }

  /**
   * Append a HITL pending item. This is the SOLE entry point BIE
   * modules use to propose structural changes. Enforces a global
   * FIFO cap of {@link PENDING_QUEUE_FIFO_CAP} rows so the queue
   * cannot grow unbounded if the Confirm UI has not been built yet.
   *
   * @param item — Valid `PendingLearning` payload. `applied` is
   *               structurally false by definition (the type omits
   *               the field); repository re-checks nothing.
   *
   * @failure-mode Storage write errors are swallowed by RoomDatabase;
   *               the method never throws.
   */
  appendPendingBieItem(item: PendingLearning): void {
    const current = RoomDatabase.getBiePendingQueue();
    const next = [...current, item].slice(-PENDING_QUEUE_FIFO_CAP);
    RoomDatabase.saveBiePendingQueue(next);
  }

  /**
   * Confirm UI exclusive: resolve a pending item and apply the
   * underlying change.
   *
   * Executes real side effects based on `item.kind`:
   * - `identity_update`: saves payload to `bie_identity` with `applied: true`.
   * - `insight_proposal` / `insight`: appends payload to `bie_insights` with `applied: true`.
   * - `graph_edge`: applies edge in `bie_graph_edges` with `applied: true`.
   *
   * Contract: idempotent — calling apply on an already-absent id is
   * a harmless no-op.
   *
   * @param id — Pending item primary key.
   */
  applyPendingBieItem(id: string): void {
    const current = RoomDatabase.getBiePendingQueue();
    const item = current.find((row) => row.id === id);

    if (item) {
      // Execute side effects based on pending item kind
      if (item.kind === "identity_update" && item.payload) {
        const profile = item.payload as unknown as IdentityRow;
        if (profile.id) {
          this.saveIdentityProfile({ ...profile, applied: true });
        }
      } else if ((item.kind === "insight_proposal" || item.kind === "insight") && item.payload) {
        const insight = item.payload as unknown as Insight;
        if (insight.id) {
          this.appendInsight({ ...insight, applied: true });
        }
      } else if (item.kind === "graph_edge" && item.payload) {
        const edgeId = (item.payload.id as string) || (item.payload.edgeId as string);
        if (edgeId) {
          this.applyGraphEdge(edgeId);
        } else if (item.payload.fromId && item.payload.toId) {
          this.saveGraphEdge({ ...(item.payload as unknown as GraphEdge), applied: true });
        }
      }

      // Remove item from pending queue
      const next = current.filter((row) => row.id !== id);
      RoomDatabase.saveBiePendingQueue(next);
    }
  }

  /**
   * Confirm UI exclusive: user rejected a pending item. Simply
   * drops the row from the queue without applying any structural
   * side effects. Idempotent.
   *
   * @param id — Pending item primary key.
   */
  rejectPendingBieItem(id: string): void {
    const current = RoomDatabase.getBiePendingQueue();
    const next = current.filter((row) => row.id !== id);
    if (next.length !== current.length) {
      RoomDatabase.saveBiePendingQueue(next);
    }
  }

  /**
   * Helper: Propose an identity update into the HITL pending queue (`applied: false` enforced).
   */
  proposeIdentityUpdate(
    profile: IdentityProfile | IdentityRow,
    reason = "AI-suggested identity update"
  ): PendingLearning {
    const item: PendingLearning = {
      id: `bie-pend-id-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      kind: "identity_update",
      payload: { ...profile, applied: false },
      reason,
      confidence: 0.85,
      createdAt: Date.now(),
    };
    this.appendPendingBieItem(item);
    return item;
  }

  /**
   * Helper: Propose an insight into the HITL pending queue (`applied: false` enforced).
   */
  proposeInsightProposal(
    insight: Insight,
    reason = "AI-generated insight proposal"
  ): PendingLearning {
    const item: PendingLearning = {
      id: `bie-pend-ins-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      kind: "insight_proposal",
      payload: { ...insight, applied: false },
      reason,
      confidence: insight.confidence ?? 0.8,
      createdAt: Date.now(),
    };
    this.appendPendingBieItem(item);
    return item;
  }
}


