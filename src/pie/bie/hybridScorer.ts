// ─────────────────────────────────────────────────────────────────────
// BIE — HybridScorer (6-Factor Weighted Rank Formula)
// Phase 4A S5 — Σ (factor_i × weight_i)
// Phase 4A S8 — Named exported weight constants, Σ=1.0 guard, threshold
// ─────────────────────────────────────────────────────────────────────
//
// Six-factor scoring (bootstrap weights, SUM = 1.0 EXACT):
//   keywordScore          0.20   BM25 token Jaccard + synonym + fuzzy bonus
//   semanticScore         0.30   vector cosine from vectorIndex (S5)
//   tagMatchScore         0.15   hierarchical tag overlap + synonym
//   dimensionScore        0.10   LifeDimension filter match flag
//   recencyScore          0.10   30-day half-life exponential decay
//   confidenceScore       0.15   BrainEvidence/BrainTreeTag confidence
//
// Bootstrap weights are NOT tuned in S5. The S8 Tuning phase sweeps
// (weight_grid_search via evidence co-occurrence) and will adjust them
// as needed. Modifying these constants here is forbidden — the S8
// process owns weight changes.
//
// HITL invariant (P4-12):
//   PURE READ-ONLY ORCHESTRATION. No method calls saveEmbedding,
//   appendPendingBieItem, or any write path. The hybrid scorer only
//   re-ranks candidate RetrievalSource objects — it never produces
//   new structural knowledge suggestions. Structural suggestion
//   generation belongs to 4B (graph) and 4D (identity/insights).
//
// S1 RetrievalSource field reuse (P4-8 additive-only, no new types):
//   Fields `.semanticScore?` and `.tagMatchScore?` are ALREADY declared
//   as optional on `RetrievalSource` in S1 `pie/types.ts` (lines 50-52).
//   This module assigns numeric values to them on ranked output; S6
//   copies them onto the actual RetrievalSource list. No new fields
//   are required on any S1-declared type anywhere in S5.
//
// Zero wiring — NOT imported into any PIE layer or pipeline until S6.
// ─────────────────────────────────────────────────────────────────────

import type { LifeDimension } from "../../types";
import { bm25Tokenize, levenshteinDistance } from "./utils";
import { expandSynonyms } from "./synonyms";

// ─────────────────────────────────────────────────────────────────────
// S8: Named exported weight constants (Σ=1.0 exact).
// These replace the private S5 literals. S8 sweeps these values;
// downstream callers (tests, tuning scripts) import by name.
// HYBRID_WEIGHT_SUM is a runtime guard — if it ever drifts from 1.0
// the call site of scoreItem() will produce an obvious NaN sentinel.
// ─────────────────────────────────────────────────────────────────────

/** Keyword (BM25/Jaccard + levenshtein fuzzy) factor weight. */
export const HYBRID_WEIGHT_KEYWORD = 0.2;

/** Semantic cosine-similarity factor weight (from vectorIndex). */
export const HYBRID_WEIGHT_SEMANTIC = 0.3;

/** Tag overlap + synonym expansion factor weight. */
export const HYBRID_WEIGHT_TAG = 0.15;

/** LifeDimension filter match flag (0 or 1) factor weight. */
export const HYBRID_WEIGHT_DIMENSION = 0.1;

/** 30-day half-life exponential-decay recency factor weight. */
export const HYBRID_WEIGHT_RECENCY = 0.1;

/** Source/evidence confidence (0-1 raw value) factor weight. */
export const HYBRID_WEIGHT_CONFIDENCE = 0.15;

/**
 * Bundle object of all 6 weights (read-only). Useful for serialisation
 * and grid-search tooling in S8 tuning scripts.
 */
export const HYBRID_WEIGHTS: Readonly<{
  keyword: number;
  semantic: number;
  tag: number;
  dimension: number;
  recency: number;
  confidence: number;
}> = {
  keyword: HYBRID_WEIGHT_KEYWORD,
  semantic: HYBRID_WEIGHT_SEMANTIC,
  tag: HYBRID_WEIGHT_TAG,
  dimension: HYBRID_WEIGHT_DIMENSION,
  recency: HYBRID_WEIGHT_RECENCY,
  confidence: HYBRID_WEIGHT_CONFIDENCE,
};

