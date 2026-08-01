// ─────────────────────────────────────────────────────────────────────
// BIE — Thai/English Synonym Dictionary
// Phase 4A S2 — Pure data module + lookup helper (no I/O, no side effects)
// Phase 4A S8 — Bootstrap validation + 15+ core pair expansion + opts API
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
  รายได้: ["income", "เงินได้", "รายรับ", "salary", "เงินเดือน"],
  รายจ่าย: ["expense", "ค่าใช้จ่าย", "cost", "spending"],
  งบประมาณ: ["budget", "plan", "แผนการเงิน"],

  // ── Work / career ────────────────────────────────────────────────
  งาน: ["อาชีพ", "work", "job", "การทำงาน", "ธุรกิจ"],
  อาชีพ: ["งาน", "career", "job", "วิชาชีพ"],
  การทำงาน: ["งาน", "work", "job"],
  ธุรกิจ: ["business", "งาน", "กิจการ"],
  ความสำเร็จ: ["success", "achievement", "accomplish", "สำเร็จ"],
  ผลงาน: ["performance", "output", "result", "ผล"],
  ประสิทธิภาพ: ["efficiency", "effectiveness", "performance"],

  // ── Health / body ────────────────────────────────────────────────
  สุขภาพ: ["health", "ร่างกาย", "การดูแลตัวเอง"],
  ออกกำลังกาย: ["exercise", "workout", "การออกกำลังกาย", "ฟิตเนส"],
  น้ำหนัก: ["weight", "น้ำหนักตัว", "ลดน้ำหนัก"],
  การนอน: ["sleep", "นอน", "พักผ่อน", "rest"],
  อาหาร: ["food", "กิน", "โภชนาการ", "nutrition"],
  พักผ่อน: ["rest", "relax", "การนอน", "sleep", "หยุดพัก"],

  // ── Emotion / mindset ────────────────────────────────────────────
  เครียด: ["stress", "ตึงเครียด", "กดดัน"],
  เศร้า: ["sad", "depressed", "เศร้าใจ", "ซึมเศร้า"],
  วิตกกังวล: ["anxiety", "anxious", "กังวล", "กลุ้มใจ"],
  กังวล: ["วิตกกังวล", "anxiety", "anxious"],
  ความกดดัน: ["stress", "pressure", "เครียด"],
  ความสุข: ["happiness", "happy", "joy", "สุข", "ยินดี"],
  มีความสุข: ["happy", "happiness", "joy", "สุข"],
  แรงจูงใจ: ["motivation", "inspire", "กระตุ้น", "motivated"],
  แรงบันดาลใจ: ["inspiration", "inspire", "motivation", "แรงจูงใจ"],
  โดดเดี่ยว: ["lonely", "loneliness", "alone", "เหงา"],
  เหงา: ["lonely", "loneliness", "โดดเดี่ยว"],
  กล้า: ["brave", "courage", "กล้าหาญ", "courageous"],
  ความกล้า: ["courage", "brave", "กล้าหาญ"],

  // ── Mindfulness / presence ───────────────────────────────────────
  สติ: ["mindfulness", "awareness", "present", "ตื่นรู้"],
  สมาธิ: ["focus", "concentration", "mindfulness", "meditation"],
  การทำสมาธิ: ["meditation", "mindfulness", "สมาธิ"],

  // ── Goal / planning ──────────────────────────────────────────────
  เป้าหมาย: ["goal", "target", "จุดมุ่งหมาย", "เป้า"],
  แผน: ["plan", "planning", "แผนการ", "แผนงาน"],
  วางแผน: ["plan", "planning", "การวางแผน"],
  ฝัน: ["dream", "ความฝัน", "มุ่งหวัง"],
  จุดมุ่งหมาย: ["purpose", "goal", "mission", "เป้าหมาย"],
  คุณค่า: ["value", "worth", "ความหมาย", "principles"],
  ค่านิยม: ["value", "values", "principles", "คุณค่า"],

  // ── Habits / discipline ──────────────────────────────────────────
  นิสัย: ["habit", "routine", "behavior", "พฤติกรรม"],
  วินัย: ["discipline", "self-control", "ความมีวินัย", "consistent"],
  กิจวัตร: ["routine", "habit", "daily routine", "นิสัย"],
  ความสม่ำเสมอ: ["consistency", "consistent", "discipline", "regular"],

  // ── Growth / learning ────────────────────────────────────────────
  การเติบโต: ["growth", "develop", "development", "เติบโต"],
  เติบโต: ["grow", "growth", "พัฒนา", "develop"],
  พัฒนา: ["develop", "improve", "growth", "progress"],
  เรียนรู้: ["learn", "learning", "ศึกษา", "การเรียนรู้"],
  ทักษะ: ["skill", "ความสามารถ", "capability"],
  ภาษา: ["language", "ภาษาอังกฤษ", "english"],
  ความก้าวหน้า: ["progress", "advance", "growth", "พัฒนา"],
  คำติชม: ["feedback", "ข้อเสนอแนะ", "review", "comment"],

  // ── Relationship ─────────────────────────────────────────────────
  ความสัมพันธ์: ["relationship", "ความผูกพัน", "สายสัมพันธ์"],
  ครอบครัว: ["family", "คนในครอบครัว", "ญาติพี่น้อง"],
  เพื่อน: ["friend", "friendship", "มิตรภาพ"],
  ความขัดแย้ง: ["conflict", "disagreement", "ปัญหา", "ทะเลาะ"],
  การสื่อสาร: ["communication", "communicate", "พูดคุย", "สนทนา"],
  พูดคุย: ["talk", "communicate", "conversation", "สนทนา"],

  // ── Self / identity ──────────────────────────────────────────────
  ตัวเอง: ["self", "myself", "ตัวตน", "identity"],
  ตัวตน: ["identity", "ตัวเอง", "self", "who am i"],
  บุคลิก: ["personality", "character", "นิสัย"],
  การสะท้อน: ["reflection", "reflect", "introspection", "ทบทวน"],
  ทบทวน: ["reflect", "review", "reflection", "ย้อนคิด"],
  เวลา: ["time", "ช่วงเวลา", "moment"],

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
  // S8 expanded English mirrors (15+ new pairs)
  happiness: ["ความสุข", "มีความสุข", "joy", "happy"],
  happy: ["ความสุข", "มีความสุข", "happiness", "joy"],
  motivation: ["แรงจูงใจ", "แรงบันดาลใจ", "inspire", "motivated"],
  inspiration: ["แรงบันดาลใจ", "แรงจูงใจ", "inspire"],
  habit: ["นิสัย", "กิจวัตร", "routine", "พฤติกรรม"],
  discipline: ["วินัย", "ความมีวินัย", "self-control", "consistent"],
  growth: ["การเติบโต", "เติบโต", "พัฒนา", "develop"],
  mindfulness: ["สติ", "สมาธิ", "awareness", "present"],
  reflection: ["การสะท้อน", "ทบทวน", "reflect", "introspection"],
  purpose: ["จุดมุ่งหมาย", "เป้าหมาย", "mission", "goal"],
  value: ["คุณค่า", "ค่านิยม", "worth", "principles"],
  conflict: ["ความขัดแย้ง", "ทะเลาะ", "disagreement"],
  communication: ["การสื่อสาร", "พูดคุย", "communicate", "สนทนา"],
  lonely: ["โดดเดี่ยว", "เหงา", "loneliness", "alone"],
  courage: ["ความกล้า", "กล้า", "brave", "กล้าหาญ"],
  progress: ["ความก้าวหน้า", "พัฒนา", "growth", "advance"],
  time: ["เวลา", "ช่วงเวลา", "moment"],
  success: ["ความสำเร็จ", "สำเร็จ", "achieve", "achievement"],
  feedback: ["คำติชม", "ข้อเสนอแนะ", "review", "comment"],
};

