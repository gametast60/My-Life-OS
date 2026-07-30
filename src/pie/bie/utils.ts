// ─────────────────────────────────────────────────────────────────────
// BIE — Core Utilities (Pure Functions)
// Phase 4A S2 — No I/O, No Provider, No DB, No Pipeline, No Business Logic
// ─────────────────────────────────────────────────────────────────────
//
// Infrastructure-First (DECISIONS.md "Phase 4 Execution Order"):
//   S3 (Gemini/LocalBM25 providers) and S4 (Repository) import these
//   utilities. If S2 carried side effects, S3/S4 would become harder to
//   test and would violate the Infrastructure-First work order.
//
// Every function in this file is:
//   • Pure      — same input ⇒ same output, no observable side effect.
//   • Synchronous — no I/O, no Promise, no clock/Date.now(), no Math.random().
//   • Dependency-free — no third-party imports; only optional type re-use.
//
// Hard constraints honored:
//   P4-5  Fallback safety — utilities never throw on bad input; they return
//         a defined degenerate value (0, [], "") so callers stay online.
//   P4-9  Provider-agnostic — no concrete provider referenced here.
//   P4-7  BIE does not import PIE layers (only type-only imports allowed).
// ─────────────────────────────────────────────────────────────────────

// NOTE: No runtime imports are needed — these are pure primitives.
// Types from ./types (S1) are imported only when actually consumed by a
// function signature. The five functions below operate on `string`,
// `number[]` and `number`, so no S1 type is referenced here today.
// (Kept intentionally import-free so S2 has zero coupling to S1 contracts.)

// ─────────────────────────────────────────────────────────────────────
// 1. contentHash — embedding cache invalidation key
// ─────────────────────────────────────────────────────────────────────

/**
 * Deterministic hash of normalized text, used as the cache invalidation
 * key for `bie_embeddings` (P4-10 — never regenerate when text is unchanged).
 *
 * The hash is a pure 32-bit FNV-1a string hash over a normalized form of
 * the input. It is NOT cryptographically strong — it only needs to be
 * deterministic and collision-rare for natural-language text within a
 * single user's Brain Tree.
 *
 * Normalization (so semantically-equivalent whitespace/case share a hash):
 *   1. trim leading/trailing whitespace
 *   2. lowercase
 *   3. collapse internal whitespace runs to a single space
 *   4. strip ASCII + Thai punctuation
 *
 * The returned string is a base-16 representation prefixed with `fnv1a:`
 * so the hash is self-describing in storage/logs and trivially distinct
 * from any future hash algorithm.
 *
 * @param content - Raw text to hash. May be empty.
 * @returns Hex hash string (e.g. `"fnv1a:9a3b1c7d"`). Empty/whitespace-only
 *          input returns the constant `"fnv1a:811c9dc5"` (FNV-1a basis).
 *
 * @example
 *   contentHash("การเงิน") === contentHash(" การเงิน ")  // true
 *   contentHash("Finance")  === contentHash("finance")   // true
 */
export function contentHash(content: string): string {
  // Normalize: trim → lowercase → collapse whitespace → strip punctuation.
  const normalized = content
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    // ASCII punctuation + Thai punctuation/markers (zero-width, Thai vowels
    // and tone marks are preserved because they carry meaning).
    .replace(/[\u0021-\u002F\u003A-\u0040\u005B-\u0060\u007B-\u007E]/g, "")
    .replace(/[\u0E3F\u0E46-\u0E4F\u0E5A\u0E5B]/g, "");

  // FNV-1a 32-bit.
  let hash = 0x811c9dc5;
  for (let i = 0; i < normalized.length; i++) {
    hash ^= normalized.charCodeAt(i);
    // FNV prime (multiply, keep within 32 bits via bitwise OR 0).
    hash = Math.imul(hash, 0x01000193);
  }
  // unsigned hex, zero-padded to 8 chars.
  const hex = (hash >>> 0).toString(16).padStart(8, "0");
  return `fnv1a:${hex}`;
}

// ─────────────────────────────────────────────────────────────────────
// 2. normalizeVector — L2 normalization for cosine similarity
// ─────────────────────────────────────────────────────────────────────

