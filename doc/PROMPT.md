# PROMPT.md — Current Step Work Order

> **PHASE 4B — S12: Graph Persistence & Repository Write Layer**
> **My Life OS — Brain Intelligence Engine (BIE)**

---

## 📌 สิ่งแรกที่ต้องทำ

1. อ่าน `/doc/STATE.md` (current step = S12, constraints, allowed files)
2. ปฏิบัติตาม `/doc/STANDING_INSTRUCTIONS.md` (ทุก workflow rule)

---

## 🎯 PRIMARY DELIVERABLE (S12 = Graph Persistence & Repository Write Layer)

- Add `saveGraphNode` / `saveGraphEdge` / `listGraphNodes` / `listGraphEdges` to `BrainIntelligenceRepository` interface (additive widening only, P4-8)
- Implement in `RoomBrainIntelligenceRepository` backed by `bie_graph_nodes` + `bie_graph_edges` IndexedDB tables
- Wire `findDuplicateCandidates` output → `proposeEdge` → `createPendingEdgeItem` → pending queue (P4-12)
- Handoff S12 → S13 via `STATE.md` + `PROMPT.md`

---

## ⚙️ WORK ORDER — EXECUTE IN ORDER

### S12 Step 1 of 5 — Read-only exploration:
- Read `/src/pie/bie/BrainIntelligenceRepository.ts` → understand current interface method signatures
- Read `/src/pie/bie/RoomBrainIntelligenceRepository.ts` → understand existing concrete implementation patterns
- Read `/src/pie/bie/graph/types.ts` → confirm `BIEGraphNodeRow` + `BIEGraphEdgeRow` DB schema shapes

### S12 Step 2 of 5 — Repository Interface Widening (`BrainIntelligenceRepository.ts`):
- Add `saveGraphNode(node: BIEGraphNodeRow): void`
- Add `saveGraphEdge(edge: BIEGraphEdgeRow): void`
- Add `listGraphNodes(filter?: { nodeType?: string }): BIEGraphNodeRow[]`
- Add `listGraphEdges(filter?: { fromId?: string; toId?: string; applied?: boolean }): BIEGraphEdgeRow[]`

### S12 Step 3 of 5 — Concrete Implementation (`RoomBrainIntelligenceRepository.ts`):
- Implement all 4 new methods backed by `bie_graph_nodes` + `bie_graph_edges` IndexedDB tables
- Follow existing repository patterns (transaction-safe, no direct applied=true from AI)

### S12 Step 4 of 5 — Pending Queue Integration (`entityResolver.ts` or helper):
- After `findDuplicateCandidates` returns candidates, route each to `proposeEdge` → `createPendingEdgeItem`
- Ensure `applied=false` invariant is preserved end-to-end (P4-12)

### S12 Step 5 of 5 — Doc Closeout + Handoff:
- `npm run build` = Exit 0
- `npm run lint` = Exit 0
- `CHANGELOG.md`: append S12 section at TOP (≤15 lines per SI-2)
- `ROADMAP.md`: S12 row update (targeted cell edit per SI-4)
- `STATE.md`: update Current Step → S13 kickoff
- `PROMPT.md`: overwrite with S13 handoff (minimal pointer format per SI-1)

---

> **END OF S12 HANDOFF PROMPT.**
