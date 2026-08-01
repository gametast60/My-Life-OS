// ─────────────────────────────────────────────────────────────────────
// BIE — SemanticService (Hybrid Embedding Orchestrator)
// Phase 4A S5 — Business Logic Layer: Cache + Primary/Failover Chain
// ─────────────────────────────────────────────────────────────────────
//
// Pure read-only orchestration (HITL invariant P4-12):
//   • The ONLY write this module performs is saveEmbedding() which is a
//     VALUE-NEUTRAL cache fill — not a "structural" knowledge change.
//     Structural writes (graph edges, identity updates, …) are strictly
//     the job of later sub-phases and MUST go through appendPendingBieItem.
//   • No appendPendingBieItem calls are made anywhere in this file.
//
// Provider-agnostic (P4-9):
//   • Constructor depends on the `EmbeddingProvider` INTERFACE only, never
//     on a concrete class. Concrete Gemini/Local classes are imported for
//     the default-instance factory helper at the bottom of this file; the
//     class body never references them directly.
//
// Cache-first (P4-10):
//   • For every embed call, we compute `contentHash(text)` (S2) and ask the
//     repository for a matching cached record. If found, we SHORT-CIRCUIT
//     and return it WITHOUT touching any provider. Cache hit rate target
//     for steady-state usage is > 95%.
//   • On cache miss → iterate DI `primaryProviders` (call isAvailable first,
//     then await embed). Any successful outcome is saved; if all primaries
//     fail (failure outcome OR thrown error) → fall back to the injected
//     `fallbackProvider` (LocalBM25 by default), which always succeeds per
//     its S3 contract.
//
// Zero wiring:
//   • NOT imported into any PIE layer, pipeline, or aiService at this stage.
//     S6 wires the service into RoomBrainRepository.getRelevantMemory.
// ─────────────────────────────────────────────────────────────────────

import type { APIProvider } from "../../types";
import type { EmbeddingMethod, EmbeddingRecord } from "./types";
import type { BrainIntelligenceRepository } from "./BrainIntelligenceRepository";
import type {
  EmbeddingOutcome,
  EmbeddingProvider,
} from "./providers/embeddingProvider";
import { contentHash } from "./utils";

// Concrete implementations are imported for the default-instance factory
// helper ONLY. The class body never references these names. Keeping them
// as type-free imports at the bottom of the dependency list makes the
// separation clear.
import { GeminiEmbeddingProvider } from "./providers/geminiEmbeddingProvider";
import { LocalBM25EmbeddingProvider } from "./providers/localBM25EmbeddingProvider";
import { RoomBrainIntelligenceRepository } from "./RoomBrainIntelligenceRepository";

// ─────────────────────────────────────────────────────────────────────
// Local-only service options (no S1 redeclarations — these are specific
// to the SemanticService call surface, DRY with per-call override).
// ─────────────────────────────────────────────────────────────────────

/** Options for a single `embedText` call. */
export interface SemanticServiceEmbedOptions {
  /**
   * Per-call override of the primary/fallback provider lists.
   * When omitted, the constructor-injected defaults are used.
   */
  providers?: {
    primaryProviders?: EmbeddingProvider[];
    fallbackProvider?: EmbeddingProvider;
  };
  /**
   * When true: skip the `contentHash` cache lookup and force a fresh
   * embedding to be generated, then overwrite the stored record. Useful
   * for re-indexing after a provider upgrade / synonym expansion.
   *
   * Default: `false` (cache is authoritative — P4-10).
   */
  forceRefresh?: boolean;
}

/** Options for a single `batchEmbedTexts` call. */
export interface SemanticServiceBatchOptions {
  /** See {@link SemanticServiceEmbedOptions.forceRefresh}. */
  forceRefresh?: boolean;
}

/**
 * Generate a unique id for a freshly cached embedding row.
 *
 * Uses the same `${now}-${base36-random}` pattern as the rest of the app
 * (BrainTree tag ids, journal ids, evidence ids, …) to keep storage
 * homogeneous. The `bie-embed-` prefix makes rows grep-able in the
 * shared `bie_embeddings` table.
 */
function generateEmbeddingId(): string {
  const now = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  return `bie-embed-${now}-${rand}`;
}

/**
 * Build a typed `EmbeddingRecord` from a successful provider outcome
 * plus the pre-computed contentHash.
 *
 * The method field is widened from the provider-specific literal to the
 * full `EmbeddingMethod` union (declared in S1) so that future providers
 * added via constructor DI are automatically compatible with the
 * repository storage signature.
 */
