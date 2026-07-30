// ─────────────────────────────────────────────────────────────────────
// BIE — Thai/English Synonym Dictionary
// Phase 4A S2 — Pure data module + lookup helper (no I/O, no side effects)
// ─────────────────────────────────────────────────────────────────────
//
// Directly addresses Known Issue KI-101 (Semantic Retrieval missing —
// "วิกฤติเศรษฐกิจ" would not match the "การเงิน" dimension because the
// keyword extractor finds no shared token). With this dictionary the
// local fallback provider (S3 LocalBM25EmbeddingProvider) can expand a
// query term into its synonyms before scoring, so semantically related
// terms overlap even without a network embedding call.
//
// This is a SEED set only — intentionally small. The synonym table is
// expected to grow over time; S8 (Tuning & Weight Calibration) includes
// a bootstrap step to expand it from observed co-occurrence in evidence.
//
// Hard constraints honored:
//   P4-7  No PIE-layer imports.
//   P4-9  No concrete provider coupling.
//   Pure  — the exported helper is deterministic and side-effect free.
//
// Keying convention:
//   • Keys are stored LOWERCASE so lookups can be case-insensitive.
//   • A key may be Thai or English; its synonyms may be either script.
//   • Symmetry is NOT assumed at the data level. `expandSynonyms`
//     returns only the synonyms listed under the queried term. Callers
//     that need symmetric behavior should query both directions.
// ─────────────────────────────────────────────────────────────────────

/**
 * Synonym / related-term dictionary.
 *
 * Shape: `keyword → string[]` of synonyms or strongly related terms.
 * Resolves the KI-101 gap (e.g. `"วิกฤติเศรษฐกิจ" → ["การเงิน", "เงิน", ...]`)
 * so that the keyword-only fallback path can still surface the
 * `finance` dimension's Brain Tree content.
 *
 * The seed set below is scoped to the domains most commonly observed in
 * the Intent Engine keyword tables (Phase 1) plus the headline example
 * from KI-101. It is deliberately NOT exhaustive — S8 will bootstrap
 * the rest from real evidence co-occurrence.
 *
 * Keys are lowercase. Values are lowercase. This keeps the lookup
 * case-insensitive without runtime normalization of the dictionary.
 */
