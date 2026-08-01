# PROMPT.md — Current Step Work Order

> **PHASE 4C — S18: Evidence Consolidation Engine**
> **My Life OS — Brain Intelligence Engine (BIE)**

---

## 📌 สิ่งแรกที่ต้องทำ

1. อ่าน `/doc/STATE.md` (current step = S18, constraints, allowed files)
2. ปฏิบัติตาม `/doc/STANDING_INSTRUCTIONS.md` (ทุก workflow rule)

---

## 🎯 PRIMARY DELIVERABLE (S18 = Evidence Consolidation Engine)

- Implement `consolidateTagReferences` logic in `/src/pie/bie/reflection/evidenceConsolidator.ts`
- Clean up dangling evidence references and reassign source tag evidence IDs to target tag ID post tag merge
- Return structured `EvidenceConsolidationReport` diff without breaking existing evidence chains
- Handoff S18 → S19 via `STATE.md` + `PROMPT.md`

---

## ⚙️ WORK ORDER — EXECUTE IN ORDER

### S18 Step 1 of 5 — Read-only exploration:
- Read `/src/pie/bie/reflection/types.ts` & `evidenceConsolidator.ts` → review interface & stub
- Read `/doc/ROADMAP_ARCHIVE.md` → review S18 evidence consolidation specifications

### S18 Step 2 of 5 — Consolidation Engine Implementation:
- Implement `consolidateTagReferences(sourceTagId, targetTagId, evidences)`
- Handle re-pointing of source tag evidence IDs → target tag ID
- Safely prune dangling / orphaned evidence references

### S18 Step 3 of 5 — Repository Integration (if needed):
- Add repository helper methods in `BrainIntelligenceRepository` / `RoomBrainIntelligenceRepository` for evidence consolidation if necessary (strictly additive)

### S18 Step 4 of 5 — Verification & Invariant Audit:
- Ensure 100% type safety and non-destructive dry-run report options
- Run `npm run lint` & `npm run build`

### S18 Step 5 of 5 — Doc Closeout + Handoff:
- `CHANGELOG.md`: append S18 section at TOP (≤15 lines per SI-2)
- `ROADMAP.md`: S18 row update (targeted cell edit per SI-4)
- `STATE.md`: update Current Step → S19 kickoff
- `PROMPT.md`: overwrite with S19 handoff (minimal pointer format per SI-1)

---

> **END OF S18 HANDOFF PROMPT.**