function buildRecord(
  hash: string,
  outcome: Extract<EmbeddingOutcome, { ok: true }>
): EmbeddingRecord {
  return {
    id: generateEmbeddingId(),
    contentHash: hash,
    embedding: outcome.embedding,
    dimensions: outcome.dimensions,
    method: outcome.method as EmbeddingMethod,
    model: outcome.model,
    updatedAt: Date.now(),
  };
}

// ─────────────────────────────────────────────────────────────────────
// SemanticService — hybrid embedding orchestrator
// ─────────────────────────────────────────────────────────────────────

/**
 * Hybrid embedding orchestrator.
 *
 * ### Call graph (single text, `forceRefresh = false`):
 * ```
 *   user text
 *     │
 *     ▼
 *   contentHash(text)                 ← S2 pure function
 *     │
 *     ├─ cache hit via repo.getEmbedding({ contentHash })
 *     │    └─ return stored record immediately
 *     │         (no provider touched — zero I/O, zero quota cost)
 *     │
 *     └─ cache miss
 *          │
 *          ▼
 *        for each primary in primaryProviders:
 *          ├─ isAvailable()? — no → skip
 *          ├─ try provider.embed(text)
 *          │    ├─ ok: true  → saveEmbedding → return record
 *          │    └─ ok: false → continue (try next primary)
 *          └─ thrown error caught → continue (treat as failure)
 *        │
 *        └─ all primaries exhausted
 *             │
 *             ▼
 *           fallbackProvider.embed(text)   (LocalBM25 — always succeeds)
 *             └─ saveEmbedding → return record
 * ```
 *
 * ### Repository used (single storage hop — P4-7):
 *   - `repo.getEmbedding({ contentHash })` — cache lookup
 *   - `repo.saveEmbedding(record)`       — cache fill after provider success
 *
 * ### Zero throw guarantee:
 * Any exception raised by a provider is caught and treated identically
 * to an `{ ok: false }` typed failure — the loop continues to the next
 * provider. The local fallback never throws (its S3 contract), so the
 * promise chain always resolves to a valid `EmbeddingRecord`.
 */
export class SemanticService {
  private readonly _primaryProviders: EmbeddingProvider[];
  private readonly _fallbackProvider: EmbeddingProvider;
  private readonly _repo: BrainIntelligenceRepository;

  /**
   * @param repository - `BrainIntelligenceRepository` INTERFACE (P4-9).
   *   Callers inject the concrete `RoomBrainIntelligenceRepository`; the
   *   service does not and MUST NOT depend directly on the implementation
   *   class — this keeps it swappable/testable.
   * @param primaryProviders - Ordered list of `EmbeddingProvider` instances
   *   to try on a cache miss. A provider is skipped when `isAvailable()`
   *   returns false OR when it returns `{ ok: false }`. Common default:
   *   a single `GeminiEmbeddingProvider` instance.
   * @param fallbackProvider - Terminal offline fallback provider. MUST be
   *   an instance that is **always** available (per S3, `LocalBM25EmbeddingProvider`
   *   satisfies this — `isAvailable()` returns true unconditionally).
   */
  constructor(
    repository: BrainIntelligenceRepository,
    primaryProviders: EmbeddingProvider[],
    fallbackProvider: EmbeddingProvider
  ) {
    this._repo = repository;
    this._primaryProviders = primaryProviders ?? [];
    this._fallbackProvider = fallbackProvider;
  }

