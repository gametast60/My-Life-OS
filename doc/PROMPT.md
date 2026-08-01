# PROMPT.md — Current Step Work Order

> **PHASE 4B — S14: Relationship Extraction Engine**
> **My Life OS — Brain Intelligence Engine (BIE)**

---

## 📌 สิ่งแรกที่ต้องทำ

1. อ่าน `/doc/STATE.md` (current step = S14, constraints, allowed files)
2. ปฏิบัติตาม `/doc/STANDING_INSTRUCTIONS.md` (ทุก workflow rule)

---

## 🎯 PRIMARY DELIVERABLE (S14 = Relationship Extraction Engine)

- Implement `extractRelationshipCandidates(nodes, evidences)` in `/src/pie/bie/graph/relationshipExtractor.ts`
- Extract relationships across 6 edge types (`supports`, `conflicts`, `causes`, `derived_from`, `related`, `opposes`)
- Route generated edge proposals to `bie_pending_queue` (`applied: false` P4-12 HITL invariant)
- Handoff S14 → S15 via `STATE.md` + `PROMPT.md`

---

## ⚙️ WORK ORDER — EXECUTE IN ORDER

### S14 Step 1 of 5 — Read-only exploration:
- Read `/src/pie/bie/graph/types.ts` → confirm 6 canonical edge types
- Read `/src/pie/bie/graph/edgeProposalQueue.ts` → inspect `proposeEdge` & `createPendingEdgeItem`

### S14 Step 2 of 5 — Relationship Extraction Engine:
- Implement `/src/pie/bie/graph/relationshipExtractor.ts`
- Include co-occurrence analysis and semantic affinity extraction

### S14 Step 3 of 5 — Pending Queue Proposal Routing:
- Ensure all extracted edges use `proposeEdge` and carry `applied: false`
- Add queue helper to push proposals to `bie_pending_queue`

### S14 Step 4 of 5 — Export & Barrel Integration:
- Export relationship extractor from `/src/pie/bie/graph/index.ts`

### S14 Step 5 of 5 — Doc Closeout + Handoff:
- `npm run build` = Exit 0
- `npm run lint` = Exit 0
- `CHANGELOG.md`: append S14 section at TOP (≤15 lines per SI-2)
- `ROADMAP.md`: S14 row update (targeted cell edit per SI-4)
- `STATE.md`: update Current Step → S15 kickoff
- `PROMPT.md`: overwrite with S15 handoff (minimal pointer format per SI-1)

---

> **END OF S14 HANDOFF PROMPT.**
