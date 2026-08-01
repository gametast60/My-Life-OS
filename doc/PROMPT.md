# PROMPT.md — Current Step Work Order

> **PHASE 4D — S25: Insight Generator (6 Kinds, FIFO 100)**
> **My Life OS — Brain Intelligence Engine (BIE)**

---

## 📌 สิ่งแรกที่ต้องทำ

1. อ่าน `/doc/STATE.md` (current step = S25, constraints, allowed files)
2. ปฏิบัติตาม `/doc/STANDING_INSTRUCTIONS.md` (ทุก workflow rule)

---

## 🎯 PRIMARY DELIVERABLE (S25 = Insight Generator — 6 Kinds, FIFO 100)

- `InsightGenerator` provider interface + `DefaultInsightGenerator` concrete class
- Generate 6 `InsightType` kinds from evidence + identity profile:
  - `reflection` — evidence patterns suggesting self-reflection
  - `pattern` — recurring behavioural cycles detected
  - `milestone` — notable achievement or growth event
  - `gap` — dimension with thin evidence / knowledge gap
  - `conflict` — contradictory evidence in same category
  - `prediction` — trend-based forward projection
- Wire real `bie_insights` storage in `RoomBrainIntelligenceRepository` (FIFO 100)
- All generated `InsightItem` objects carry `applied: false` (P4-12 HITL invariant)

---

## ⚙️ WORK ORDER — EXECUTE IN ORDER

### S25 Step 1 of 4 — Read-only exploration:
- Read `/doc/STATE.md` & `/doc/ROADMAP.md` → confirm S24 = ✅ Complete, S25 = THIS STEP
- Read `/src/pie/bie/identity/types.ts` → understand `InsightItem`, `InsightRow`, `InsightType` (6 types)
- Read `/src/pie/bie/RoomBrainIntelligenceRepository.ts` → locate insight placeholder methods
- Read `/src/lib/db.ts` lines 940-990 → check `getBieInsights`/`saveBieInsights` exist; add if missing

### S25 Step 2 of 4 — Implement InsightGenerator:

Create `/src/pie/bie/identity/insightGenerator.ts` with:
- `InsightGeneratorContext`: `{ evidences, tags, dimensions, identityProfile?, nowMs?, maxInsights? }`
- `InsightGenerator` interface: `generateInsights(context): Promise<InsightItem[]>`
- `DefaultInsightGenerator` class: detect each of the 6 insight types from evidence signals
- All generated `InsightItem` objects: `applied: false` readonly literal (P4-12)

Update `/src/pie/bie/identity/index.ts` to re-export insightGenerator.

### S25 Step 3 of 4 — Wire bie_insights storage:
- In `db.ts` (additive): add `getBieInsights()` / `saveBieInsights()` static methods if not present
- In `RoomBrainIntelligenceRepository.ts`: upgrade `getInsights()` / `appendInsight()` / `applyInsight()` / `deleteInsight()` from placeholders to real storage with FIFO 100 enforcement

### S25 Step 4 of 4 — Verification & Doc Closeout:
- `npm run lint` & `npm run build` → must exit 0
- `CHANGELOG.md`: append S25 closeout section at TOP (≤15 lines per SI-2)
- `ROADMAP.md`: update Phase 4D row → In Progress S25 ✅ (3/7)
- `STATE.md`: update Current Step → Phase 4D S26 (Life Timeline Builder)
- `PROMPT.md`: overwrite with S26 handoff

---

> **END OF S25 HANDOFF PROMPT.**
