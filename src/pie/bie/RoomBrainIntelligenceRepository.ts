// ─────────────────────────────────────────────────────────────────────
// BIE — RoomBrainIntelligenceRepository
// Phase 4A S4 — Repository Implementation (RoomDatabase/localStorage)
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
  GraphEdge,
  GraphEdgeType,
  GraphNode,
  GraphNodeKind,
  IdentityProfile,
  Insight,
  InsightKind,
  PendingLearning,
  TimelineItem,
  TimelinePeriodKind,
} from "./types";

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
  // 2. Knowledge Graph Nodes — bie_graph_nodes (Phase 4B — PLACEHOLDER)
  // ────────────────────────────────────────────────────────────────

  /**
   * [Placeholder — Phase 4B storage planned]
   * Return all graph nodes, optionally filtered by node kind.
   * Current implementation: always returns `[]` until 4B ships.
   *
   * @param filter.kind — Optional node-kind filter.
   * @returns Empty array (GraphNode[] shape for downstream type safety).
   */
  getGraphNodes(filter?: { kind?: GraphNodeKind }): GraphNode[] {
    void filter;
    return [];
  }

  /**
   * [Placeholder — Phase 4B storage planned]
   * Fetch a single graph node by id.
   *
   * @param id — Node primary key.
   * @returns `undefined` (GraphNode | undefined shape preserved).
   */
  getGraphNode(id: string): GraphNode | undefined {
    void id;
    return undefined;
  }

  /**
   * [Placeholder — Phase 4B storage planned]
   * Upsert a graph node. No-op in 4A; method signature exists so
   * later sub-phases only need to fill in storage logic.
   *
   * @param node — GraphNode payload.
   */
  saveGraphNode(node: GraphNode): void {
    void node;
  }

  /**
   * [Placeholder — Phase 4B storage planned]
   * Delete a graph node. No-op in 4A.
   *
   * @param id — Node primary key.
   */
  deleteGraphNode(id: string): void {
    void id;
  }

  // ────────────────────────────────────────────────────────────────
  // 3. Knowledge Graph Edges — bie_graph_edges (Phase 4B — PLACEHOLDER)
  // ────────────────────────────────────────────────────────────────

  /**
   * [Placeholder — Phase 4B storage planned]
   * Fetch all graph edges, optionally filtered by type and/or applied
   * status. Returns `[]` in 4A.
   *
   * @param filter.type       — Optional edge-type filter.
   * @param filter.appliedOnly — When true, return only edges with
   *                             `applied === true`; otherwise return
   *                             all rows.
   */
  getGraphEdges(filter?: { type?: GraphEdgeType; appliedOnly?: boolean }): GraphEdge[] {
    void filter;
    return [];
  }

  /**
   * [Placeholder — Phase 4B storage planned]
   * Low-level edge write. Per P4-12, AI-detected edges MUST go
   * through `appendPendingBieItem` first and reach this method only
   * from the Confirm UI (caller responsibility).
   *
   * @param edge — GraphEdge payload.
   */
  saveGraphEdge(edge: GraphEdge): void {
    void edge;
  }

  /**
   * [Placeholder — Phase 4B storage planned]
   * Confirm UI exclusive: flip an edge's `applied` flag to true.
   * No-op in 4A.
   *
   * @param id — Edge primary key.
   */
  applyGraphEdge(id: string): void {
    void id;
  }

  /**
   * [Placeholder — Phase 4B storage planned]
   * Remove a graph edge (e.g. user rejected suggestion). No-op in 4A.
   *
   * @param id — Edge primary key.
   */
  deleteGraphEdge(id: string): void {
    void id;
  }

  // ────────────────────────────────────────────────────────────────
  // 4. Identity — bie_identity (Phase 4D — PLACEHOLDER)
  // ────────────────────────────────────────────────────────────────

  /**
   * [Placeholder — Phase 4D storage planned]
   * Fetch the identity singleton (one row per user, id="singleton").
   *
   * @returns `undefined` until 4D writes the first profile.
   */
  getIdentity(): IdentityProfile | undefined {
    return undefined;
  }

  /**
   * [Placeholder — Phase 4D storage planned]
   * Overwrite the identity singleton. Per HITL, AI calls save with
   * `applied = false`; the Confirm UI calls `applyIdentity()` later.
   *
   * @param profile — Full identity profile payload.
   */
  saveIdentity(profile: IdentityProfile): void {
    void profile;
  }

  /**
   * [Placeholder — Phase 4D storage planned]
   * Confirm UI exclusive: mark the identity row `applied = true`.
   * No-op in 4A.
   */
  applyIdentity(): void {
    // No-op.
  }

  // ────────────────────────────────────────────────────────────────
  // 5. Insights — bie_insights (Phase 4D — PLACEHOLDER, FIFO 100)
  // ────────────────────────────────────────────────────────────────

  /**
   * [Placeholder — Phase 4D storage planned]
   * List stored insights, optionally filtered by kind and/or applied
   * status. Returns `[]` in 4A.
   *
   * @param filter.kind        — Optional insight-kind filter.
   * @param filter.appliedOnly — When true, applied-only rows.
   */
  getInsights(filter?: { kind?: InsightKind; appliedOnly?: boolean }): Insight[] {
    void filter;
    return [];
  }

  /**
   * [Placeholder — Phase 4D storage planned]
   * Append one insight row. Implementations enforce FIFO cap = 100.
   * No-op in 4A.
   *
   * @param insight — Insight payload.
   */
  appendInsight(insight: Insight): void {
    void insight;
  }

  /**
   * [Placeholder — Phase 4D storage planned]
   * Confirm UI exclusive: flip `applied = true` for one insight.
   * No-op in 4A.
   *
   * @param id — Insight primary key.
   */
  applyInsight(id: string): void {
    void id;
  }

  /**
   * [Placeholder — Phase 4D storage planned]
   * Drop a rejected insight (Confirm UI only). No-op in 4A.
   *
   * @param id — Insight primary key.
   */
  deleteInsight(id: string): void {
    void id;
  }

  // ────────────────────────────────────────────────────────────────
  // 6. Timeline — bie_timeline (Phase 4D — PLACEHOLDER, rebuildable cache)
  // ────────────────────────────────────────────────────────────────

  /**
   * [Placeholder — Phase 4D storage planned]
   * List cached timeline buckets. Optional period-kind granularity
   * filter. Returns `[]` in 4A.
   *
   * @param filter.periodKind — "month" | "quarter" | "year".
   */
  getTimelineItems(filter?: { periodKind?: TimelinePeriodKind }): TimelineItem[] {
    void filter;
    return [];
  }

  /**
   * [Placeholder — Phase 4D storage planned]
   * Fetch one timeline bucket by periodKey (e.g. "2026-Q2").
   *
   * @param periodKey — Bucket primary key.
   * @returns `undefined` (type-safe shape) until 4D writes cache rows.
   */
  getTimelineItem(periodKey: string): TimelineItem | undefined {
    void periodKey;
    return undefined;
  }

  /**
   * [Placeholder — Phase 4D storage planned]
   * Upsert one rebuildable timeline cache bucket. contentHash on the
   * item controls invalidation. No-op in 4A.
   *
   * @param item — Timeline cache row.
   */
  saveTimelineItem(item: TimelineItem): void {
    void item;
  }

  /**
   * [Placeholder — Phase 4D storage planned]
   * Wipe the entire timeline cache; forces a rebuild from current
   * evidence on the next read. No-op in 4A.
   */
  clearTimeline(): void {
    // No-op.
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
   * underlying change. In 4A the method simply drops the row from
   * the queue; the 4B/4C/4D storage layers will override/extend the
   * side effects of "apply" once real target tables exist.
   *
   * Contract: idempotent — calling apply on an already-absent id is
   * a harmless no-op.
   *
   * @param id — Pending item primary key.
   */
  applyPendingBieItem(id: string): void {
    const current = RoomDatabase.getBiePendingQueue();
    const next = current.filter((row) => row.id !== id);
    if (next.length !== current.length) {
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
}


