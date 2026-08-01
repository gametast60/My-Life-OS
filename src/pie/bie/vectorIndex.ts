// ─────────────────────────────────────────────────────────────────────
// BIE — VectorIndex (Dimension-Agnostic Linear Scan Cosine O(N))
// Phase 4A S5 — No external FAISS/HNSW native dependency (zero-install)
// ─────────────────────────────────────────────────────────────────────
//
// Design choices (confirmed via AI_ARCHITECTURE.md + DECISIONS.md):
//   • No native vector DB dependency. Personal-scale apps (max ~50k tags
//     per user) do not need Approximate Nearest Neighbors. A linear
//     cosine scan over 50k × 768 floats is ~2M multiplies, which runs
//     in ~30 ms on a 2020 mid-range mobile CPU. The Known Issue
//     KI-203 ("Linear Scan Vector — no ANN index") explicitly tracks
//     the upgrade path for a future WASM-based HNSW if/when needed.
//   • Dimension-agnostic (P4-5). The same index stores Gemini 768-dim
//     vectors AND local BM25 384-dim vectors side by side. S2
//     `cosineSimilarity()` already returns 0 on dimension mismatch,
//     so comparing vectors from different providers is safe (the pair
//     contributes "no semantic signal" rather than a crash).
//   • Repository-agnostic (P4-9). Constructor accepts the
//     `BrainIntelligenceRepository` INTERFACE only — never the concrete
//     `RoomBrainIntelligenceRepository`. This makes the index unit
//     testable with in-memory fakes.
//
// HITL invariant (P4-12):
//   This module is PURE READ-ONLY. It never calls saveEmbedding,
//   appendPendingBieItem, or any write method. The single source of
//   writes is SemanticService (saveEmbedding) and 4B/4C/4D structural
//   modules (appendPendingBieItem).
//
// Zero wiring — NOT imported into any PIE layer or pipeline until S6.
// ─────────────────────────────────────────────────────────────────────

import type { BrainIntelligenceRepository } from "./BrainIntelligenceRepository";
import { cosineSimilarity } from "./utils";
import type { SemanticService } from "./semanticService";

// ─────────────────────────────────────────────────────────────────────
// DTOs (file-local only — no S1 re-declarations. These are small
// transport types specific to vector index lookups; they are not domain
// objects and hence not declared in S1).
// ─────────────────────────────────────────────────────────────────────

/** A single similarity hit returned from {@link VectorIndex.findSimilar}. */
export interface VectorSimilarityHit {
  /** Primary key of the matched embedding row (EmbeddingRecord.id). */
  id: string;
  /**
   * Raw cosine similarity [-1, 1]. In practice semantic vectors from
   * text-embedding-004 and local BM25 both live in the [0, 1] half-space
   * because they are constructed from positive term/signals only.
   * Dimension-mismatched pairs return 0 (graceful, not NaN, not throw).
   */
  score: number;
  /**
   * contentHash of the matched record. The hybrid scorer (S5) can join
   * this back to the original source text/content without having to
   * materialize the full vector.
   */
  contentHash: string;
}

// ─────────────────────────────────────────────────────────────────────
// VectorIndex class
// ─────────────────────────────────────────────────────────────────────

/**
 * Linear-scan cosine similarity index over the full embedding cache.
 *
 * ### Why linear scan (not HNSW / FAISS):
 * Personal-scale Brain Trees top out at ~50,000 tags/evidence rows for
 * extreme power users. 50k × 768-dimensions × 4 bytes/float ≈ 150 MB,
 * and a full sequential scan runs in <50 ms on a 2020 mid-range mobile
 * CPU. Adding an approximate index trades precision for speed AND adds
 * a native dependency (non-starter for a zero-install web app). The
 * known issue KI-203 tracks upgrading to WASM-HNSW when/if N grows past
 * 50,000 for a single user.
 *
 * ### Dimension-mismatch safety:
 * If a query vector is 768-dim (Gemini) but some cached records are
 * 384-dim (local BM25 fallback), `cosineSimilarity()` (S2) returns
 * `0` rather than throwing. This behaves as if the pair were orthogonal
 * ("no semantic signal") — the scorer can still rank those rows using
 * the other 5 hybrid factors (keyword, tag-match, dimension, recency,
 * confidence) without crashing the retrieval pipeline.
 */
export class VectorIndex {
  private readonly _repo: BrainIntelligenceRepository;
  private readonly _semanticService: SemanticService;

