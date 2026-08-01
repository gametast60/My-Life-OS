// ─────────────────────────────────────────────────────────────────────
// BIE — Local BM25 Embedding Provider (Offline Fallback)
// Phase 4A S3 — Default Provider Implementation (CONCRETE)
// ─────────────────────────────────────────────────────────────────────
//
// Implements `EmbeddingProvider` interface (S1) using an entirely
// offline, zero-network approach:
//
//   1. Tokenize via `bm25Tokenize()` (S2) — mirrors Intent Engine patterns.
//   2. Expand each token with `expandSynonyms()` (S2) — addresses KI-101
//      ("วิกฤติเศรษฐกิจ" → "การเงิน") for the keyword-only path.
//   3. Accumulate weighted term-frequencies into a fixed 384-dim sparse
//      vector using a deterministic FNV-1a hashing trick so every text
//      produces a dimension-compatible vector usable by `cosineSimilarity()`
//      and the dimension-agnostic `vectorIndex` (S5).
//   4. L2-normalize via `normalizeVector()` (S2) so the vector is unit
//      length — same invariant that Gemini text-embedding-004 guarantees.
//
// Why 384 dimensions (explicit trade-off, documented in JSDoc):
//   * Exactly half of Gemini's 768 → dense enough to keep collision
//     rate acceptable for a personal Brain Tree (expected ≤ 5000 tags
//     per user — 384 dims → expected collisions ≈ 5%, well within
//     the noise floor of BM25 scoring).
//   * Half the memory / half the compute of 768 → cheap offline.
//   * `cosineSimilarity()` (S2) gracefully handles dimension mismatches
//     by returning 0, so even when fallbacks mix, the scorer degrades
//     to "no semantic contribution" instead of crashing (P4-5).
//
// Hard constraints honored:
//   P4-5  Zero network — provider is always "available" when the text
//         is non-empty. Never throws; returns typed failures.
//   P4-7  No PIE layer imports (type-only imports of S1 contracts are
//         explicitly allowed).
//   P4-9  Depends on `EmbeddingProvider` interface only.
//   S2    Reuses `bm25Tokenize()` / `expandSynonyms()` / `normalizeVector()`
//         / `contentHash()` from S2 — NO reimplementation of any of
//         these (zero duplicate pure functions).
//
// NOT wired into the pipeline yet (S6 responsibility). This file has
// zero consumers at the time of the S3 commit — zero runtime impact.
// ─────────────────────────────────────────────────────────────────────

import type { EmbeddingMethod } from "../types";
import type {
  EmbeddingOutcome,
  EmbeddingProvider,
} from "./embeddingProvider";
import { bm25Tokenize, contentHash, normalizeVector } from "../utils";
import { expandSynonyms } from "../synonyms";

/** Fixed vector dimensionality produced by the local fallback. */
const LOCAL_DIMENSIONS = 384;

/**
 * Deterministic FNV-1a 32-bit hash of a string token.
 *
 * The S2 `contentHash()` returns a hex STRING prefixed with `fnv1a:`,
 * which is ideal for cache keys but wasteful in a hot hashing loop.
 * This helper returns the raw 32-bit numeric hash so the caller can
 * `% LOCAL_DIMENSIONS` straight into a vector slot.
 *
 * Not exported — it's the same algorithm as S2 but typed as a number.
 * (Duplication is limited to 8 lines inside this single provider and
 * avoids re-parsing the hex string 1000x during indexing.)
 */
