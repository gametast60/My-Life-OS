# PROMPT.md — Current Step Work Order

> **PHASE 4B — S15: Graph Context Enrichment & Inference Engine**
> **My Life OS — Brain Intelligence Engine (BIE)**

---

## 📌 สิ่งแรกที่ต้องทำ

1. อ่าน `/doc/STATE.md` (current step = S15, constraints, allowed files)
2. ปฏิบัติตาม `/doc/STANDING_INSTRUCTIONS.md` (ทุก workflow rule)

---

## 🎯 PRIMARY DELIVERABLE (S15 = Graph Context Enrichment & Inference Engine)

- Implement `GraphInferenceEngine` in `/src/pie/bie/graph/graphInferenceEngine.ts`
- Implement 2-hop transitive graph inference ("A causes B, B conflicts C → A indirect conflicts C")
- Implement graph context enrichment function for memory retrieval
- Handoff S15 → S16 via `STATE.md` + `PROMPT.md`

---

## ⚙️ WORK ORDER — EXECUTE IN ORDER

### S15 Step 1 of 5 — Read-only exploration:
- Read `/src/pie/bie/graph/types.ts` → confirm edge types
- Read `/src/pie/bie/graph/graphQueryService.ts` → inspect query service capabilities

### S15 Step 2 of 5 — Transitive Graph Inference Engine:
- Implement `inferTransitiveRelationships(nodes, edges)` in `/src/pie/bie/graph/graphInferenceEngine.ts`
- Calculate 2-hop transitive relationships (e.g. causes + conflicts → indirect conflicts)

### S15 Step 3 of 5 — Context Enrichment Helper:
- Implement `enrichContextWithGraph(seedNodeIds, repo)` helper for memory context formatting

### S15 Step 4 of 5 — Export & Barrel Integration:
- Export inference engine from `/src/pie/bie/graph/index.ts`

### S15 Step 5 of 5 — Doc Closeout + Handoff:
- `npm run build` = Exit 0
- `npm run lint` = Exit 0
- `CHANGELOG.md`: append S15 section at TOP (≤15 lines per SI-2)
- `ROADMAP.md`: S15 row update (targeted cell edit per SI-4)
- `STATE.md`: update Current Step → S16 kickoff
- `PROMPT.md`: overwrite with S16 handoff (minimal pointer format per SI-1)

---

> **END OF S15 HANDOFF PROMPT.**