/**
 * Runtime Σ=1.0 guard. Any floating-point deviation beyond 1e-9 is a
 * programmer error (weights edited without re-checking the sum).
 * Exported so tests can assert the invariant directly.
 */
export const HYBRID_WEIGHT_SUM: number = (() => {
  const sum =
    HYBRID_WEIGHT_KEYWORD +
    HYBRID_WEIGHT_SEMANTIC +
    HYBRID_WEIGHT_TAG +
    HYBRID_WEIGHT_DIMENSION +
    HYBRID_WEIGHT_RECENCY +
    HYBRID_WEIGHT_CONFIDENCE;
  if (Math.abs(sum - 1.0) > 1e-9) {
    // Developer error: weights must sum to exactly 1.0.
    throw new Error(
      `[HybridScorer] HYBRID_WEIGHTS do not sum to 1.0 (got ${sum}). ` +
        "Fix the weight constants before shipping."
    );
  }
  return sum;
})();

/**
 * Minimum semantic cosine score a candidate must exceed to be
 * considered "semantically relevant". Candidates below this threshold
 * still receive a semanticScore (it is used in the weighted sum) but
 * callers may use this constant to flag borderline matches in UI or
 * logging.
 *
 * Default: 0.60. S8 tuning may lower/raise this per evidence sweep.
 */
export const DEFAULT_SEMANTIC_RELEVANCE_THRESHOLD = 0.60;

// ─────────────────────────────────────────────────────────────────────
// Internal aliases for backward-compat within this file only.
// scoreItem() and rankItems() reference these so no magic literals remain.
// ─────────────────────────────────────────────────────────────────────
const KW_WEIGHT = HYBRID_WEIGHT_KEYWORD;
const SEM_WEIGHT = HYBRID_WEIGHT_SEMANTIC;
const TAG_WEIGHT = HYBRID_WEIGHT_TAG;
const DIM_WEIGHT = HYBRID_WEIGHT_DIMENSION;
const RECENCY_WEIGHT = HYBRID_WEIGHT_RECENCY;
const CONF_WEIGHT = HYBRID_WEIGHT_CONFIDENCE;

// ─────────────────────────────────────────────────────────────────────
// Local-only DTOs (not in S1 — these are scoring-specific transport
// types. They deliberately do NOT conflict with any S1 domain name:
//   - `ScorableItem` is a superset of fields needed to score one row;
//     the S6 call site maps each `RetrievalSource` into one of these.
//   - `HybridScoreContext` carries the per-query shared inputs.
// ─────────────────────────────────────────────────────────────────────

/**
 * Candidate item fed to the 6-factor scorer.
 *
 * Field mapping (from S1 `RetrievalSource`):
 *   - `textOrContent`  ← `source.content` (string)
 *   - `tags`           ← `source.tags` (string[])
 *   - `dimension`      ← `source.dimension` (LifeDimension | undefined)
 *   - `createdAtMs`    ← `source.timestamp` (number, already ms epoch)
 *   - `confidence`     ← derived by S6 layer from BrainEvidence.confidence
 *                        or BrainTreeTag priority-normalized to [0,1].
 *   - `embeddingId`    ← the id of the matching cached embedding (if
 *                        any); used to look up a precomputed score from
 *                        the `ctx.semanticScores` map.
 *
 * The fields `semanticScore` and `tagMatchScore` are NOT declared here
 * because they are attached by the `rankItems` return-type intersection
 * (see below). Their S1 declarations on `RetrievalSource` ensure the
 * pipeline treats them as first-class signals after S6 wiring.
 */
