# PROMPT.md — Current Step Work Order

> **PHASE 4C — S21: Background Reflect Job Runner (P4-11)**
> **My Life OS — Brain Intelligence Engine (BIE)**

---

## 📌 สิ่งแรกที่ต้องทำ

1. อ่าน `/doc/STATE.md` (current step = S21, constraints, allowed files)
2. ปฏิบัติตาม `/doc/STANDING_INSTRUCTIONS.md` (ทุก workflow rule)

---

## 🎯 PRIMARY DELIVERABLE (S21 = Background Reflect Job Runner P4-11)

- Implement `runReflectionCycle` logic in `/src/pie/bie/reflection/reflectorEngine.ts`
- Orchestrate non-blocking background reflection pipeline: Consolidate → Conflict → Merge → Propose
- Guarantee all generated reflection proposals route to `bie_pending_queue` carrying `applied: false` HITL invariant
- Handoff S21 → S22 via `STATE.md` + `PROMPT.md`

---

## ⚙️ WORK ORDER — EXECUTE IN ORDER

### S21 Step 1 of 5 — Read-only exploration:
- Read `/src/pie/bie/reflection/types.ts` & `reflectorEngine.ts` → review interface & stub
- Read `/doc/ROADMAP_ARCHIVE.md` → review S21 background reflect specifications (P4-11)

### S21 Step 2 of 5 — Reflector Engine Implementation:
- Wire `EvidenceConsolidator`, `ConflictDetector`, `DecayEngine`, and `EntityResolver` into `DefaultReflectorEngine`
- Implement `runReflectionCycle()` executing non-blocking reflection stages
- Generate `ReflectionCycleResult` summary metrics

### S21 Step 3 of 5 — Pending Queue Integration:
- Ensure all proposed merges and conflict resolutions append to `bie_pending_queue` with `applied: false`

### S21 Step 4 of 5 — Verification & Invariant Audit:
- Verify non-blocking async execution and zero auto-applied DB mutations
- Run `npm run lint` & `npm run build`

### S21 Step 5 of 5 — Doc Closeout + Handoff:
- `CHANGELOG.md`: append S21 section at TOP (≤15 lines per SI-2)
- `ROADMAP.md`: S21 row update (targeted cell edit per SI-4)
- `STATE.md`: update Current Step → S22 kickoff
- `PROMPT.md`: overwrite with S22 handoff (minimal pointer format per SI-1)

---

> **END OF S21 HANDOFF PROMPT.**
