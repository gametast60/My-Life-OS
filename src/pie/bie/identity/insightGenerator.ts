// ─────────────────────────────────────────────────────────────────────
// BIE — Identity Layer
// Phase 4D S25 — Insight Generator (6 Kinds, FIFO 100)
// ─────────────────────────────────────────────────────────────────────
//
// Provides:
//   InsightGenerator        — provider interface (DI-injectable)
//   DefaultInsightGenerator — concrete implementation
//
// 6 Insight Types generated:
//   reflection  — evidence preview patterns that invite self-reflection
//   pattern     — recurring label / dimension appearing ≥3 times in window
//   milestone   — evidence whose preview signals an achievement
//   gap         — LifeDimension with fewer than THIN_THRESHOLD evidences
//   conflict    — two evidence previews in the same dimension carry
//                 contradictory sentiment signals
//   prediction  — dimension whose evidence count is trending up vs prior period
//
// All generated InsightItem objects carry `applied: false` as a
// readonly literal (P4-12 HITL invariant — never applied=true from AI path).
//
// Hard constraints honored:
//   P4-8  Additive only — zero existing signature removals.
//   P4-12 HITL: applied: false on every InsightItem.
//   P4-2  Zero UX/UI change — pure engine logic, no React imports.
//   P4-7  No PIE layer imports — BIE types + utils only.
// ─────────────────────────────────────────────────────────────────────

import type {
  BrainEvidence,
  BrainTreeDimension,
  BrainTreeTag,
  LifeDimension,
} from "../../../types";
import type { IdentityProfile, IdentityRow, InsightItem, InsightType } from "./types";

// ─────────────────────────────────────────────────────────────────────
// Supporting types
// ─────────────────────────────────────────────────────────────────────

/** Context object injected into generateInsights at call site. */
export interface InsightGeneratorContext {
  /** All evidence records available (Brain Tree / Journal). */
  evidences: BrainEvidence[];
  /** All Brain Tree tags (for dimension resolution). */
  tags: BrainTreeTag[];
  /** All Brain Tree dimensions (for dimensionId → LifeDimension mapping). */
  dimensions: BrainTreeDimension[];
  /**
   * Current identity profile (optional).
   * When provided, enables conflict detection within identity categories.
   */
  identityProfile?: IdentityProfile | IdentityRow;
  /** Current Unix ms timestamp. Defaults to Date.now(). */
  nowMs?: number;
  /** Max total insights to return. Defaults to 20. */
  maxInsights?: number;
}

// ─────────────────────────────────────────────────────────────────────
// InsightGenerator Interface
// ─────────────────────────────────────────────────────────────────────

/**
 * Provider interface for the Insight Generator engine (Phase 4D S25).
 * Dependency-injectable: swap DefaultInsightGenerator for any alternative.
 */
export interface InsightGenerator {
  /**
   * Analyse evidence + optional identity profile → produce InsightItem[].
   *
   * HITL invariant (P4-12): every returned InsightItem carries
   * `applied: false` as a readonly literal. Callers route items through
   * `appendInsight()` (→ `bie_insights` queue) and the Confirm UI.
   *
   * @param context — Evidence, tags, dimensions + optional tuning params.
   * @returns       Array of InsightItems ready for HITL review (deduplicated,
   *                capped at `maxInsights`).
   */
  generateInsights(context: InsightGeneratorContext): Promise<InsightItem[]>;
}

// ─────────────────────────────────────────────────────────────────────
// Internal constants & helpers
// ─────────────────────────────────────────────────────────────────────

/** Dimension with fewer evidences than this is flagged as a "gap". */
const GAP_THIN_THRESHOLD = 3;

/** Minimum occurrences of a label/dimension to be flagged as a "pattern". */
const PATTERN_MIN_COUNT = 3;

/** Rolling window (ms) for recency-sensitive insight types (~6 months). */
const ROLLING_WINDOW_MS = 180 * 24 * 60 * 60 * 1000;

/** Older half-window for trend prediction comparison (~3–6 months ago). */
const TREND_OLDER_WINDOW_START_MS = 180 * 24 * 60 * 60 * 1000;
const TREND_OLDER_WINDOW_END_MS   =  90 * 24 * 60 * 60 * 1000;

/** Positive achievement keywords for milestone detection (Thai + English). */
const MILESTONE_KEYWORDS = [
  "complete", "finish", "achieve", "success", "done", "launch",
  "สำเร็จ", "ทำได้", "เสร็จ", "ผ่าน", "ได้รับ", "เริ่ม", "เปิดตัว",
  "milestone", "first time", "ครั้งแรก",
];

/** Reflection keywords — evidence inviting introspection. */
const REFLECTION_KEYWORDS = [
  "reflect", "realise", "realize", "wonder", "question", "learn from",
  "สะท้อน", "ตระหนัก", "เรียนรู้จาก", "ตั้งคำถาม", "ทบทวน", "เข้าใจ",
];

