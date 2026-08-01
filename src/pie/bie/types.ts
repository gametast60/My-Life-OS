// ─────────────────────────────────────────────────────────────────────
// BIE — Brain Intelligence Engine
// Phase 4A S1 — Type & Interface Contracts (CANONICAL)
// ─────────────────────────────────────────────────────────────────────
//
// This file is the SINGLE source of truth for BIE domain types.
// Storage layer (RoomDatabase bie_* tables) and Repository layer
// (BrainIntelligenceRepository) import FROM here — never the reverse.
//
// Hard constraints honored:
//   P4-7  BIE does not import PIE layers (only interface types).
//   P4-8  All additions are additive — no existing types modified.
//   P4-9  Provider-agnostic — no concrete provider types referenced.
//   P4-12 HITL: every "structural" object carries `applied` where the
//         user must confirm before it affects the Core Brain Tree.
//
// Schema source-of-truth: DECISIONS.md "BIE Storage Location" (CONFIRMED
// 2026-07-30) + AI_ARCHITECTURE.md "BIE Storage Structure" table.
// ─────────────────────────────────────────────────────────────────────

import type { LifeDimension, BrainType } from "../../types";

// ─────────────────────────────────────────────────────────────────────
// Shared enums / unions
// ─────────────────────────────────────────────────────────────────────

/** Which embedding provider produced a vector (extensible — never hardcode Gemini). */
export type EmbeddingMethod =
  | "gemini"
  | "local_bm25"
  | "openai"
  | "voyageai"
  | "nomic"
  | "ollama"
  | "unknown";

// ─── Knowledge Graph unions (Phase 4B canonical, declared here for S1 contracts) ───

/** Graph node category. */
export type GraphNodeKind =
  | "tag"
  | "person"
  | "fear"
  | "lesson"
  | "experience"
  | "milestone";

/** Semantic edge between two graph nodes. */
export type GraphEdgeType =
  | "supports"
  | "conflicts"
  | "causes"
  | "derived_from"
  | "related"
  | "opposes";

/** Brain type extension for non-tag graph nodes (Fear/Lesson/Experience are not Core BrainTypes). */
export type GraphNodeCoreType = BrainType | "Fear" | "Lesson" | "Experience";

// ─── Identity / Insight unions (Phase 4D canonical) ───

/** BIE insight category. */
export type InsightKind =
  | "trend"
  | "anomaly"
  | "progress"
  | "milestone"
  | "conflict_alert"
  | "pattern";

/** Insight severity for UI prioritization. */
export type InsightSeverity = "info" | "warning" | "positive" | "critical";

/** Identity category — 8 buckets per the Identity Engine spec. */
export type IdentityCategory =
  | "coreValues"
  | "goals"
  | "motivations"
  | "personality"
  | "strengths"
  | "weaknesses"
  | "thinkingPattern"
  | "summary";

/** Timeline bucket granularity. */
export type TimelinePeriodKind = "month" | "quarter" | "year";

// ─── Pending Queue unions (cross-phase BIE structural suggestions) ───

/** Kind of structural change a BIE module proposes (always HITL). */
export type BiePendingKind =
  | "graph_edge"
  | "graph_merge"
  | "identity_update"
  | "insight_proposal"
  | "insight"
  | "tag_confidence_boost"
  | "reflection_conflict"
  | "reflection_merge";

// ─────────────────────────────────────────────────────────────────────
// 1. Embedding Record — bie_embeddings table row shape
//    Persistent cache; NEVER regenerated if contentHash matches.
// ─────────────────────────────────────────────────────────────────────

export interface EmbeddingRecord {
  /** Primary key. Typically nodeId (brainTreeTagId) or custom node id. */
  id: string;
  /** SHA-1 of normalized text. Invalidation key — equality ⇒ cache hit. */
  contentHash: string;
  /** Embedding vector (JSON-serialized in storage). */
  embedding: number[];
  /** Vector length (768 for Gemini text-embedding-004, 384 for local BM25). */
  dimensions: number;
  /** Which provider produced this vector. */
  method: EmbeddingMethod;
  /** Model identifier within the method (e.g. "text-embedding-004"). */
  model: string;
  updatedAt: number;
}

// ─────────────────────────────────────────────────────────────────────
// 2. Graph Node — bie_graph_nodes table row shape (Phase 4B)
// ─────────────────────────────────────────────────────────────────────

export interface GraphNode {
  /** PK. = brainTreeTagId OR "bie-custom-<uuid>" for non-tag nodes. */
  id: string;
  kind: GraphNodeKind;
  label: string;
  description?: string;
  /** Brain type extension; optional for non-tag kinds (person/milestone). */
  coreType?: GraphNodeCoreType;
  dimension?: LifeDimension;
  createdAt: number;
  updatedAt: number;
}

// ─────────────────────────────────────────────────────────────────────
// 3. Graph Edge — bie_graph_edges table row shape (Phase 4B)
//    HITL: `applied = false` until User Confirm.
// ─────────────────────────────────────────────────────────────────────