export const SYNONYM_DICTIONARY: Readonly<Record<string, string[]>> = {
  // ── Finance / money (KI-101 headline case) ───────────────────────
  "วิกฤติเศรษฐกิจ": ["การเงิน", "เงิน", "เศรษฐกิจ", "หนี้สิน", "finance", "money", "economic crisis"],
  เศรษฐกิจ: ["การเงิน", "เงิน", "finance", "economy"],
  การเงิน: ["เงิน", "การเงิน", "finance", "money", "เศรษฐกิจ"],
  เงิน: ["การเงิน", "finance", "money", "ค่าใช้จ่าย"],
  หนี้: ["หนี้สิน", "debt", "หนี้สินล้นพ้นตัว", "ภาระหนี้"],
  หนี้สิน: ["หนี้", "debt"],
  ลงทุน: ["invest", "investment", "การลงทุน", "พอร์ตการลงทุน"],
  การลงทุน: ["ลงทุน", "invest", "investment"],
  หุ้น: ["stock", "share", "ตลาดหุ้น"],
  ดอลลาร์: ["dollar", "usd", "เงินดอลลาร์"],
  ออม: ["save", "saving", "เก็บออม", "การออม"],

  // ── Work / career ────────────────────────────────────────────────
  งาน: ["อาชีพ", "work", "job", "การทำงาน", "ธุรกิจ"],
  อาชีพ: ["งาน", "career", "job", "วิชาชีพ"],
  การทำงาน: ["งาน", "work", "job"],
  ธุรกิจ: ["business", "งาน", "กิจการ"],

  // ── Health / body ────────────────────────────────────────────────
  สุขภาพ: ["health", "ร่างกาย", "การดูแลตัวเอง"],
  ออกกำลังกาย: ["exercise", "workout", "การออกกำลังกาย", "ฟิตเนส"],
  น้ำหนัก: ["weight", "น้ำหนักตัว", "ลดน้ำหนัก"],
  การนอน: ["sleep", "นอน", "พักผ่อน", "rest"],
  อาหาร: ["food", "กิน", "โภชนาการ", "nutrition"],

  // ── Emotion / mindset ────────────────────────────────────────────
  เครียด: ["stress", "ตึงเครียด", "กดดัน"],
  เศร้า: ["sad", "depressed", "เศร้าใจ", "ซึมเศร้า"],
  วิตกกังวล: ["anxiety", "anxious", "กังวล", "กลุ้มใจ"],
  กังวล: ["วิตกกังวล", "anxiety", "anxious"],
  ความกดดัน: ["stress", "pressure", "เครียด"],

  // ── Goal / planning ──────────────────────────────────────────────
  เป้าหมาย: ["goal", "target", "จุดมุ่งหมาย", "เป้า"],
  แผน: ["plan", "planning", "แผนการ", "แผนงาน"],
  วางแผน: ["plan", "planning", "การวางแผน"],
  ฝัน: ["dream", "ความฝัน", "มุ่งหวัง"],

  // ── Relationship ─────────────────────────────────────────────────
  ความสัมพันธ์: ["relationship", "ความผูกพัน", "สายสัมพันธ์"],
  ครอบครัว: ["family", "คนในครอบครัว", "ญาติพี่น้อง"],
  เพื่อน: ["friend", "friendship", "มิตรภาพ"],

  // ── Learning ─────────────────────────────────────────────────────
  เรียนรู้: ["learn", "learning", "ศึกษา", "การเรียนรู้"],
  ทักษะ: ["skill", "ความสามารถ", "capability"],
  ภาษา: ["language", "ภาษาอังกฤษ", "english"],

  // ── Self / identity ──────────────────────────────────────────────
  ตัวเอง: ["self", "myself", "ตัวตน", "identity"],
  ตัวตน: ["identity", "ตัวเอง", "self", "who am i"],
  บุคลิก: ["personality", "character", "นิสัย"],

  // ── English → cross-script mirrors (common queries) ──────────────
  finance: ["การเงิน", "เงิน", "money", "financial"],
  money: ["เงิน", "การเงิน", "finance"],
  invest: ["ลงทุน", "การลงทุน", "investment"],
  stress: ["เครียด", "ความกดดัน", "ตึงเครียด"],
  anxiety: ["วิตกกังวล", "กังวล", "anxious"],
  health: ["สุขภาพ", "ร่างกาย"],
  work: ["งาน", "การทำงาน", "job"],
  career: ["อาชีพ", "งาน", "วิชาชีพ"],
  goal: ["เป้าหมาย", "จุดมุ่งหมาย", "target"],
  plan: ["แผน", "วางแผน", "planning"],
  learn: ["เรียนรู้", "ศึกษา", "learning"],
  skill: ["ทักษะ", "ความสามารถ"],
  identity: ["ตัวตน", "ตัวเอง", "self"],
  relationship: ["ความสัมพันธ์", "ความผูกพัน"],
  family: ["ครอบครัว", "ญาติพี่น้อง"],
};

/**
 * Expand a single term into its synonyms / related terms.
 *
 * Lookup is **case-insensitive** — the input is lowercased before the
 * dictionary is consulted, because all keys in {@link SYNONYM_DICTIONARY}
 * are stored lowercase.
 *
 * The returned array does **NOT** include the queried term itself (callers
 * that need term ∪ synonyms should concatenate explicitly). Synonyms are
 * returned in dictionary order, de-duplicated.
 *
 * @param term - Keyword to look up. May be Thai or English, any case.
 * @returns Array of synonyms (lowercase). Empty when the term is absent
 *          from the dictionary, when input is empty, or when the matched
 *          entry has no synonyms. Always a fresh array — callers may
 *          mutate it freely.
 *
 * @example
 *   expandSynonyms("วิกฤติเศรษฐกิจ")
 *     // ["การเงิน", "เงิน", "เศรษฐกิจ", "หนี้สิน", "finance", "money", "economic crisis"]
 *   expandSynonyms("FINANCE")        // ["การเงิน", "เงิน", "money", "financial"]
 *   expandSynonyms("nonexistent")    // []
 *   expandSynonyms("")               // []
 */
export function expandSynonyms(term: string): string[] {
  const key = term.trim().toLowerCase();
  if (key.length === 0) return [];

  const synonyms = SYNONYM_DICTIONARY[key];
  if (!synonyms || synonyms.length === 0) return [];

  // De-duplicate while preserving first-seen order; return a fresh array
  // so the caller cannot mutate the underlying dictionary entry.
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of synonyms) {
    if (!seen.has(s)) {
      seen.add(s);
      out.push(s);
    }
  }
  return out;
}