export interface ScorableItem {
  /** Raw content text used for the BM25 keyword factor. */
  textOrContent: string;
  /** Tags already attached to the item (tag-match factor input). */
  tags: string[];
  /** LifeDimension of the item; used for dimension-match flag. */
  dimension?: LifeDimension;
  /** Millisecond timestamp. Used for recency exponential decay. */
  createdAtMs?: number;
  /** [0, 1] confidence. Missing/NaN ⇒ confidence score = 0. */
  confidence?: number;
  /**
   * Optional. Id of the embedding record associated with this item.
   * Used to do a fast map-lookup for the semantic cosine score from
   * the vector-index top-N results. When `undefined`, the semantic
   * factor for this item evaluates to 0 (graceful degradation).
   */
  embeddingId?: string;
}

/**
 * Per-query shared context for the 6-factor scorer.
 */
export interface HybridScoreContext {
  /**
   * Query keywords extracted by the Intent Engine. These are the
   * user's original terms; the keyword factor expands them with
   * S2 synonym expansion before comparing against content.
   */
  queryKeywords: string[];
  /**
   * Optional LifeDimension filter from the pipeline context. When
   * set, an item whose `.dimension` equals this value receives
   * `dimensionScore = 1` (binary flag); otherwise 0.
   */
  filterDimension?: LifeDimension;
  /**
   * Optional pre-computed mapping from `EmbeddingRecord.id` to the
   * semantic cosine score produced by the vector-index top-N scan.
   *
   * S6 flow will call `vectorIndex.findSimilar` once per query and
   * pass the resulting hit map here. Items whose `embeddingId` is
   * not present in this map receive semanticScore = 0.
   */
  semanticScores?: Map<string, number>;
}

// ─────────────────────────────────────────────────────────────────────
// 1. computeKeywordScore — BM25 token Jaccard + synonym + fuzzy bonus
// ─────────────────────────────────────────────────────────────────────

/**
 * Keyword relevance score for a query-vs-content pair.
 *
 * Algorithm (additive, normalized to [0, 1]):
 *   1. Build expanded query tokens from `queryKeywords[]` — for each
 *      keyword string in the list:
 *        a. `bm25Tokenize(keyword)` to extract raw surface tokens
 *           (mirrors Intent Engine patterns — Thai 2+ char, English 3+).
 *        b. For each token append also `expandSynonyms(token)` hits
 *           with recall-over-precision weighting.
 *   2. Build content tokens from a single `bm25Tokenize(content)` pass.
 *   3. Compute token-set Jaccard overlap = |Q ∩ C| / |Q ∪ C|.
 *   4. Fuzzy bonus: for each query token that has NO exact match in
 *      content, scan content tokens for the best levenshtein match
 *      with distance ≤ 2 (edit distance small enough to catch typos
 *      and spelling variants without over-triggering); add a 0.3
 *      fractional match per qualifying hit.
 *   5. Final score = clamp((jaccard + fuzzy_total) / 1.3, 0, 1).
 *      (1.3 normalizes the ceiling so "everything matches" = 1.0.)
 *
 * @param queryKeywords - Raw query keyword strings (usually from
 *                        `IntentResult.keywords` in S1 pie/types.ts).
 * @param content       - The item's content text (usually `source.content`).
 *
 * @returns Number in [0, 1]. Always safe — degenerate inputs
 *          (empty keywords, empty content) return 0.
 */
export function computeKeywordScore(
  queryKeywords: string[],
  content: string
): number {
  const queryRaw: string[] = [];
  for (const kw of queryKeywords ?? []) {
    if (!kw) continue;
    const tokens = bm25Tokenize(kw);
    for (const t of tokens) {
      queryRaw.push(t);
      const expansions = expandSynonyms(t);
      for (const syn of expansions) queryRaw.push(syn);
    }
  }
  if (queryRaw.length === 0) return 0;

  const contentTokens = bm25Tokenize(content ?? "");
  if (contentTokens.length === 0) return 0;

  // De-dup both sides for the Jaccard formula.
  const Q = new Set(queryRaw);
  const C = new Set(contentTokens);

  let intersection = 0;
  for (const q of Q) if (C.has(q)) intersection++;
  const unionSize = Q.size + C.size - intersection;
  const jaccard = unionSize > 0 ? intersection / unionSize : 0;

  // Fuzzy bonus: only for query tokens WITHOUT an direct exact match.
  const contentArr = Array.from(C);
  let fuzzyHits = 0;
  const maxFuzzy = Math.max(1, Q.size);
  for (const q of Q) {
    if (C.has(q)) continue;
    let best = Infinity;
    for (const c of contentArr) {
      const d = levenshteinDistance(q, c);
      if (d < best) best = d;
    }
    if (best <= 2) {
      // Distance 0 would be exact (already handled); 1 = strong typo,
      // 2 = weak variant. Weight decays with distance.
      const contribution = best === 1 ? 0.3 : 0.15;
      fuzzyHits += contribution;
    }
  }
  const fuzzy = Math.min(0.3, fuzzyHits / Math.max(1, maxFuzzy) * 2.0);

  const raw = (jaccard + fuzzy) / 1.3;
  return raw < 0 ? 0 : raw > 1 ? 1 : raw;
}