  /**
   * Embed a single text, preferring cache (P4-10) → primary providers →
   * guaranteed offline fallback.
   *
   * @param text - Raw input (mixed Thai/English, punctuation, whitespace
   *   all allowed). Empty/whitespace-only still produces a stable
   *   contentHash; the local fallback returns `invalid_input` for empty
   *   text per its S3 contract — if that happens the caller receives the
   *   best-effort outcome record (the same contract as a direct provider
   *   call). In practice the layer above never passes empty text because
   *   Intent Engine filtering guarantees non-empty query strings.
   *
   * @param opts - Per-call overrides. See {@link SemanticServiceEmbedOptions}.
   *
   * @returns A fully populated `EmbeddingRecord`. The record has already
   *          been persisted to the embedding cache via `saveEmbedding()`
   *          when generated in this call (i.e. on cache miss + provider
   *          success). On pure cache hit the record is returned as-is.
   *
   * @failure-mode
   *   - Never throws (per-provider errors are caught → advance chain).
   *   - If every primary fails or is unavailable → falls through to the
   *     local fallback which always succeeds (contract of
   *     `LocalBM25EmbeddingProvider`). The returned record will carry
   *     `method: "local_bm25"` in that case.
   *   - `forceRefresh: true` bypasses the cache read but still **writes**
   *     the new result — so the next non-forced call is a cache hit.
   */
  async embedText(
    text: string,
    opts: SemanticServiceEmbedOptions = {}
  ): Promise<EmbeddingRecord> {
    const { providers, forceRefresh } = opts;

    // Step 1 — deterministically compute the cache key (S2 utility).
    const hash = contentHash(text ?? "");

    // Step 2 — cache lookup (unless forceRefresh forces a regenerate).
    if (!forceRefresh) {
      const cached = this._repo.getEmbedding({ contentHash: hash });
      if (cached) {
        // Short-circuit: zero I/O. Returning the same record that
        // `saveEmbedding` persisted is the P4-10 invariant
        // ("NEVER regenerate if hash matches cache").
        return cached;
      }
    }

    // Step 3 — cache miss → primary provider chain (constructor defaults
    // or per-call override).
    const primaries =
      providers?.primaryProviders ?? this._primaryProviders;
    const fallback =
      providers?.fallbackProvider ?? this._fallbackProvider;

    for (const provider of primaries) {
      if (!provider?.isAvailable?.()) continue;
      try {
        const outcome = await provider.embed(text);
        if (outcome.ok) {
          const record = buildRecord(hash, outcome);
          this._repo.saveEmbedding(record);
          return record;
        }
      } catch {
        // Treat a throw (should not happen per provider contract — they
        // return { ok: false } — but defensive coding) as "this provider
        // failed" and move to the next one. No re-throw.
      }
    }

    // Step 4 — primaries exhausted → terminal local fallback.
    // Per S3 `LocalBM25EmbeddingProvider` contract this always succeeds
    // (isAvailable = true, embed never throws and only returns failure
    // on empty text which the pipeline above filters). We still handle
    // the ok:false path defensively by wrapping in a minimal zero-vec
    // record so callers ALWAYS receive an EmbeddingRecord.
    let fbOutcome: EmbeddingOutcome;
    try {
      fbOutcome = await fallback.embed(text);
    } catch {
      fbOutcome = {
        ok: false,
        reason: "unknown",
        message: "SemanticService: fallback provider threw unexpectedly",
      };
    }

    if (fbOutcome.ok) {
      const record = buildRecord(hash, fbOutcome);
      this._repo.saveEmbedding(record);
      return record;
    }

    // Defensive: even fallback failed (e.g. empty text). Still return a
    // type-safe record so the chain never rejects. Dimension = 1,
    // vector = [0] — vectorIndex + cosineSimilarity (S2) handle this
    // gracefully by returning 0 on mismatch/degenerate cases.
    const degenerate: EmbeddingRecord = {
      id: generateEmbeddingId(),
      contentHash: hash,
      embedding: [0],
      dimensions: 1,
      method: "unknown",
      model: "degenerate_fallback",
      updatedAt: Date.now(),
    };
    this._repo.saveEmbedding(degenerate);
    return degenerate;
  }