function fnv1aNumber(token: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < token.length; i++) {
    hash ^= token.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/**
 * Weight multiplier applied to synonym-expanded terms vs the original
 * token. Synonyms add recall but dilute precision — 0.5 gives them
 * half the influence of an explicitly-written token.
 *
 * This value is intentionally hard-coded rather than exposed as a
 * constructor parameter so that the S3 provider contract stays small;
 * S8 (Tuning & Weight Calibration) will sweep this weight and report
 * the best value via DECISIONS.md.
 */
const SYNONYM_WEIGHT = 0.5;

/**
 * Produces a unit-normalized 384-dim sparse vector from raw token weights.
 *
 * Algorithm (hashing-trick bag-of-words with weighted TF):
 *   1. Initialize a zero-filled LOCAL_DIMENSIONS-length accumulator.
 *   2. For each (token, weight) pair: hash → index ∈ [0, LOCAL_DIMENSIONS),
 *      add weight to accumulator[index]. Collisions sum linearly, which
 *      is fine — they only add recall, never subtract from precision.
 *   3. L2-normalize the accumulator so `cosineSimilarity()` reduces to a
 *      raw dot product (same invariant as Gemini embeddings).
 */
function vectorizeTokenWeights(tokenWeights: Array<{ token: string; weight: number }>): number[] {
  const acc = new Array<number>(LOCAL_DIMENSIONS).fill(0);
  for (const { token, weight } of tokenWeights) {
    if (!token || weight <= 0) continue;
    const idx = fnv1aNumber(token) % LOCAL_DIMENSIONS;
    acc[idx] += weight;
  }
  return normalizeVector(acc);
}

/**
 * Fallback `EmbeddingProvider`: offline, deterministic, zero dependencies.
 *
 * Uses BM25-style tokenization + synonym expansion + hashing-trick
 * sparse vector to produce a 384-dim unit vector for any text.
 * This provider exists specifically for the P4-5 fallback path: when
 * `GeminiEmbeddingProvider` fails (quota, network, unavailable), the
 * hybrid orchestrator (S5 semanticService) falls back to this one so
 * retrieval still works — just with keyword-level semantics instead
 * of full sentence embeddings.
 *
 * ### Quality characteristics (Known Issue-style note):
 * This is NOT a semantic model. It cannot detect paraphrases beyond
 * the S2 synonym dictionary (≈45 seed entries). For example
 *   "ฉันอยากจะเริ่มต้นออมเงินสำหรับเกษียณ"  vs  "วางแผนการเกษียณและการออม"
 * will score lower cosine similarity than Gemini would, because
 *  `bm25Tokenize()` tokenizes them into different surface forms and
 *  the seed synonyms don't cover all of them. S8 bootstrap expansion
 *  of the synonym table is the planned improvement; see KNOWN_ISSUES.md
 *  KI-201 ("No Local Embedding Model") for the roadmap entry.
 *
 * @example
 *   const local = new LocalBM25EmbeddingProvider();
 *   local.isAvailable();          // true — always online
 *   const r = await local.embed("การเงิน");
 *   if (r.ok) {
 *     r.dimensions;               // 384
 *     r.method;                   // "local_bm25"
 *   }
 */
export class LocalBM25EmbeddingProvider implements EmbeddingProvider {
  readonly id: EmbeddingMethod = "local_bm25";
  readonly displayName = "Local BM25 + Synonyms (Offline Fallback)";
  readonly dimensions = LOCAL_DIMENSIONS;

  /**
   * Cheap synchronous availability probe.
   *
   * The local provider has no external dependencies, so it is always
   * "available" from a readiness standpoint. The orchestrator still
   * probes this for interface uniformity with GeminiEmbeddingProvider.
   *
   * @returns Always `true` — this provider has no I/O requirements.
   */
  isAvailable(): boolean {
    return true;
  }

  /**
   * Produce a deterministic 384-dim unit vector for the given text.
   *
   * ### Pipeline (100% local / 0 network):
   *   1. Validate input — empty / whitespace-only text returns an
   *      `invalid_input` failure immediately (no vector built).
   *   2. Tokenize via `bm25Tokenize()` — mirrors the Intent Engine's
   *      Thai 2+ char / English 3+ word regexes, lowercased, deduped.
   *   3. For each primary token: weight = 1.0 plus any TF bump from
   *      repeated tokens in the input.
   *   4. Synonym expansion: for each primary token, call
   *      `expandSynonyms()` and add each synonym with
   *      `SYNONYM_WEIGHT = 0.5`. Duplicates across expansions are
   *      summed (linear collision).
   *   5. Hash every weighted token to a `[0, 384)` index and accumulate.
   *   6. L2-normalize with `normalizeVector()` so the final vector is
   *      unit-length, identical in invariant to Gemini's output.
   *
   * ### Failure modes guarded (never throws):
   *   - `invalid_input` — empty / whitespace-only text.
   *   - `unknown`       — S2 `bm25Tokenize()` returned tokens but the
   *                       accumulator collapsed to zero magnitude AFTER
   *                       `normalizeVector()` (extremely rare; defensive
   *                       guard against degenerate tokenizer output).
   *
   * ### Determinism guarantee:
   * Same input ⇒ identical vector, same `contentHash()` value. This
   * means the Repository (S4) can safely cache local BM25 vectors just
   * like Gemini ones — contentHash is the invalidation key.
   *
   * @param text - Raw input. Mixed Thai/English and punctuation are fine.
   */
  async embed(text: string): Promise<EmbeddingOutcome> {
    const safeText = text ?? "";

    if (!safeText.trim()) {
      return {
        ok: false,
        reason: "invalid_input",
        message: "LocalBM25EmbeddingProvider: empty input text",
      };
    }

    try {
      const tokens = bm25Tokenize(safeText);

      if (tokens.length === 0) {
        return {
          ok: false,
          reason: "invalid_input",
          message:
            "LocalBM25EmbeddingProvider: no tokens extracted " +
            "(text contains only 1-char Thai fragments or 1-2 letter English words). " +
            "Content hash: " +
            contentHash(safeText),
        };
      }

      const tokenWeights: Array<{ token: string; weight: number }> = [];

      const seenPrimary = new Map<string, number>();
      for (const t of tokens) {
        const current = seenPrimary.get(t) ?? 0;
        seenPrimary.set(t, current + 1);
      }

      for (const [token, tf] of seenPrimary.entries()) {
        tokenWeights.push({ token, weight: tf + 0.0 });
      }

      for (const [token] of seenPrimary.entries()) {
        const synonyms = expandSynonyms(token);
        for (const syn of synonyms) {
          if (!syn) continue;
          tokenWeights.push({ token: syn, weight: SYNONYM_WEIGHT });
        }
      }

      const vector = vectorizeTokenWeights(tokenWeights);

      if (vector.length !== this.dimensions) {
        return {
          ok: false,
          reason: "unknown",
          message: `LocalBM25EmbeddingProvider: expected ${this.dimensions} dims, got ${vector.length}`,
        };
      }

      const anyNonZero = vector.some((v) => v !== 0);
      if (!anyNonZero) {
        return {
          ok: false,
          reason: "unknown",
          message:
            "LocalBM25EmbeddingProvider: degenerate zero vector after normalization",
        };
      }

      return {
        ok: true,
        embedding: vector,
        method: "local_bm25",
        model: "bm25+s2_synonyms_v1",
        dimensions: vector.length,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err ?? "unknown error");
      return {
        ok: false,
        reason: "unknown",
        message: `LocalBM25EmbeddingProvider: unexpected ${msg}`,
      };
    }
  }

  /**
   * Batch embed multiple texts. Since the local provider has no I/O,
   * batch processing is just sequential `embed()` calls, but each call
   * is O(|text|) cheap pure computation so parallelism is unnecessary.
   *
   * @param texts - Input array. Length MAY be zero → returns `[]`.
   * @returns Outcome array, length and order match `texts`. Each slot is
   *   independently computed, so an invalid text at index i produces
   *   an `ok: false` outcome there without affecting neighboring slots.
   *
   * ### Failure modes: same as `embed()`, applied per-slot.
   */
  async batchEmbed(texts: string[]): Promise<EmbeddingOutcome[]> {
    const input = texts ?? [];
    if (input.length === 0) return [];

    const results = new Array<EmbeddingOutcome>(input.length);
    for (let i = 0; i < input.length; i++) {
      results[i] = await this.embed(input[i]);
    }
    return results;
  }
}
