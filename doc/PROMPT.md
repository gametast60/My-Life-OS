# PROMPT.md — Current Step Work Order

> **PHASE 4C — S17: Reflection Type & Provider Contracts Kickoff**
> **My Life OS — Brain Intelligence Engine (BIE)**

---

## 📌 สิ่งแรกที่ต้องทำ

1. อ่าน `/doc/STATE.md` (current step = S17, constraints, allowed files)
2. ปฏิบัติตาม `/doc/STANDING_INSTRUCTIONS.md` (ทุก workflow rule)

---

## 🎯 PRIMARY DELIVERABLE (S17 = Reflection Type & Provider Contracts Kickoff)

- Define type contracts & interfaces for `ReflectorEngine`, `ConflictDetector`, `EvidenceConsolidator`, `DecayEngine`
- Create module stubs in `/src/pie/bie/reflection/` (`types.ts`, `index.ts`)
- Preserve `applied: false` HITL invariant across all reflection proposal interfaces
- Handoff S17 → S18 via `STATE.md` + `PROMPT.md`

---

## ⚙️ WORK ORDER — EXECUTE IN ORDER

### S17 Step 1 of 5 — Read-only exploration:
- Read `/src/pie/bie/types.ts` → review existing BIE type definitions
- Read `/doc/ROADMAP_ARCHIVE.md` → review Phase 4C specifications

### S17 Step 2 of 5 — Type Contracts (`/src/pie/bie/reflection/types.ts`):
- Declare `ReflectorEngine` interface
- Declare `ConflictDetector` interface
- Declare `EvidenceConsolidator` interface
- Declare `DecayEngine` interface

### S17 Step 3 of 5 — Module Stubs:
- Create stubs implementing empty / read-only contracts
- Export via `/src/pie/bie/reflection/index.ts`

### S17 Step 4 of 5 — Verification & HITL Check:
- Ensure all proposal interfaces strictly enforce `applied: false`
- Run `npm run lint` & `npm run build`

### S17 Step 5 of 5 — Doc Closeout + Handoff:
- `CHANGELOG.md`: append S17 section at TOP (≤15 lines per SI-2)
- `ROADMAP.md`: S17 row update (targeted cell edit per SI-4)
- `STATE.md`: update Current Step → S18 kickoff
- `PROMPT.md`: overwrite with S18 handoff (minimal pointer format per SI-1)

---

> **END OF S17 HANDOFF PROMPT.**
