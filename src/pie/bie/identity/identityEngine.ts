// ─────────────────────────────────────────────────────────────────────
// BIE — Identity Layer
// Phase 4D S24 — Identity Engine (Singleton Row)
// ─────────────────────────────────────────────────────────────────────
//
// Provides:
//   IdentityEngine        — provider interface (DI-injectable)
//   DefaultIdentityEngine — concrete implementation
//
// Algorithm (DefaultIdentityEngine.buildProfile):
//   1. Build tag-id → BrainTreeTag lookup map.
//   2. Build dimensionId → LifeDimension lookup map (from BrainTreeDimension[]).
//   3. For each BrainEvidence, resolve dimension via its first linked tagId.
//   4. Bucket evidence into one of 7 identity categories by dimension +
//      preview keyword heuristics.
//   5. Score each entry: recency-decayed frequency aggregation.
//   6. Normalise per-category confidence to [0, 1], keep topN (default 5).
//   7. Build summary from top labels; return IdentityProfile with applied=false
//      (P4-12 HITL readonly literal — never applied=true from AI path).
//
// Temporal Compare (compareProfiles):
//   Encode each profile as sparse label-frequency vector (category:label pairs).
//   Cosine similarity over aligned vectors → [0, 1] identity stability score.
//
// Hard constraints honored:
//   P4-8  Additive only — zero existing signature removals.
//   P4-12 HITL: generated IdentityProfile carries `applied: false` literal.
//   P4-2  Zero UX/UI change — pure engine logic, no React/component imports.
//   P4-7  No PIE layer imports — only BIE types + utils.
// ─────────────────────────────────────────────────────────────────────

import type {
  BrainEvidence,
  BrainTreeDimension,
  BrainTreeTag,
  LifeDimension,
} from "../../../types";
import { cosineSimilarity } from "../utils";
import { resolveEvidenceText } from "../analysisContext";
import type { JournalMemoryResolver } from "../journalMemoryResolver";
import type {
  IdentityEntry,
  IdentityProfile,
  IdentityRow,
} from "./types";

// ─────────────────────────────────────────────────────────────────────
// Supporting types
// ─────────────────────────────────────────────────────────────────────

/** Identity category keys (the 7 entry-list fields + summary). */
type IdentityCategoryKey =
  | "coreValues"
  | "goals"
  | "motivations"
  | "personality"
  | "strengths"
  | "weaknesses"
  | "thinkingPattern";

/** Context object injected into buildProfile at call site. */
export interface IdentityBuildContext {
  /** All evidence records available (from Brain Tree / Journal sources). */
  evidences: BrainEvidence[];
  /**
   * All Brain Tree tags. Used for tagId → dimensionId resolution.
   * (Dimension → LifeDimension mapping is resolved via `dimensions`.)
   */
  tags: BrainTreeTag[];
  /**
   * All Brain Tree dimensions. Required to map
   * `BrainTreeTag.brainTreeDimensionId` → `LifeDimension`.
   */
  dimensions: BrainTreeDimension[];
  /** Current Unix ms timestamp (used for recency decay). Defaults to Date.now(). */
  nowMs?: number;
  /** Max entries to keep per identity category. Defaults to 5. */
  topN?: number;
  /**
   * Architect Fix 1 (Final): read-only resolver from BrainEvidence.sourceId
   * to the original JournalEntry (canonical memory). When supplied, journal
   * evidence is bucketed using the real Journal content instead of only
   * the 140-char `preview` — see analysisContext.ts. Optional and
   * backward-compatible: omitting it preserves the previous preview-only
   * behavior exactly.
   */
  resolveJournalMemory?: JournalMemoryResolver;
}

// ─────────────────────────────────────────────────────────────────────
// IdentityEngine Interface
// ─────────────────────────────────────────────────────────────────────

/**
 * Provider interface for the Identity Engine (Phase 4D S24).
 * Dependency-injectable: swap DefaultIdentityEngine for any alternative impl.
 */
export interface IdentityEngine {
  /**
   * Scan evidence + tags + dimensions → build a fresh 8-category IdentityProfile.
   *
   * HITL invariant (P4-12): returned profile carries `applied: false`
   * as a readonly literal — callers MUST route through the HITL Confirm UI
   * before persisting with `applied = true`.
   *
   * @param context — Evidence + tag + dimension data + optional tuning params.
   * @returns       A full IdentityProfile ready for HITL review.
   */
  buildProfile(context: IdentityBuildContext): Promise<IdentityProfile>;

