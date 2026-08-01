# STATE.md — Handoff Single Source of Truth

> ไฟล์นี้คือสิ่งแรกที่ AI ต้องอ่านก่อนเริ่มงาน **ทุกครั้ง**
> ควรมีขนาดไม่เกิน ~100 บรรทัดเสมอ — detail ดูไฟล์อื่นตาม pointer

---

## Current Step

**Phase 4B — S15: Graph Context Enrichment & Inference Engine**
Deliverable:
1. Implement `GraphInferenceEngine` — 2-hop transitive inference queries ("A causes B, B conflicts C → A indirect conflicts C")
2. Implement Graph Context Enrichment — enrich memory retrieval results with relevant 1-hop / 2-hop graph relations
3. Preserve P4-12 HITL invariant: context enrichment and inference are 100% read-only — zero DB writes, zero auto-applied edges
4. Handoff S15 → S16 via STATE.md + PROMPT.md

Status Before Start:
- ✅ Phase 4A S1–S9 ← **PHASE 4A COMPLETE**
- ✅ Phase 4B S10 — KG Type & Schema Contracts Kickoff
- ✅ Phase 4B S11 — Entity Resolution & Duplicate Tag Matcher
- ✅ Phase 4B S12 — Graph Persistence & Repository Write Layer
- ✅ Phase 4B S13 — Graph Query & Neighbourhood Traversal
- ✅ Phase 4B S14 — Relationship Extraction Engine
- ⏳ Phase 4B S15 — Graph Context Enrichment & Inference Engine (THIS STEP)

---

## Active Hard Constraints (S15 scope only)

| ID | Constraint |
|----|------------|
| P4-8 | Strict Widening Only: signature changes = add ONLY. No removal. 7 aiService.ts facade UNTOUCHED. |
| P4-2 | Zero UX/UI change. S15 is graph inference & context enrichment — no UI components. |
| P4-12 | HITL: inference and context enrichment are read-only — zero writes, zero auto-application. |
| P4-3 | Edge & Merge Proposals: all proposed edges are pending (`applied: false`) — never auto-applied. |

---

## Files Allowed / Forbidden (S15)

✅ ALLOWED (additive logic implementation, NO UI):
- `/src/pie/bie/graph/graphInferenceEngine.ts` (NEW — 2-hop transitive inference & context enrichment)
- `/src/pie/bie/graph/index.ts` (barrel export — add new module)
- `/src/pie/bie/graph/types.ts` (additive widening if needed)
- `/doc/CHANGELOG.md` (append S15 closeout section)
- `/doc/ROADMAP.md` (S15 status update)
- `/doc/STATE.md` (update for S16 kickoff)
- `/doc/PROMPT.md` (overwrite with S16 handoff)

❌ FORBIDDEN (no modification):
- ANY UI View / Settings / Chat component
- `aiService.ts` 7 facade methods (P4-8)
- S1–S14 delivered core modules (read-only reference only)

---

## Readiness Checklist (before ANY code edit)

- [ ] LS `/doc/` — 5 core docs + STATE.md + STANDING_INSTRUCTIONS.md exist
- [ ] Read ROADMAP.md → confirm Phase 4A = ✅ Complete, 4B S10–S14 = ✅
- [ ] Read CHANGELOG.md → confirm S14 entry exists at top
- [ ] Read `/src/pie/bie/graph/types.ts` → understand GraphEdgeType & GraphEdge
- [ ] Read `/src/pie/bie/graph/graphQueryService.ts` → understand traversal capabilities
- [ ] Understood: S15 = inference & enrichment read-only; zero UI changes; no direct edge writes.
- [ ] After implementation → UPDATE DOCS + PROMPT.md for S16 kickoff

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