export interface GraphEdge {
  id: string;
  fromId: string; // FK → GraphNode.id
  toId: string; // FK → GraphNode.id
  type: GraphEdgeType;
  /** 0-1. AI confidence in the relationship. */
  confidence: number;
  /** BrainEvidence references backing this edge (JSON in storage). */
  evidenceIds: string[];
  /** true = AI-detected suggestion; false = User-confirmed. */
  auto: boolean;
  /** 🔒 false until User Confirm (Human-in-the-loop). */
  applied: boolean;
  createdAt: number;
}

// ─────────────────────────────────────────────────────────────────────
// 4. Identity Profile — bie_identity table row shape (Phase 4D)
//    Singleton row (id="singleton"). HITL applied flag.
// ─────────────────────────────────────────────────────────────────────

/** A scored identity entry (Top-N with confidence). */
export interface IdentityEntry {
  label: string;
  confidence: number;
  /** Evidence / tag references backing this entry. */
  evidenceIds: string[];
}

/** Full identity profile aggregate across 8 categories. */
export interface IdentityProfile {
  /** Always "singleton" — one row per user. */
  id: "singleton";
  coreValues: IdentityEntry[];
  goals: IdentityEntry[];
  motivations: IdentityEntry[];
  personality: IdentityEntry[];
  strengths: IdentityEntry[];
  weaknesses: IdentityEntry[];
  thinkingPattern: IdentityEntry[];
  /** Free-form rollup summary. */
  summary: string;
  generatedAt: number;
  /** 🔒 false until User Confirm. */
  applied: boolean;
}

// ─────────────────────────────────────────────────────────────────────
// 5. Insight — bie_insights table row shape (Phase 4D, FIFO 100)
//    HITL applied flag.
// ─────────────────────────────────────────────────────────────────────

export interface Insight {
  id: string;
  kind: InsightKind;
  /** Thai display title. */
  title: string;
  /** Thai display description. */
  description: string;
  severity: InsightSeverity;
  /** Arbitrary metrics context (query window, values, σ deltas). */
  dataContext: Record<string, unknown>;
  confidence: number;
  generatedAt: number;
  /** 🔒 false until User Confirm. */
  applied: boolean;
}

// ─────────────────────────────────────────────────────────────────────
// 6. Timeline Item — bie_timeline table row shape (Phase 4D, cache)
//    Rebuildable from evidence when contentHash invalidates.
// ─────────────────────────────────────────────────────────────────────

/** Per-dimension theme percentage within a timeline bucket. */
export interface TimelineTheme {
  dimension: LifeDimension;
  /** 0-100 share of evidence within the bucket. */
  percent: number;
  tagIds: string[];
}

export interface TimelineMilestone {
  id: string;
  label: string;
  occurredAt: number;
  dimension?: LifeDimension;
}

export interface TimelineItem {
  /** PK e.g. "2026-Q2", "2026-05", "2026". */
  periodKey: string;
  periodKind: TimelinePeriodKind;
  themeBreakdown: TimelineTheme[];
  milestones: TimelineMilestone[];
  generatedAt: number;
  /** SHA-1 of contributing evidence — invalidate + rebuild on mismatch. */
  contentHash: string;
}

// ─────────────────────────────────────────────────────────────────────
// 7. Pending Learning — bie_pending_queue table row shape
//    HITL by definition: rows in this queue ARE applied=false.
//    (Cross-phase — consumed by 4B relationship engine, 4C consolidation,
//    4D identity/insight engines.)
// ─────────────────────────────────────────────────────────────────────

export interface PendingLearning {
  id: string;
  kind: BiePendingKind;
  /** Structured payload specific to `kind` (graph edge, merge, insight...). */
  payload: Record<string, unknown>;
  /** Thai explanation the user reads in the Confirm UI. */
  reason: string;
  confidence: number;
  createdAt: number;
}

// ─────────────────────────────────────────────────────────────────────
// Convenience: explicit re-exports for sub-areas to consume cleanly.
// (Barrel index.ts will be created in S5; keep this file pure types.)
// ─────────────────────────────────────────────────────────────────────

export type {
  GraphNodeType,
  BIEGraphNode,
  BIEGraphEdge,
  GraphEdgeProposal,
  BIEGraphNodeRow,
  BIEGraphEdgeRow,
  EntityResolutionCandidate,
  DuplicateDetectionResult,
} from "./graph";

export type {
  EvidenceConsolidationReport,
  ConflictSeverity,
  ConflictItem,
  DecayScore,
  ReflectionCycleResult,
  EvidenceConsolidator,
  ConflictDetector,
  DecayEngine,
  ReflectorEngine,
} from "./reflection";

// ─── Identity Layer (Phase 4D canonical) ─────────────────────────────
export type {
  InsightType,
  TimelineGranularity,
  IdentityEntry as IdentityEntryV2,
  IdentityProfile as IdentityProfileV2,
  IdentityRow,
  InsightItem,
  InsightRow,
  TimelineThemeBreakdown,
  TimelineMilestoneEntry,
  TimelineEntry,
  TimelineRow,
} from "./identity";