  /**
   * Compute cosine similarity between two IdentityProfile snapshots.
   *
   * Use case: "Who Am I Today vs 6 Months Ago" identity stability score.
   * Encodes profiles as sparse category×label frequency vectors, then runs cosine.
   *
   * @param a — Earlier profile snapshot (e.g. 6 months ago).
   * @param b — Current profile.
   * @returns   Similarity in [0, 1]. 1 = identical self-image; 0 = fully disjoint.
   */
  compareProfiles(
    a: IdentityProfile | IdentityRow,
    b: IdentityProfile | IdentityRow
  ): number;
}

// ─────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────

/** Half-life in ms for recency decay (~90 days). */
const RECENCY_HALF_LIFE_MS = 90 * 24 * 60 * 60 * 1000;

/**
 * Minimum number of evidence items required for an entry to reach full confidence (1.0).
 * Below this threshold, confidence is scaled down by a sufficiency factor.
 * This prevents single-evidence entries from showing 100% confidence.
 * Tunable constant — adjust based on empirical calibration (pattern matches hybridScorer.ts S8).
 */
export const MIN_EVIDENCE_FOR_FULL_CONFIDENCE = 5;

/**
 * Exponential recency weight in (0, 1].
 * 1.0 for brand new; ~0.5 at 90 days; floored at 0.1 so old evidence
 * still contributes rather than vanishing.
 */
function recencyWeight(occurredAtMs: number, nowMs: number): number {
  const ageMs = Math.max(0, nowMs - occurredAtMs);
  return Math.max(0.1, Math.exp((-Math.LN2 * ageMs) / RECENCY_HALF_LIFE_MS));
}

/**
 * Heuristic bucket: map one BrainEvidence to an IdentityCategoryKey
 * using its resolved LifeDimension + preview keyword signals.
 *
 * Returns null when the evidence doesn't map cleanly to any category.
 */
function bucketEvidence(
  evidence: BrainEvidence,
  dim: LifeDimension | undefined,
  analysisText: string
): IdentityCategoryKey | null {
  // Architect Fix 1 (Final): classify from the resolved analysis text
  // (real Journal content for kind:"journal" evidence when a resolver
  // was supplied; falls back to evidence.preview otherwise — see
  // resolveEvidenceText() in analysisContext.ts). This is the actual
  // fix: previously this always read `evidence.preview.toLowerCase()`
  // directly, so content past the 140-char preview cutoff could never
  // influence category classification.
  const preview = analysisText.toLowerCase();

  // ── Keyword-first overrides (language-agnostic heuristics) ──────

  // Core values signals
  if (
    preview.includes("value") ||
    preview.includes("ค่านิยม") ||
    preview.includes("believe") ||
    preview.includes("principle") ||
    preview.includes("หลักการ") ||
    dim === "values" ||
    dim === "identity"
  ) {
    return "coreValues";
  }

  // Goal signals
  if (
    preview.includes("goal") ||
    preview.includes("เป้าหมาย") ||
    preview.includes("want to") ||
    preview.includes("aspire") ||
    preview.includes("dream") ||
    preview.includes("อยากทำ") ||
    dim === "goal"
  ) {
    return "goals";
  }

  // Motivation signals
  if (
    preview.includes("motivat") ||
    preview.includes("แรงจูงใจ") ||
    preview.includes("driven by") ||
    preview.includes("passion") ||
    preview.includes("inspire") ||
    preview.includes("แรงบันดาลใจ")
  ) {
    return "motivations";
  }

  // Personality signals
  if (
    preview.includes("personality") ||
    preview.includes("บุคลิก") ||
    preview.includes("introvert") ||
    preview.includes("extrovert") ||
    preview.includes("tend to") ||
    dim === "relationship" ||
    dim === "emotion"
  ) {
    return "personality";
  }

  // Strength signals
  if (
    preview.includes("strength") ||
    preview.includes("จุดแข็ง") ||
    preview.includes("good at") ||
    preview.includes("skill") ||
    preview.includes("excel") ||
    preview.includes("ถนัด") ||
    dim === "work" ||
    dim === "health"
  ) {
    return "strengths";
  }

  // Weakness signals
  if (
    preview.includes("weakness") ||
    preview.includes("จุดอ่อน") ||
    preview.includes("struggle") ||
    preview.includes("challenge") ||
    preview.includes("improve") ||
    preview.includes("ต้องพัฒนา")
  ) {
    return "weaknesses";
  }

  // Thinking pattern signals
  if (
    preview.includes("pattern") ||
    preview.includes("รูปแบบ") ||
    preview.includes("always") ||
    preview.includes("tend to think") ||
    preview.includes("habit") ||
    preview.includes("นิสัย") ||
    dim === "mindset" ||
    dim === "learning"
  ) {
    return "thinkingPattern";
  }

  // ── Dimension-only fallback ───────────────────────────────────────
  switch (dim) {
    case "finance":   return "goals";
    case "lifestyle": return "personality";
    case "hobby":     return "strengths";
    default:          return null; // unmappable — skip evidence
  }
}