// ─────────────────────────────────────────────────────────────────────
// 2. computeRecencyScore — 30-day half-life exponential decay
// ─────────────────────────────────────────────────────────────────────

/**
 * Recency score using a smooth 30-day half-life exponential decay.
 *
 * ```
 *   score = exp( -(nowMs - createdAtMs) / (30 * 86400 * 1000) )
 * ```
 *
 * Interpolation points:
 *   - nowMs === createdAtMs  → 1.000 (fresh)
 *   - 7  days old            → 0.853
 *   - 30 days old            → 0.368 (1/e ≡ half-life definition)
 *   - 90 days old            → 0.050 (essentially stale)
 *   - future dates (clock skew, createdAt > now) → clamped to 1.0
 *
 * @param createdAtMs - Item's timestamp in ms since the epoch. If
 *                      omitted or non-finite, the function returns 0
 *                      so that items without temporal metadata simply
 *                      contribute nothing to the recency factor.
 * @param nowMs       - Reference "now" in ms. Defaults to `Date.now()`.
 *                      Overridable for unit tests (determinism).
 *
 * @returns Number in [0, 1].
 */
export function computeRecencyScore(
  createdAtMs: number,
  nowMs: number = Date.now()
): number {
  if (!Number.isFinite(createdAtMs)) return 0;
  const THIRTY_DAYS_MS = 30 * 86400 * 1000;
  const delta = nowMs - createdAtMs;
  if (delta <= 0) return 1; // Future or same-moment → fully fresh.
  const raw = Math.exp(-delta / THIRTY_DAYS_MS);
  if (!Number.isFinite(raw)) return 0;
  return raw < 0 ? 0 : raw > 1 ? 1 : raw;
}

// ─────────────────────────────────────────────────────────────────────
// 3. Individual factor helpers (package-exported so S8 tuning phase
//    can sweep them one by one in isolation).
// ─────────────────────────────────────────────────────────────────────

/**
 * Compute the tag-overlap factor: synonym-expanded intersection over
 * the length of the expanded query-tag set.
 *
 * Algorithm (mirrors keyword factor but operates on structured tags):
 *   - For each item tag, expand synonyms; form a set union.
 *   - For each query keyword, expand synonyms; form a set union.
 *   - score = |tagSet ∩ querySet| / |querySet| (clamped to [0,1]).
 *
 * Returns 0 when either side has zero tokens.
 */
function computeTagMatchFactor(
  queryKeywords: string[],
  tags: string[]
): number {
  const qSet = new Set<string>();
  for (const kw of queryKeywords ?? []) {
    if (!kw) continue;
    const normalized = kw.trim().toLowerCase();
    if (!normalized) continue;
    qSet.add(normalized);
    for (const s of expandSynonyms(normalized)) qSet.add(s);
  }
  if (qSet.size === 0) return 0;

  const tSet = new Set<string>();
  for (const t of tags ?? []) {
    if (!t) continue;
    const normalized = t.trim().toLowerCase();
    if (!normalized) continue;
    tSet.add(normalized);
    for (const s of expandSynonyms(normalized)) tSet.add(s);
  }

  let overlap = 0;
  for (const q of qSet) if (tSet.has(q)) overlap++;
  const raw = overlap / qSet.size;
  return raw < 0 ? 0 : raw > 1 ? 1 : raw;
}

