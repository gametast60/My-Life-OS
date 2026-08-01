# STATE.md — Handoff Single Source of Truth

> ไฟล์นี้คือสิ่งแรกที่ AI ต้องอ่านก่อนเริ่มงาน **ทุกครั้ง**
> ควรมีขนาดไม่เกิน ~100 บรรทัดเสมอ — detail ดูไฟล์อื่นตาม pointer

---

## Current Step

**Phase 4B — S14: Relationship Extraction Engine**
Deliverable:
1. Implement relationship candidate extraction between nodes from evidence co-occurrence & semantic affinity
2. Generate `GraphEdgeProposal` items across the 6 canonical edge types (`supports`, `conflicts`, `causes`, `derived_from`, `related`, `opposes`)
3. Route extracted relationship proposals into `bie_pending_queue` (`kind: "graph_edge"`, `applied: false` HITL invariant)
4. Preserve P4-12 HITL invariant: zero auto-applied edges, pending proposal queue routing only
5. Handoff S14 → S15 via STATE.md + PROMPT.md

Status Before Start:
- ✅ Phase 4A S1–S9 ← **PHASE 4A COMPLETE**
- ✅ Phase 4B S10 — KG Type & Schema Contracts Kickoff
- ✅ Phase 4B S11 — Entity Resolution & Duplicate Tag Matcher
- ✅ Phase 4B S12 — Graph Persistence & Repository Write Layer
- ✅ Phase 4B S13 — Graph Query & Neighbourhood Traversal
- ⏳ Phase 4B S14 — Relationship Extraction Engine (THIS STEP)

---

## Active Hard Constraints (S14 scope only)

| ID | Constraint |
|----|------------|
| P4-8 | Strict Widening Only: signature changes = add ONLY. No removal. 7 aiService.ts facade UNTOUCHED. |
| P4-2 | Zero UX/UI change. S14 is relationship extraction logic — no UI components. |
| P4-12 | HITL: all extracted edges route to pending queue as proposals (`applied: false`) — zero auto-application to graph. |
| P4-3 | Edge & Merge Proposals: all proposed edges are pending (`applied: false`) — never auto-applied. |

---

## Files Allowed / Forbidden (S14)

✅ ALLOWED (additive logic implementation, NO UI):
- `/src/pie/bie/graph/relationshipExtractor.ts` (NEW — relationship candidate extraction engine)
- `/src/pie/bie/graph/index.ts` (barrel export — add new module)
- `/src/pie/bie/graph/types.ts` (additive widening if needed)
- `/doc/CHANGELOG.md` (append S14 closeout section)
- `/doc/ROADMAP.md` (S14 status update)
- `/doc/STATE.md` (update for S15 kickoff)
- `/doc/PROMPT.md` (overwrite with S15 handoff)

❌ FORBIDDEN (no modification):
- ANY UI View / Settings / Chat component
- `aiService.ts` 7 facade methods (P4-8)
- S1–S13 delivered core modules (read-only reference only)

---

## Readiness Checklist (before ANY code edit)

- [ ] LS `/doc/` — 5 core docs + STATE.md + STANDING_INSTRUCTIONS.md exist
- [ ] Read ROADMAP.md → confirm Phase 4A = ✅ Complete, 4B S10–S13 = ✅
- [ ] Read CHANGELOG.md → confirm S13 entry exists at top
- [ ] Read `/src/pie/bie/graph/types.ts` → understand GraphEdgeType & GraphEdgeProposal
- [ ] Read `/src/pie/bie/graph/edgeProposalQueue.ts` → understand proposeEdge & createPendingEdgeItem helpers
- [ ] Understood: S14 = proposal generation only; zero UI changes; no direct edge writes.
- [ ] After implementation → UPDATE DOCS + PROMPT.md for S15 kickoff

---

## Documentation Pointers (do NOT inline — open these files if needed)

| Reference | File |
|-----------|------|
| Standing Workflow Rules | `/doc/STANDING_INSTRUCTIONS.md` |
| Current Architecture State | `/doc/AI_ARCHITECTURE.md` |
| Archived Step-by-Step Rationale | `/doc/AI_ARCHITECTURE_ARCHIVE.md` |
| Roadmap + Step Status | `/doc/ROADMAP.md` |
| Active / Resolved Changes | `/doc/CHANGELOG.md` + `/doc/CHANGELOG_ARCHIVE.md` |
| Architecture Decisions (Active) | `/doc/DECISIONS.md` |
| Archived Decisions | `/doc/DECISIONS_ARCHIVE.md` |
| Known Issues (Active) | `/doc/KNOWN_ISSUES.md` |
| Per-Step Work Order (Current Step Detail) | `/doc/PROMPT.md` |
