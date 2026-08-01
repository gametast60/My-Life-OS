# PROMPT.md — Current Step Work Order

> **PHASE 4C — S19: Contradiction & Conflict Detector**
> **My Life OS — Brain Intelligence Engine (BIE)**

---

## 📌 สิ่งแรกที่ต้องทำ

1. อ่าน `/doc/STATE.md` (current step = S19, constraints, allowed files)
2. ปฏิบัติตาม `/doc/STANDING_INSTRUCTIONS.md` (ทุก workflow rule)

---

## 🎯 PRIMARY DELIVERABLE (S19 = Contradiction & Conflict Detector)

- Implement `detectConflicts` logic in `/src/pie/bie/reflection/conflictDetector.ts`
- Scan evidence statements and identifying opposing tags or contradictory memory entries
- Generate structured `ConflictItem` proposals carrying `applied: false` HITL invariant
- Handoff S19 → S20 via `STATE.md` + `PROMPT.md`

---

## ⚙️ WORK ORDER — EXECUTE IN ORDER

### S19 Step 1 of 5 — Read-only exploration:
- Read `/src/pie/bie/reflection/types.ts` & `conflictDetector.ts` → review interface & stub
- Read `/doc/ROADMAP_ARCHIVE.md` → review S19 contradiction detection specifications

### S19 Step 2 of 5 — Conflict Detector Implementation:
- Implement `detectConflicts(evidences)` to analyze semantic affinity / opposing tag evidence pairs
- Calculate severity (`low`, `medium`, `high`) based on evidence confidence & co-occurrence
- Enforce `readonly applied: false` invariant on every generated `ConflictItem` proposal

### S19 Step 3 of 5 — Pending Queue Helper Integration:
- Add helper to route detected `ConflictItem` proposals to `bie_pending_queue` (`kind: "reflection_conflict"`)

### S19 Step 4 of 5 — Verification & Invariant Audit:
- Verify zero auto-applied writes to core DB tables (P4-12 HITL compliance)
- Run `npm run lint` & `npm run build`

### S19 Step 5 of 5 — Doc Closeout + Handoff:
- `CHANGELOG.md`: append S19 section at TOP (≤15 lines per SI-2)
- `ROADMAP.md`: S19 row update (targeted cell edit per SI-4)
- `STATE.md`: update Current Step → S20 kickoff
- `PROMPT.md`: overwrite with S20 handoff (minimal pointer format per SI-1)

---

> **END OF S19 HANDOFF PROMPT.**
