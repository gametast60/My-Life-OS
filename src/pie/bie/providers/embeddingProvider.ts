// ─────────────────────────────────────────────────────────────────────
// BIE — EmbeddingProvider Interface
// Phase 4A S1 — Interface ONLY (no concrete implementation)
// ─────────────────────────────────────────────────────────────────────
//
// Provider-Agnostic contract (hard constraint P4-9):
//   BIE business logic (semanticService, vectorIndex) MUST depend on
//   this interface — NEVER on a concrete provider class
//   (GeminiEmbeddingProvider / LocalBM25EmbeddingProvider / etc.).
//
// Concrete implementations land in Phase 4A S3:
//   - geminiEmbeddingProvider.ts   (Primary — via @google/genai)
//   - localBM25EmbeddingProvider.ts (Fallback — offline TF-IDF + synonyms)
//
// All methods are async because network embedding APIs are I/O-bound;
// even offline providers return Promises so callers cannot branch on
// sync/async (uniform hybrid fallback path — DECISIONS.md CONFIRMED).
// ─────────────────────────────────────────────────────────────────────

import type { EmbeddingMethod } from "../types";

/** Result of embedding a single piece of text. */
export interface EmbeddingResult {
  /** The embedding vector. Length MUST equal `dimensions`. */
  embedding: number[];
  /** Which provider produced this vector. */
  method: EmbeddingMethod;
  /** Model identifier within the provider (e.g. "text-embedding-004"). */
  model: string;
  /** Vector dimensionality. Implementations declare a fixed value. */
  dimensions: number;
}

/** Reason a provider could not produce an embedding (drives hybrid failover). */
export type EmbeddingFailureReason =
  | "unavailable"
  | "quota"
  | "network"
  | "invalid_input"
  | "unknown";

/** Failure envelope — used by orchestrator to trigger fallback. */
export interface EmbeddingFailure {
  reason: EmbeddingFailureReason;
  message: string;
}

/** Either a result or a typed failure (no throw — hybrid-friendly). */
export type EmbeddingOutcome =
  | ({ ok: true } & EmbeddingResult)
  | ({ ok: false } & EmbeddingFailure);

/**
 * Provider-agnostic embedding contract.
 *
 * Implementations:
 *   - MUST be stateless w.r.t. text (same input ⇒ equivalent vector, modulo model).
 *   - MUST declare `dimensions` (consumed by dimension-agnostic vectorIndex).
 *   - SHOULD guard against empty/oversized input and return a typed failure.
 *
 * Implementations MUST NOT:
 *   - Persist to storage (caching is the Repository's job, P4-10).
 *   - Throw on quota/network errors — return `ok: false` so the orchestrator
 *     can fail over to the fallback provider (P4-5).
 */
export interface EmbeddingProvider {
  /** Stable provider id, e.g. "gemini", "local_bm25". Matches EmbeddingMethod. */
  readonly id: EmbeddingMethod;

  /** Human-readable name for logs/UI. */
  readonly displayName: string;

  /** Fixed vector dimensionality produced by this provider. */
  readonly dimensions: number;

  /**
   * Cheap synchronous availability probe.
   * Used by the hybrid orchestrator to skip dead providers before awaiting.
   * MUST be side-effect free and fast (no network).
   */
  isAvailable(): boolean;

  /**
   * Embed a single text.
   * Returns a typed outcome — never throws on quota/network failure.
   */
  embed(text: string): Promise<EmbeddingOutcome>;

  /**
   * Embed multiple texts in one round-trip when the provider supports it.
   * Default-capable providers MAY override to batch into a single API call;
   * others fall back to per-text embedding internally.
   * Order of results MUST match input order.
   */
  batchEmbed(texts: string[]): Promise<EmbeddingOutcome[]>;
}
