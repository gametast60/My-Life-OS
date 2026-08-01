# PROMPT.md — Current Step Work Order

> **PHASE 4C — S20: Brain Tree Decay Calculation Engine**
> **My Life OS — Brain Intelligence Engine (BIE)**

---

## 📌 สิ่งแรกที่ต้องทำ

1. อ่าน `/doc/STATE.md` (current step = S20, constraints, allowed files)
2. ปฏิบัติตาม `/doc/STANDING_INSTRUCTIONS.md` (ทุก workflow rule)

---

## 🎯 PRIMARY DELIVERABLE (S20 = Brain Tree Decay Calculation Engine)

- Implement `calculateTagDecay` logic in `/src/pie/bie/reflection/decayEngine.ts`
- Calculate time elapsed since last evidence using exponential decay curve calculation
- Return structured `DecayScore` metrics without mutating active evidence records
- Handoff S20 → S21 via `STATE.md` + `PROMPT.md`

---

## ⚙️ WORK ORDER — EXECUTE IN ORDER

### S20 Step 1 of 5 — Read-only exploration:
- Read `/src/pie/bie/reflection/types.ts` & `decayEngine.ts` → review interface & stub
- Read `/doc/ROADMAP_ARCHIVE.md` → review S20 decay calculation specifications

### S20 Step 2 of 5 — Decay Engine Implementation:
- Implement `calculateTagDecay(tagId, lastEvidenceAt, currentScore, now)`
- Implement exponential decay formula: `score * exp(-lambda * daysIdle)` with configurable half-life
- Calculate decay percent and decayed score without mutating core DB rows directly

### S20 Step 3 of 5 — Batch Decay Calculations:
- Add helper method `calculateBatchDecay(tags, now)` to process array of tags efficiently

### S20 Step 4 of 5 — Verification & Invariant Audit:
- Ensure non-destructive calculation and type safety
- Run `npm run lint` & `npm run build`

### S20 Step 5 of 5 — Doc Closeout + Handoff:
- `CHANGELOG.md`: append S20 section at TOP (≤15 lines per SI-2)
- `ROADMAP.md`: S20 row update (targeted cell edit per SI-4)
- `STATE.md`: update Current Step → S21 kickoff
- `PROMPT.md`: overwrite with S21 handoff (minimal pointer format per SI-1)

---

> **END OF S20 HANDOFF PROMPT.**