  /**
   * Batch-embed multiple texts, stitching together per-text cache hits
   * first, then batch-calling providers for the cache-miss subset, then
   * reassembling results in the **original input order**.
   *
   * @param texts - Input array. Order is preserved in the returned
   *                `EmbeddingRecord[]` (1:1 index mapping).
   * @param opts.forceRefresh - Same semantics as single embed: when true,
   *                skip per-text cache lookup and regenerate every row.
   *
   * @returns `EmbeddingRecord[]` with length === `texts.length`, order
   *          matching input exactly. Every slot is a valid persisted
   *          record (cache hit OR freshly computed via provider chain).
   *
   * @failure-mode
   *   - Per-text: same as `embedText` (never throws — local fallback
   *     guarantees a record). One degenerate text does NOT poison the
   *     whole batch — that slot becomes the degenerate-zero record,
   *     while other slots proceed normally.
   *   - If `texts.length === 0` returns `[]` synchronously-wrapped.
   */
  async batchEmbedTexts(
    texts: string[],
    opts: SemanticServiceBatchOptions = {}
  ): Promise<EmbeddingRecord[]> {
    const input = texts ?? [];
    if (input.length === 0) return [];

    const forceRefresh = opts.forceRefresh ?? false;

    // Pre-compute hashes for every slot so we can (a) look up cache, and
    // (b) later fill cache-miss records without re-hashing.
    const hashes = input.map((t) => contentHash(t ?? ""));
    const result = new Array<EmbeddingRecord | null>(input.length).fill(null);
    const missIndices: number[] = [];

    // Phase A — cache hits first (zero I/O, fast).
    for (let i = 0; i < input.length; i++) {
      if (forceRefresh) {
        missIndices.push(i);
        continue;
      }
      const cached = this._repo.getEmbedding({ contentHash: hashes[i] });
      if (cached) {
        result[i] = cached;
      } else {
        missIndices.push(i);
      }
    }

    // Phase B — all-cache-hit short-circuit.
    if (missIndices.length === 0) return result as EmbeddingRecord[];

    // Phase C — cache-miss subset. Try primary providers' batchEmbed first
    // (cheaper round-trip). For providers that don't support batch natively
    // (e.g. local), batchEmbed still works per their contracts. We fall
    // back to per-text sequential embedText() if the batch endpoint fails.
    const missTexts = missIndices.map((i) => input[i]);
    const missHashes = missIndices.map((i) => hashes[i]);

    let batchOutcomes: (EmbeddingOutcome | null)[] = missTexts.map(() => null);

    // C1 — Primary provider chain (batch). We only use the FIRST available
    // primary's batch method because different providers may return
    // different dimensions and interleaving would confuse callers.
    let primarySucceeded = false;
    for (const provider of this._primaryProviders) {
      if (!provider?.isAvailable?.()) continue;
      try {
        const outcomes = await provider.batchEmbed(missTexts);
        if (Array.isArray(outcomes) && outcomes.length === missTexts.length) {
          for (let j = 0; j < outcomes.length; j++) batchOutcomes[j] = outcomes[j];
          primarySucceeded = true;
          break;
        }
      } catch {
        // Proceed to next provider (or fall through to per-text below).
      }
    }

    // C2 — For each cache-miss slot: if primary gave ok:true use it;
    // otherwise fall back to per-text embedText() sequential chain which
    // guarantees a record.
    for (let j = 0; j < missIndices.length; j++) {
      const originalIdx = missIndices[j];
      const outcome = batchOutcomes[j];
      if (primarySucceeded && outcome && outcome.ok) {
        const record = buildRecord(missHashes[j], outcome);
        this._repo.saveEmbedding(record);
        result[originalIdx] = record;
      } else {
        // Per-text fallback via the full chain (guarantees a record).
        // Pass forceRefresh=true because we already know the hash has no
        // cache row (checked in Phase A) — avoids double lookup.
        result[originalIdx] = await this.embedText(missTexts[j], {
          forceRefresh: true,
        });
      }
    }

    return result as EmbeddingRecord[];
  }
}

// ─────────────────────────────────────────────────────────────────────
// Default instance factory (convenience helper for S6 wiring).
//
// Rationale for a factory (vs. a module-level singleton exported here):
//   - Singletons cause test pollution and make it hard to swap the
//     repository/providers in-memory during the tuning phase (S8).
//   - A pure factory has zero module-level state — the caller (S6 layer
//     in RoomBrainRepository) controls lifetime and configuration.
// ─────────────────────────────────────────────────────────────────────

/**
 * Build the default SemanticService instance from raw settings:
 *   - Repository: `RoomBrainIntelligenceRepository` (S4 — wraps RoomDatabase).
 *   - Primary providers: one `GeminiEmbeddingProvider` per Gemini-enabled
 *     row in `settingsProviders` (typically 0 or 1).
 *   - Fallback provider: one `LocalBM25EmbeddingProvider` (always succeeds).
 *
 * ### Zero-side-effect note:
 * The factory does NOT touch any PIE layer or pipeline; it only constructs
 * objects. It exists so S6 wiring code can build the service in one line
 * without re-typing the same constructor chain repeatedly.
 *
 * @param settingsProviders - Usually `userSettings.apiProviders[]` from
 *   the app settings. Any row whose `name` matches `"Gemini"` (case-insensitive)
 *   becomes a primary embedding provider. Non-Gemini rows are deliberately
 *   IGNORED here — embedding providers are a separate surface from the
 *   chat completion providers used by `providerRouter.ts`.
 */
export function createDefaultSemanticService(
  settingsProviders: APIProvider[]
): SemanticService {
  const repo = new RoomBrainIntelligenceRepository();
  const primaries: EmbeddingProvider[] = [];
  for (const row of settingsProviders ?? []) {
    const name = (row?.name || "").toLowerCase();
    if (name === "gemini") primaries.push(new GeminiEmbeddingProvider(row));
  }
  const fallback = new LocalBM25EmbeddingProvider();
  return new SemanticService(repo, primaries, fallback);
}