/**
 * Dimension-match flag: 1 if `item.dimension === filterDimension`
 * else 0. When `filterDimension` is undefined (no dimension filter in
 * the pipeline context) this function returns 0.5 so that all rows
 * receive a "neutral" contribution (the dimension filter path doesn't
 * punish rows just because the caller had no preference).
 *
 * Neutral=0.5 rationale: if we returned 0 for unset filter, rows with
 * ANY dimension would score higher than rows without a dimension tag
 * (since 0.1 × 1 > 0.1 × 0). Returning 0.5 with unset filter makes
 * the dimension factor a "no-op" baseline when no filter is active.
 */
function computeDimensionFactor(
  itemDimension: LifeDimension | undefined,
  filterDimension: LifeDimension | undefined
): number {
  if (!filterDimension) return 0.5; // Neutral when no filter.
  return itemDimension === filterDimension ? 1 : 0;
}

// ─────────────────────────────────────────────────────────────────────
// 4. scoreItem — composite weighted Σ
// ─────────────────────────────────────────────────────────────────────

/**
 * Compute the single 6-factor weighted composite score for one item.
 *
 * Formula (all factors clamped to [0,1] before weighting):
 * ```
 *   hybridScore = Σ (factor_i × weight_i)
 * ```
 *
 * Weights are the bootstrap constants declared at the top of this
 * file. S8 will sweep them; DO NOT modify them here.
 *
 * Missing optional fields on `item` yield `0` for their corresponding
 * factor (dimension factor returns `0.5` when no filter is active —
 * see {@link computeDimensionFactor} for rationale).
 *
 * @param item - Candidate row. See {@link ScorableItem}.
 * @param ctx  - Per-query shared inputs. See {@link HybridScoreContext}.
 *
 * @returns Number in [0, 1]. Never NaN, never negative.
 */
export function scoreItem(
  item: ScorableItem,
  ctx: HybridScoreContext
): number {
  const i = item ?? ({} as ScorableItem);
  const c = ctx ?? ({} as HybridScoreContext);

  const kw = computeKeywordScore(c.queryKeywords ?? [], i.textOrContent ?? "");

  // Semantic: Map<embeddingId → cosineScore [0,1]>.
  let sem = 0;
  if (i.embeddingId && c.semanticScores && c.semanticScores.has(i.embeddingId)) {
    const v = c.semanticScores.get(i.embeddingId);
    if (typeof v === "number" && Number.isFinite(v)) {
      sem = v < 0 ? 0 : v > 1 ? 1 : v;
    }
  }

  const tag = computeTagMatchFactor(c.queryKeywords ?? [], i.tags ?? []);
  const dim = computeDimensionFactor(i.dimension, c.filterDimension);
  const rec =
    typeof i.createdAtMs === "number" ? computeRecencyScore(i.createdAtMs) : 0;

  // Confidence: raw value from item; normalize to [0, 1], default 0.
  let conf = 0;
  if (typeof i.confidence === "number" && Number.isFinite(i.confidence)) {
    conf = i.confidence < 0 ? 0 : i.confidence > 1 ? 1 : i.confidence;
  }

  const sum =
    KW_WEIGHT * kw +
    SEM_WEIGHT * sem +
    TAG_WEIGHT * tag +
    DIM_WEIGHT * dim +
    RECENCY_WEIGHT * rec +
    CONF_WEIGHT * conf;

  // Clamp defensively (theoretically sum ∈ [0,1] always, but floating
  // point arithmetic could yield 1.00000000002 so we bound it).
  return sum < 0 ? 0 : sum > 1 ? 1 : sum;
}

// ─────────────────────────────────────────────────────────────────────
// 5. rankItems — compute per-factor breakdown, sort DESC, return top-N
// ─────────────────────────────────────────────────────────────────────