/**
 * Derive a short label from an evidence preview.
 * Capitalises and trims to 60 chars for Confirm UI readability.
 */
function evidenceToLabel(evidence: BrainEvidence): string {
  const raw = evidence.preview.trim().slice(0, 60);
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

/**
 * Encode a profile as a sparse label-frequency map keyed by
 * `"<category>:<normalised-label>"` for cosine comparison.
 */
function profileToLabelMap(
  profile: IdentityProfile | IdentityRow
): Map<string, number> {
  const categories: IdentityCategoryKey[] = [
    "coreValues",
    "goals",
    "motivations",
    "personality",
    "strengths",
    "weaknesses",
    "thinkingPattern",
  ];
  const map = new Map<string, number>();
  for (const cat of categories) {
    const entries = profile[cat] as IdentityEntry[];
    for (const e of entries) {
      const key = `${cat}:${e.label.toLowerCase().trim()}`;
      map.set(key, (map.get(key) ?? 0) + e.confidence);
    }
  }
  return map;
}

/**
 * Convert two sparse label-frequency maps into aligned dense vectors
 * and compute cosine similarity using the BIE utils function.
 */
function sparseMapCosine(
  a: Map<string, number>,
  b: Map<string, number>
): number {
  const allKeys = new Set([...a.keys(), ...b.keys()]);
  const vecA: number[] = [];
  const vecB: number[] = [];
  for (const key of allKeys) {
    vecA.push(a.get(key) ?? 0);
    vecB.push(b.get(key) ?? 0);
  }
  return cosineSimilarity(vecA, vecB);
}

// ─────────────────────────────────────────────────────────────────────
// DefaultIdentityEngine — Concrete Implementation
// ─────────────────────────────────────────────────────────────────────

export class DefaultIdentityEngine implements IdentityEngine {
  /**
   * Build a fresh IdentityProfile by scanning evidence + tags + dimensions.
   *
   * Full algorithm:
   * 1. Build `tagMap`: tagId → BrainTreeTag for O(1) lookup.
   * 2. Build `dimMap`: brainTreeDimensionId → LifeDimension name for
   *    resolving the dimension of each evidence record.
   * 3. For each BrainEvidence:
   *    a. Resolve the primary dimension via its first linked tagId.
   *    b. Bucket into a category (or skip if unmappable).
   *    c. Derive a display label from the evidence preview.
   *    d. Accumulate frequency score = recencyWeight(occurredAt, now).
   *       Multiple evidences with identical labels are merged.
   * 4. Normalise per-category confidence to [0, 1] (divide by max score).
   * 5. Sort by confidence desc; keep topN (default 5) per category.
   * 6. Build a free-form Thai summary from top entry per category.
   * 7. Return IdentityProfile with applied=false (P4-12 readonly literal).
   */
  async buildProfile(context: IdentityBuildContext): Promise<IdentityProfile> {
    const {
      evidences,
      tags,
      dimensions,
      nowMs = Date.now(),
      topN = 5,
      resolveJournalMemory,
    } = context;

    // ── 1. Build lookup maps ──────────────────────────────────────────
    const tagMap = new Map<string, BrainTreeTag>();
    for (const tag of tags) {
      tagMap.set(tag.id, tag);
    }

    // Map dimensionId → LifeDimension id (e.g. "work", "health", "values")
    const dimIdMap = new Map<string, LifeDimension>();
    for (const dim of dimensions) {
      dimIdMap.set(dim.id, dim.id as LifeDimension);
    }

    // ── 2. Accumulators ───────────────────────────────────────────────
    type Accumulator = Map<string, { totalScore: number; evidenceIds: string[] }>;
    const buckets: Record<IdentityCategoryKey, Accumulator> = {
      coreValues:      new Map(),
      goals:           new Map(),
      motivations:     new Map(),
      personality:     new Map(),
      strengths:       new Map(),
      weaknesses:      new Map(),
      thinkingPattern: new Map(),
    };

    // ── 3. Process each evidence ──────────────────────────────────────
    for (const ev of evidences) {
      // Resolve primary dimension from first linked tagId
      const primaryTagId = ev.brainTreeTagIds[0];
      const tag = primaryTagId ? tagMap.get(primaryTagId) : undefined;
      const dim: LifeDimension | undefined = tag
        ? dimIdMap.get(tag.brainTreeDimensionId)
        : undefined;

      const analysisText = resolveEvidenceText(ev, resolveJournalMemory);
      const category = bucketEvidence(ev, dim, analysisText);
      if (!category) continue;

      const label = evidenceToLabel(ev);
      if (!label) continue;

      const recency = recencyWeight(ev.occurredAt, nowMs);
      const score = recency; // base score = recency (tag growth score used if available)

      const bucket = buckets[category];
      const existing = bucket.get(label);
      if (existing) {
        existing.totalScore += score;
        existing.evidenceIds.push(ev.id);
      } else {
        bucket.set(label, { totalScore: score, evidenceIds: [ev.id] });
      }
    }

    // ── 4–5. Normalise and keep topN per category ─────────────────────
    const buildEntries = (acc: Accumulator): IdentityEntry[] => {
      if (acc.size === 0) return [];
      const raw = [...acc.entries()].map(([label, { totalScore, evidenceIds }]) => ({
        label,
        confidence: totalScore,
        evidenceIds,
      }));
      raw.sort((a, b) => b.confidence - a.confidence);
      const maxScore = raw[0].confidence;
      return raw
        .map((e) => {
          const relativeScore = maxScore > 0 ? Math.min(1, e.confidence / maxScore) : 0;
          // Sufficiency factor: scale confidence by evidence count to prevent
          // single-evidence entries from showing 100% confidence.
          const sufficiencyFactor = Math.min(1, e.evidenceIds.length / MIN_EVIDENCE_FOR_FULL_CONFIDENCE);
          return {
            ...e,
            confidence: relativeScore * sufficiencyFactor,
          };
        })
        .slice(0, topN);
    };

    const coreValues      = buildEntries(buckets.coreValues);
    const goals           = buildEntries(buckets.goals);
    const motivations     = buildEntries(buckets.motivations);
    const personality     = buildEntries(buckets.personality);
    const strengths       = buildEntries(buckets.strengths);
    const weaknesses      = buildEntries(buckets.weaknesses);
    const thinkingPattern = buildEntries(buckets.thinkingPattern);

    // ── 6. Generate summary ───────────────────────────────────────────
    const top = (entries: IdentityEntry[]) => entries[0]?.label ?? null;
    const summaryParts: string[] = [];
    if (top(coreValues))      summaryParts.push(`ค่านิยมหลัก: ${top(coreValues)}`);
    if (top(goals))           summaryParts.push(`เป้าหมาย: ${top(goals)}`);
    if (top(strengths))       summaryParts.push(`จุดแข็ง: ${top(strengths)}`);
    if (top(personality))     summaryParts.push(`บุคลิกภาพ: ${top(personality)}`);
    if (top(thinkingPattern)) summaryParts.push(`รูปแบบความคิด: ${top(thinkingPattern)}`);
    const summary =
      summaryParts.length > 0
        ? summaryParts.join(" | ")
        : "ยังไม่มีข้อมูลเพียงพอสำหรับสร้างโปรไฟล์ตัวตน";

    // ── 7. Return with applied=false (P4-12 HITL literal) ────────────
    return {
      id: "singleton",
      coreValues,
      goals,
      motivations,
      personality,
      strengths,
      weaknesses,
      thinkingPattern,
      summary,
      generatedAt: nowMs,
      applied: false,
    } as const;
  }

  /**
   * Compute identity similarity between two IdentityProfile snapshots.
   *
   * Encodes each profile as a label-frequency sparse vector (category:label),
   * aligns both vectors, then returns cosineSimilarity in [0, 1].
   *
   * @param a — Older snapshot (e.g. "6 months ago").
   * @param b — Current profile.
   * @returns   Similarity in [0, 1]. 1 = identical; 0 = fully disjoint.
   */
  compareProfiles(
    a: IdentityProfile | IdentityRow,
    b: IdentityProfile | IdentityRow
  ): number {
    const mapA = profileToLabelMap(a);
    const mapB = profileToLabelMap(b);
    if (mapA.size === 0 && mapB.size === 0) return 1; // both empty → identical
    if (mapA.size === 0 || mapB.size === 0) return 0; // one empty → disjoint
    return sparseMapCosine(mapA, mapB);
  }
}