/** Positive sentiment tokens for conflict detection. */
const POSITIVE_TOKENS = ["love", "enjoy", "great", "strong", "ชอบ", "รัก", "เก่ง", "ดี", "สนุก"];
/** Negative sentiment tokens for conflict detection. */
const NEGATIVE_TOKENS = ["hate", "avoid", "weak", "fear", "ไม่ชอบ", "กลัว", "อ่อน", "เลี่ยง", "ยาก"];

/** UUID-lite for insight ids (collision-safe for personal-scale FIFO 100). */
function newId(): string {
  return `ins-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Build dimensionId → LifeDimension map from BrainTreeDimension[]. */
function buildDimMap(dimensions: BrainTreeDimension[]): Map<string, LifeDimension> {
  const m = new Map<string, LifeDimension>();
  for (const d of dimensions) {
    m.set(d.id, d.id as LifeDimension);
  }
  return m;
}

/** Build tagId → BrainTreeTag map. */
function buildTagMap(tags: BrainTreeTag[]): Map<string, BrainTreeTag> {
  const m = new Map<string, BrainTreeTag>();
  for (const t of tags) m.set(t.id, t);
  return m;
}

/** Resolve the primary LifeDimension for an evidence record. */
function resolveDim(
  ev: BrainEvidence,
  tagMap: Map<string, BrainTreeTag>,
  dimMap: Map<string, LifeDimension>
): LifeDimension | undefined {
  const tid = ev.brainTreeTagIds[0];
  if (!tid) return undefined;
  const tag = tagMap.get(tid);
  if (!tag) return undefined;
  return dimMap.get(tag.brainTreeDimensionId);
}

/** True if preview contains any of the given keyword tokens. */
function hasKeyword(preview: string, keywords: string[]): boolean {
  const p = preview.toLowerCase();
  return keywords.some((k) => p.includes(k));
}

/** Positive / negative sentiment polarity: 1 = positive, -1 = negative, 0 = neutral. */
function polarity(preview: string): 1 | -1 | 0 {
  const p = preview.toLowerCase();
  const pos = POSITIVE_TOKENS.some((k) => p.includes(k));
  const neg = NEGATIVE_TOKENS.some((k) => p.includes(k));
  if (pos && !neg) return 1;
  if (neg && !pos) return -1;
  return 0;
}

/** Build an InsightItem with applied: false literal (P4-12). */
function makeInsight(
  type: InsightType,
  title: string,
  description: string,
  confidence: number,
  dataContext: Record<string, unknown> = {}
): InsightItem {
  return {
    id: newId(),
    type,
    title,
    description,
    confidence: Math.min(1, Math.max(0, confidence)),
    dataContext,
    generatedAt: Date.now(),
    applied: false,
  } as const;
}

// ─────────────────────────────────────────────────────────────────────
// DefaultInsightGenerator — Concrete Implementation
// ─────────────────────────────────────────────────────────────────────

export class DefaultInsightGenerator implements InsightGenerator {
  /**
   * Generate up to `maxInsights` (default 20) InsightItems from the
   * supplied context by running 6 detection passes in order:
   *
   * 1. **reflection** — evidence with reflection keyword signals
   * 2. **pattern**    — dimension/label occurring ≥ PATTERN_MIN_COUNT times
   * 3. **milestone**  — evidence with achievement keyword signals
   * 4. **gap**        — dimension with < GAP_THIN_THRESHOLD evidences
   * 5. **conflict**   — opposite-polarity evidence pairs in same dimension
   * 6. **prediction** — dimension trending up vs older rolling window
   *
   * All returned InsightItems carry `applied: false` (P4-12 HITL literal).
   */
  async generateInsights(ctx: InsightGeneratorContext): Promise<InsightItem[]> {
    const {
      evidences,
      tags,
      dimensions,
      nowMs = Date.now(),
      maxInsights = 20,
    } = ctx;

    const tagMap = buildTagMap(tags);
    const dimMap = buildDimMap(dimensions);

    // Filter to recent evidences within rolling window
    const recent = evidences.filter(
      (ev) => nowMs - ev.occurredAt <= ROLLING_WINDOW_MS
    );

    const insights: InsightItem[] = [];

    // ── 1. Reflection ──────────────────────────────────────────────
    for (const ev of recent) {
      if (hasKeyword(ev.preview, REFLECTION_KEYWORDS)) {
        insights.push(
          makeInsight(
            "reflection",
            "มีบางสิ่งที่ควรทบทวน",
            `หลักฐาน: "${ev.preview.slice(0, 80)}" ชวนให้ตั้งคำถามและสะท้อนความคิด`,
            0.7,
            { evidenceId: ev.id, preview: ev.preview.slice(0, 80) }
          )
        );
        if (insights.length >= maxInsights) return insights;
        break; // one reflection insight per pass is sufficient
      }
    }

    // ── 2. Pattern — recurring dimension ──────────────────────────
    const dimCounts = new Map<LifeDimension, number>();
    for (const ev of recent) {
      const dim = resolveDim(ev, tagMap, dimMap);
      if (dim) dimCounts.set(dim, (dimCounts.get(dim) ?? 0) + 1);
    }
    for (const [dim, count] of dimCounts) {
      if (count >= PATTERN_MIN_COUNT) {
        insights.push(
          makeInsight(
            "pattern",
            `รูปแบบพฤติกรรมซ้ำในมิติ "${dim}"`,
            `มีหลักฐาน ${count} รายการในมิติ "${dim}" ช่วง 6 เดือนที่ผ่านมา — อาจเป็นรูปแบบที่ฝังลึก`,
            Math.min(1, 0.5 + count * 0.05),
            { dimension: dim, evidenceCount: count }
          )
        );
        if (insights.length >= maxInsights) return insights;
      }
    }

    // ── 3. Milestone ───────────────────────────────────────────────
    for (const ev of recent) {
      if (hasKeyword(ev.preview, MILESTONE_KEYWORDS)) {
        const dim = resolveDim(ev, tagMap, dimMap);
        insights.push(
          makeInsight(
            "milestone",
            "ก้าวสำคัญที่น่าจดจำ",
            `"${ev.preview.slice(0, 80)}" เป็นสัญญาณของความสำเร็จหรือจุดเปลี่ยนสำคัญ`,
            0.75,
            { evidenceId: ev.id, dimension: dim, preview: ev.preview.slice(0, 80) }
          )
        );
        if (insights.length >= maxInsights) return insights;
        break; // one milestone per pass
      }
    }

    // ── 4. Gap — dimensions with thin evidence ─────────────────────
    // Build full dimension coverage from all (not just recent) evidences
    const allDimCounts = new Map<LifeDimension, number>();
    for (const ev of evidences) {
      const dim = resolveDim(ev, tagMap, dimMap);
      if (dim) allDimCounts.set(dim, (allDimCounts.get(dim) ?? 0) + 1);
    }
    // Check each known dimension
    const knownDims = new Set(dimMap.values());
    for (const dim of knownDims) {
      const count = allDimCounts.get(dim) ?? 0;
      if (count < GAP_THIN_THRESHOLD) {
        insights.push(
          makeInsight(
            "gap",
            `ช่องว่างความรู้ในมิติ "${dim}"`,
            `มิติ "${dim}" มีหลักฐานเพียง ${count} รายการ — ยังขาดข้อมูลเพียงพอสำหรับการวิเคราะห์ที่แม่นยำ`,
            0.8,
            { dimension: dim, evidenceCount: count, threshold: GAP_THIN_THRESHOLD }
          )
        );
        if (insights.length >= maxInsights) return insights;
      }
    }

    // ── 5. Conflict — opposing polarity pairs in same dimension ────
    const dimEvidences = new Map<LifeDimension, BrainEvidence[]>();
    for (const ev of recent) {
      const dim = resolveDim(ev, tagMap, dimMap);
      if (!dim) continue;
      const bucket = dimEvidences.get(dim) ?? [];
      bucket.push(ev);
      dimEvidences.set(dim, bucket);
    }
    for (const [dim, evList] of dimEvidences) {
      const pos = evList.filter((e) => polarity(e.preview) === 1);
      const neg = evList.filter((e) => polarity(e.preview) === -1);
      if (pos.length > 0 && neg.length > 0) {
        insights.push(
          makeInsight(
            "conflict",
            `ความขัดแย้งในมิติ "${dim}"`,
            `พบหลักฐานที่ขัดกัน — "${pos[0].preview.slice(0, 40)}" vs "${neg[0].preview.slice(0, 40)}" อาจสะท้อนถึงความขัดแย้งภายใน`,
            0.65,
            {
              dimension: dim,
              positiveSample: pos[0].preview.slice(0, 80),
              negativeSample: neg[0].preview.slice(0, 80),
            }
          )
        );
        if (insights.length >= maxInsights) return insights;
      }
    }

    // ── 6. Prediction — dimension trending up (recent > older) ─────
    const olderStart = nowMs - TREND_OLDER_WINDOW_START_MS;
    const olderEnd   = nowMs - TREND_OLDER_WINDOW_END_MS;
    const olderEvs   = evidences.filter(
      (ev) => ev.occurredAt >= olderStart && ev.occurredAt < olderEnd
    );
    const olderDimCounts = new Map<LifeDimension, number>();
    for (const ev of olderEvs) {
      const dim = resolveDim(ev, tagMap, dimMap);
      if (dim) olderDimCounts.set(dim, (olderDimCounts.get(dim) ?? 0) + 1);
    }
    for (const [dim, recentCount] of dimCounts) {
      const olderCount = olderDimCounts.get(dim) ?? 0;
      if (recentCount > olderCount + 1) {
        const growth = olderCount > 0
          ? Math.round(((recentCount - olderCount) / olderCount) * 100)
          : 100;
        insights.push(
          makeInsight(
            "prediction",
            `แนวโน้มการเติบโตในมิติ "${dim}"`,
            `กิจกรรมในมิติ "${dim}" เพิ่มขึ้น ${growth}% เทียบกับช่วงก่อนหน้า — แนวโน้มดี ควรรักษาโมเมนตัมนี้ไว้`,
            Math.min(1, 0.5 + growth / 200),
            { dimension: dim, recentCount, olderCount, growthPct: growth }
          )
        );
        if (insights.length >= maxInsights) return insights;
      }
    }

    return insights;
  }
}