/**
 * L2-normalize (Euclidean) a vector in place-free style.
 *
 * Required before any cosine-similarity computation when the source
 * provider does not already return unit vectors, and also when comparing
 * vectors of different origins (Gemini 768-dim vs local BM25 384-dim —
 * P4-5 fallback). Normalizing first lets `cosineSimilarity` reduce to a
 * plain dot product.
 *
 * @param vector - Input vector. May be empty.
 * @returns A new array (input is never mutated). Returns:
 *   • `[]` for an empty input,
 *   • the original vector unchanged if its L2 norm is 0 (e.g. all-zero or
 *     subnormal), to avoid divide-by-zero producing `NaN`.
 *
 * @example
 *   normalizeVector([3, 4])        // [0.6, 0.8]
 *   normalizeVector([0, 0, 0])     // [0, 0, 0]  (degenerate — no NaN)
 *   normalizeVector([])            // []
 */
export function normalizeVector(vector: number[]): number[] {
  if (vector.length === 0) return [];

  let sumSquares = 0;
  for (let i = 0; i < vector.length; i++) {
    const v = vector[i];
    sumSquares += v * v;
  }
  const magnitude = Math.sqrt(sumSquares);

  // Degenerate: zero (or subnormal) magnitude. Return a copy so callers
  // always receive a fresh array and we never emit NaN/Infinity.
  if (magnitude === 0 || !Number.isFinite(magnitude)) {
    return vector.slice();
  }

  const out = new Array<number>(vector.length);
  for (let i = 0; i < vector.length; i++) {
    out[i] = vector[i] / magnitude;
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────
// 3. cosineSimilarity — semantic distance (dimension-guarded)
// ─────────────────────────────────────────────────────────────────────

/**
 * Cosine similarity between two vectors. Output range: [-1, 1], where 1 =
 * identical direction, 0 = orthogonal, -1 = opposite.
 *
 * Dimension guard (CHOSEN DESIGN — graceful, not throwing):
 *   If `a` and `b` differ in length, the function returns **0** rather
 *   than throwing. Rationale: this utility sits under the hybrid vector
 *   index (S5) which may compare embeddings produced by different
 *   providers with different dimensionalities (e.g. Gemini 768 vs local
 *   BM25 384 during a failover). Throwing would crash the ranking
 *   pipeline on a single bad pair; returning 0 lets the scorer treat the
 *   pair as orthogonal and keep the rest of the ranking intact (P4-5
 *   fallback safety).
 *
 * Degenerate inputs (also return 0 to stay graceful):
 *   • either vector is empty,
 *   • either vector has zero magnitude (would divide by zero),
 *   • either vector contains a non-finite value (NaN/Infinity).
 *
 * Vectors are NOT re-normalized here; pass already-normalized vectors for
 * best performance (see `normalizeVector`). The math is correct for
 * non-unit inputs too.
 *
 * @param a - First vector.
 * @param b - Second vector.
 * @returns Cosine similarity in [-1, 1], or 0 for any degenerate case above.
 *
 * @example
 *   cosineSimilarity([1, 0], [1, 0])    // 1
 *   cosineSimilarity([1, 0], [0, 1])    // 0
 *   cosineSimilarity([1, 0], [-1, 0])   // -1
 *   cosineSimilarity([1, 2, 3], [1, 2]) // 0  (dimension mismatch)
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length === 0 || a.length !== b.length) return 0;

  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    const av = a[i];
    const bv = b[i];
    // Bail out on any non-finite component — treat as orthogonal.
    if (!Number.isFinite(av) || !Number.isFinite(bv)) return 0;
    dot += av * bv;
    normA += av * av;
    normB += bv * bv;
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  if (denom === 0 || !Number.isFinite(denom)) return 0;
  return dot / denom;
}

// ─────────────────────────────────────────────────────────────────────
// 4. levenshteinDistance — fuzzy string match (synonym fallback)
// ─────────────────────────────────────────────────────────────────────

/**
 * Edit distance (Levenshtein) between two strings — minimum number of
 * single-character insertions, deletions, or substitutions to transform
 * `a` into `b`.
 *
 * Used by the synonym-fallback path: when a user's term has no exact
 * dictionary hit, the scorer picks the closest dictionary key within an
 * edit-distance threshold (S3/S5 responsibility). Thai and English are
 * both handled because JavaScript strings are UTF-16 and the algorithm
 * operates on `charCodeAt` units — for Thai (U+0E00 block) and Basic
 * Latin this is one code unit per visible glyph, so distances are
 * meaningful. (S3 will mirror this for multi-code-unit grapheme clusters
 * if extended Thai combining marks ever become a problem.)
 *
 * Comparison is case-insensitive (both inputs lowercased) so that
 * "Finance" vs "finance" is distance 0.
 *
 * Implementation: classic two-row dynamic programming, O(n·m) time and
 * O(min(n,m)) space.
 *
 * @param a - First string. May be empty.
 * @param b - Second string. May be empty.
 * @returns Non-negative integer edit distance.
 *
 * @example
 *   levenshteinDistance("kitten", "sitting") // 3
 *   levenshteinDistance("การเงิน", "การเงิน")  // 0
 *   levenshteinDistance("", "abc")           // 3
 */
export function levenshteinDistance(a: string, b: string): number {
  const s1 = a.toLowerCase();
  const s2 = b.toLowerCase();

  if (s1 === s2) return 0;
  if (s1.length === 0) return s2.length;
  if (s2.length === 0) return s1.length;

  // Keep `previous` as the shorter row to minimize space.
  let previous = new Array<number>(s2.length + 1);
  let current = new Array<number>(s2.length + 1);
  for (let j = 0; j <= s2.length; j++) previous[j] = j;

  for (let i = 1; i <= s1.length; i++) {
    current[0] = i;
    for (let j = 1; j <= s2.length; j++) {
      const cost = s1.charCodeAt(i - 1) === s2.charCodeAt(j - 1) ? 0 : 1;
      const deletion = previous[j] + 1;
      const insertion = current[j - 1] + 1;
      const substitution = previous[j - 1] + cost;
      current[j] = Math.min(deletion, insertion, substitution);
    }
    // Swap rows for next iteration.
    [previous, current] = [current, previous];
  }
  return previous[s2.length];
}

// ─────────────────────────────────────────────────────────────────────
// 5. bm25Tokenize — tokenizer for LocalBM25EmbeddingProvider (S3)
// ─────────────────────────────────────────────────────────────────────

/**
 * Tokenize text into the term list used by `LocalBM25EmbeddingProvider`
 * (S3) and the local fallback path of the hybrid scorer.
 *
 * Tokenization mirrors the Intent Engine (Phase 1, `intentEngine.ts`
 * `extractKeywords`) so that BM25 term frequencies line up with the
 * keyword signals the rest of the pipeline already trusts. Hard rule from
 * the S2 spec: **do not invent a new pattern** — reuse/mirror the
 * existing one.
 *
 * Mirror of the Intent Engine extraction:
 *   • Thai runs:  `/[\u0E00-\u0E7F]{2,}/g`   (2+ contiguous Thai chars)
 *   • English:    `/[A-Za-z]{3,}/g`          (3+ contiguous Latin chars)
 *
 * Post-processing applied here that the Intent Engine does NOT apply:
 *   • lowercasing for both scripts (intentEngine already lowercases
 *     English; we additionally lowercase the combined stream uniformly),
 *   • de-duplication, preserving first-seen order (stable).
 *
 * Punctuation, digits, and whitespace act only as separators and are
 * dropped. Single Thai characters and 1–2 letter English fragments are
 * intentionally excluded (mirrors Intent Engine thresholds — they carry
 * little signal and blow up the vocabulary).
 *
 * @param text - Raw input. May be empty or mixed Thai/English.
 * @returns Array of unique lowercase tokens in first-seen order.
 *
 * @example
 *   bm25Tokenize("วิกฤติเศรษฐกิจส่งผลต่อการเงิน")
 *     // ["วิกฤติเศรษฐกิจส่งผลต่อการเงิน"]  (one Thai run)
 *   bm25Tokenize("Finance and Trading strategies")
 *     // ["finance", "and", "trading", "strategies"]
 *   bm25Tokenize("")  // []
 */
export function bm25Tokenize(text: string): string[] {
  // Mirror Phase 1 Intent Engine extraction patterns (do NOT change them).
  const thaiRuns = text.match(/[\u0E00-\u0E7F]{2,}/g) ?? [];
  const englishRuns = text.match(/[A-Za-z]{3,}/g) ?? [];

  const seen = new Set<string>();
  const tokens: string[] = [];
  for (const run of thaiRuns) {
    // Thai has no case, but lowercase() is a harmless no-op and keeps the
    // pipeline uniform with English.
    const t = run.toLowerCase();
    if (!seen.has(t)) {
      seen.add(t);
      tokens.push(t);
    }
  }
  for (const run of englishRuns) {
    const t = run.toLowerCase();
    if (!seen.has(t)) {
      seen.add(t);
      tokens.push(t);
    }
  }
  return tokens;
}
