# PROMPT.md — Current Step Work Order

> **PHASE 4B — S11: Entity Resolution & Duplicate Tag Matcher**
> **My Life OS — Brain Intelligence Engine (BIE)**

---

## 📌 สิ่งแรกที่ต้องทำ

1. อ่าน `/doc/STATE.md` (current step = S11, constraints, allowed files)
2. ปฏิบัติตาม `/doc/STANDING_INSTRUCTIONS.md` (ทุก workflow rule)

---

## 🎯 PRIMARY DELIVERABLE (S11 = Entity Resolution & Duplicate Matching)

- Duplicate tag candidate detection using Synonym Dictionary + Semantic Vector Cosine Similarity (threshold ≥ 0.82)
- Dry-run duplicate merge diff report generator (`generateDuplicateMergeReport`)
- Entity normalization & node creation helper (`resolveEntityNode`)
- HITL Pending Queue proposals (applied=false invariant, P4-12)
- Handoff S11 → S12 via `STATE.md` + `PROMPT.md`

---

## ⚙️ WORK ORDER — EXECUTE IN ORDER

### S11 Step 1 of 5 — Read-only exploration:
- Read `/src/pie/bie/graph/types.ts` → understand KG contracts & DB row schemas
- Read `/src/pie/bie/synonyms.ts` → understand synonym dictionary lookup
- Read `/src/pie/bie/vectorIndex.ts` → understand cosine similarity scan

### S11 Step 2 of 5 — Duplicate Detection Engine (`/src/pie/bie/graph/entityResolver.ts`):
Implement `findDuplicateCandidates(nodes)`:
- Check exact label matches (case-insensitive, normalized)
- Check synonym dictionary matches via `expandSynonyms`
- Check semantic vector similarity (threshold ≥ 0.82)
- Return list of `EntityResolutionCandidate` objects

### S11 Step 3 of 5 — Dry-Run Merge Diff Report (`/src/pie/bie/graph/entityResolver.ts`):
Implement `generateDuplicateMergeReport(primaryNodeId, duplicateNodeIds)`:
- Calculate affected evidence count & edge count to consolidate
- Produce dry-run diff preview report without modifying DB (`applied=false`)

### S11 Step 4 of 5 — Entity Resolution Helper:
Implement `resolveEntityNode(label, nodeType)`:
- Normalize whitespace & casing
- Construct `BIEGraphNode` entity structure

### S11 Step 5 of 5 — Doc Closeout + Handoff:
- `npm run build` = Exit 0
- `npm run lint` = Exit 0
- `CHANGELOG.md`: append S11 section at TOP (≤15 lines per SI-2)
- `ROADMAP.md`: S11 row update (targeted cell edit per SI-4)
- `STATE.md`: update Current Step → S12 kickoff
- `PROMPT.md`: overwrite with S12 handoff (minimal pointer format per SI-1)

---

> **END OF S11 HANDOFF PROMPT.**