// ─────────────────────────────────────────────────────────────────────
// S8: Bootstrap Validation
// ─────────────────────────────────────────────────────────────────────

/**
 * Validate the integrity of {@link SYNONYM_DICTIONARY}.
 *
 * Checks:
 *   1. All keys are lowercase strings (keying convention).
 *   2. All value arrays are non-empty.
 *   3. No entry contains the key itself as one of its synonyms
 *      (reflexive entries cause infinite expansion loops).
 *   4. Minimum pair count threshold is met (bootstrap completeness guard).
 *
 * @param minPairs - Minimum number of entries expected. Default 50.
 * @returns `{ valid: boolean; errors: string[] }`. When `valid=true`
 *          `errors` is empty. Callers may throw on invalid if desired.
 *
 * @example
 *   const result = validateSynonymDictionary();
 *   if (!result.valid) throw new Error(result.errors.join("; "));
 */
export function validateSynonymDictionary(minPairs = 50): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const entries = Object.entries(SYNONYM_DICTIONARY);

  if (entries.length < minPairs) {
    errors.push(
      `Dictionary has only ${entries.length} entries; expected at least ${minPairs}.`
    );
  }

  for (const [key, synonyms] of entries) {
    // 1. Key must be lowercase.
    if (key !== key.toLowerCase()) {
      errors.push(`Key "${key}" is not lowercase.`);
    }

    // 2. Synonym list must be non-empty.
    if (!Array.isArray(synonyms) || synonyms.length === 0) {
      errors.push(`Key "${key}" has an empty synonym array.`);
      continue;
    }

    // 3. No reflexive entries (key ∈ its own synonyms).
    if (synonyms.includes(key)) {
      errors.push(`Key "${key}" appears as its own synonym (reflexive entry).`);
    }

    // 4. All synonym values must be non-empty strings.
    for (const s of synonyms) {
      if (typeof s !== "string" || s.trim().length === 0) {
        errors.push(`Key "${key}" contains an empty/invalid synonym value.`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

// ─────────────────────────────────────────────────────────────────────
// S8: expandSynonyms opts (additive — default behaviour unchanged)
// ─────────────────────────────────────────────────────────────────────

/**
 * Options for {@link expandSynonyms} (S8 additive extension).
 * All properties are optional — omitting them preserves the original
 * S2 behaviour exactly.
 */
export interface ExpandSynonymsOpts {
  /**
   * When `true` (default), the lookup key is lowercased before
   * consulting the dictionary. When `false`, an exact-case key is used
   * (only useful for a pre-normalised dictionary or testing).
   * Default: `true` (backward-compatible with S2 behaviour).
   */
  caseInsensitive?: boolean;

  /**
   * When `true`, Thai tonal diacritics (mai ek ่, mai tho ้, mai tri ๊,
   * mai jattawa ๋, mai tai khu ็, thanthakhat ์) are stripped from both
   * the lookup key and from any synonym values before returning.
   * Useful for broad recall matching when users omit tones.
   * Default: `false` (no stripping; S2-compatible output).
   */
  stripTones?: boolean;
}

/** Thai tonal diacritic code-points (Unicode combining marks). */
const THAI_TONE_RE = /[\u0E48\u0E49\u0E4A\u0E4B\u0E47\u0E4C]/g;

/**
 * Expand a single term into its synonyms / related terms.
 *
 * Lookup is **case-insensitive** by default (S2 behaviour preserved) —
 * the input is lowercased before the dictionary is consulted, because
 * all keys in {@link SYNONYM_DICTIONARY} are stored lowercase.
 *
 * The returned array does **NOT** include the queried term itself (callers
 * that need term ∪ synonyms should concatenate explicitly). Synonyms are
 * returned in dictionary order, de-duplicated.
 *
 * @param term - Keyword to look up. May be Thai or English, any case.
 * @param opts - Optional tuning (S8 additive). See {@link ExpandSynonymsOpts}.
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
export function expandSynonyms(term: string, opts?: ExpandSynonymsOpts): string[] {
  const caseInsensitive = opts?.caseInsensitive !== false; // default true
  const stripTones = opts?.stripTones === true;            // default false

  let key = term.trim();
  if (caseInsensitive) key = key.toLowerCase();
  if (stripTones) key = key.replace(THAI_TONE_RE, "");
  if (key.length === 0) return [];

  const synonyms = SYNONYM_DICTIONARY[key];
  if (!synonyms || synonyms.length === 0) return [];

  // De-duplicate while preserving first-seen order; return a fresh array
  // so the caller cannot mutate the underlying dictionary entry.
  const seen = new Set<string>();
  const out: string[] = [];
  for (let s of synonyms) {
    if (stripTones) s = s.replace(THAI_TONE_RE, "");
    if (!seen.has(s)) {
      seen.add(s);
      out.push(s);
    }
  }
  return out;
}