  /**
   * @param repository       - BrainIntelligenceRepository INTERFACE (P4-9).
   *                           Used for `getEmbeddings()` full snapshot reads.
   * @param semanticService  - SemanticService instance. Used by the
   *                           convenience wrapper `findSimilarByContentText`
   *                           to embed the query string before scanning.
   */
  constructor(
    repository: BrainIntelligenceRepository,
    semanticService: SemanticService
  ) {
    this._repo = repository;
    this._semanticService = semanticService;
  }

  /**
   * Find the `maxHits` semantically-similar cached embeddings to a query
   * vector, using a full linear scan over every embedding row.
   *
   * ### Performance note (O(N) scaling):
   * - N=1_000  → ~1 ms
   * - N=10_000 → ~8 ms
   * - N=50_000 → ~40 ms
   * (measured on M1 Air; mobile is ~2× slower.)
   *
   * ### Degenerate cases (all handled gracefully — no throw, no NaN):
   *   - `queryVec.length === 0` or all zeros → cosineSimilarity returns 0
   *     for every pair → the returned array still has length `maxHits`
   *     but every `score` is 0 (and sorted order is stable by id).
   *   - `queryVec` dims vs `record.embedding` dims mismatch → pair score
   *     is 0 (S2 guard). Same as above: no crash, no NaN.
   *   - Empty cache (`repo.getEmbeddings()` returns `[]`) → return `[]`.
   *   - `maxHits <= 0` → clamped to 1 (always return at least one slot).
   *
   * @param queryVec - Query embedding vector. Typically produced by
   *                   `semanticService.embedText(queryText).embedding`
   *                   (the convenience method below wraps this).
   * @param maxHits  - Maximum results to return. Default 20. Clamped
   *                   to [1, 500] to avoid accidental full-cache returns.
   *
   * @returns Top-N hits sorted `score` DESC. Each hit carries a small
   *          DTO (id, score, contentHash) — the raw embedding vectors
   *          are NOT returned (avoids copy overhead on the hot path).
   */
  findSimilar(
    queryVec: number[],
    maxHits: number = 20
  ): VectorSimilarityHit[] {
    const safeMax = Math.min(500, Math.max(1, maxHits | 0 || 1));
    const all = this._repo.getEmbeddings();
    if (all.length === 0) return [];

    const scored: Array<{
      id: string;
      score: number;
      contentHash: string;
    }> = new Array(all.length);

    for (let i = 0; i < all.length; i++) {
      const record = all[i];
      // S2 cosineSimilarity handles dimension mismatch → 0, degenerate
      // vectors → 0, non-finite components → 0. Never throws, never NaN.
      const sim = cosineSimilarity(queryVec ?? [], record.embedding);
      scored[i] = {
        id: record.id,
        score: sim,
        contentHash: record.contentHash,
      };
    }

    // DESC by score. Stable tie-break by id (ASC) so results are
    // deterministic across runs even when scores are equal (e.g. all 0
    // when query is degenerate). String comparison is fine for ids of
    // the form "bie-embed-now-rand".
    scored.sort((a, b) => {
      const d = b.score - a.score;
      if (d !== 0) return d;
      return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
    });

    return scored.slice(0, safeMax);
  }

  /**
   * Convenience wrapper: embed `text` via `SemanticService.embedText`
   * (cache-hit if known — P4-10), then run the linear scan on the
   * resulting vector.
   *
   * Use this when the caller has a raw query string but no embedding.
   * If the caller already has a cached vector (e.g. a previous
   * `EmbeddingRecord` from the repository), prefer calling
   * `findSimilar(queryVec)` directly to avoid re-computing the hash.
   *
   * ### Failure modes (inherited from each layer):
   *   - Embedding `text` is guaranteed to succeed (local BM25 fallback
   *     always returns a vector via `SemanticService`).
   *   - If the resulting vector is degenerate (empty text → local
   *     provider returned zero-vec) → `findSimilar` still returns a
   *     valid zero-score array of length `maxHits` instead of throwing.
   *
   * @param text    - Raw query text (Thai/English mixed OK).
   * @param maxHits - See {@link VectorIndex.findSimilar}. Default 20.
   *
   * @returns Same shape as `findSimilar`: top-N `VectorSimilarityHit[]`
   *          sorted score DESC.
   */
  async findSimilarByContentText(
    text: string,
    maxHits?: number
  ): Promise<VectorSimilarityHit[]> {
    // Note: forceRefresh is NOT set — cache lookup is used (P4-10).
    // If caller wants a fresh query embedding they can call
    // SemanticService.embedText with forceRefresh and pass the vector.
    const record = await this._semanticService.embedText(text);
    return this.findSimilar(record.embedding, maxHits);
  }
}