/**
 * Rank a list of candidate items using the 6-factor scorer.
 *
 * The returned items carry THREE additional numeric fields:
 *   - `hybridScore`   : Σ weighted [0,1] (primary sort key).
 *   - `semanticScore` : the raw semantic cosine factor value [0,1]
 *                       assigned to this item. THIS FIELD IS DECLARED
 *                       AS AN OPTIONAL PROPERTY ON `RetrievalSource`
 *                       IN S1 `pie/types.ts` (line 50) — the S6 wiring
 *                       layer copies it verbatim onto the corresponding
 *                       RetrievalSource row.
 *   - `tagMatchScore` : the raw tag-match factor [0,1]. Also already
 *                       declared in S1 (line 52); same copy rule.
 *
 * IMPORTANT: `hybridScore` itself is NOT declared on RetrievalSource.
 * It exists ONLY inside this module's return type and is used as the
 * internal sort key here; S6 does not copy it out (the existing PIE
 * 3-factor scorer already produces `.totalScore` for the pipeline
 * baseline, and the 6-factor hybrid value is folded into that via
 * S6's additive-only signature-preserving extension).
 *
 * @param items - Candidate rows. Order is irrelevant — the function
 *                produces a sorted output independently.
 * @param ctx   - Per-query inputs. See {@link HybridScoreContext}.
 * @param limit - Maximum rows to return after DESC sort by hybridScore.
 *                Default 50. Clamped to [1, 500].
 *
 * @returns Top `limit` rows, sorted by hybridScore DESC, with the
 *          three numeric fields attached. Tie-break is stable by
 *          createdAtMs DESC so newer items appear first within equal
 *          scores.
 */
export function rankItems(
  items: ScorableItem[],
  ctx: HybridScoreContext,
  limit: number = 50
): (ScorableItem & {
  hybridScore: number;
  semanticScore: number;
  tagMatchScore: number;
})[] {
  const safeLimit = Math.min(500, Math.max(1, limit | 0 || 1));
  const list = items ?? [];
  if (list.length === 0) return [];

  const semanticScores = ctx?.semanticScores;
  const queryKeywords = ctx?.queryKeywords ?? [];

  const ranked = new Array<
    ScorableItem & {
      hybridScore: number;
      semanticScore: number;
      tagMatchScore: number;
      _sortRecency: number;
    }
  >(list.length);

  for (let i = 0; i < list.length; i++) {
    const item = list[i];

    // Per-factor breakdown (keep raw kw/dim/rec/conf locally, expose
    // sem/tag as declared-S1 fields on the return shape).
    let sem = 0;
    if (item.embeddingId && semanticScores && semanticScores.has(item.embeddingId)) {
      const v = semanticScores.get(item.embeddingId);
      if (typeof v === "number" && Number.isFinite(v)) {
        sem = v < 0 ? 0 : v > 1 ? 1 : v;
      }
    }
    const tag = computeTagMatchFactor(queryKeywords, item.tags ?? []);
    const hybrid = scoreItem(item, ctx);
    const recRaw =
      typeof item.createdAtMs === "number" ? item.createdAtMs : 0;

    ranked[i] = {
      ...item,
      hybridScore: hybrid,
      semanticScore: sem,
      tagMatchScore: tag,
      _sortRecency: recRaw,
    };
  }

  // Primary: hybridScore DESC. Tie-break 1: createdAt DESC (newest
  // first). Tie-break 2: id string ASC (stable, if items have ids via
  // embeddingId; fallback to stable index compare if both ids absent
  // — but both ScorableItem and RetrievalSource carry ids in practice).
  ranked.sort((a, b) => {
    const d = b.hybridScore - a.hybridScore;
    if (d !== 0) return d;
    const r = b._sortRecency - a._sortRecency;
    if (r !== 0) return r;
    const aId = (a as unknown as { id?: string }).id ?? "";
    const bId = (b as unknown as { id?: string }).id ?? "";
    return aId < bId ? -1 : aId > bId ? 1 : 0;
  });

  // Strip the private _sortRecency helper before returning.
  const top = ranked.slice(0, safeLimit);
  return top.map(({ _sortRecency: _s, ...rest }) => rest) as (ScorableItem & {
    hybridScore: number;
    semanticScore: number;
    tagMatchScore: number;
  })[];
}
