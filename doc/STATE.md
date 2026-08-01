# STATE.md — Handoff Single Source of Truth

> ไฟล์นี้คือสิ่งแรกที่ AI ต้องอ่านก่อนเริ่มงาน **ทุกครั้ง**
> ควรมีขนาดไม่เกิน ~100 บรรทัดเสมอ — detail ดูไฟล์อื่นตาม pointer

---

## Current Step

**Phase 4B — S10: Knowledge Graph + Relationship Engine (Kickoff)**
Deliverable:
1. Define KG node/edge type contracts (TypeScript interfaces, no DB yet)
2. Design Graph storage schema (bie_graph_nodes, bie_graph_edges tables)
3. Implement entity resolution + duplicate detection stubs
4. Edge proposal queue (applied=false structural invariant, P4-12 HITL preserved)
5. Handoff S10 → S11 via STATE.md + prompt.text

Status Before Start:
- ✅ Phase 4A S1 — Type & Interface Contracts
- ✅ Phase 4A S2 — Core Utilities
- ✅ Phase 4A S3 — Default Provider Implementations
- ✅ Phase 4A S4 — Repository + DB Schema Extensions
- ✅ Phase 4A S5 — Indexing & Scoring Logic
- ✅ Phase 4A S6 — Wire Hooks into PIE Layers
- ✅ Phase 4A S7 — Disable Switch Integration
- ✅ Phase 4A S8 — Tuning & Weight Calibration
- ✅ Phase 4A S9 — Regression & Docs Gate ← **PHASE 4A COMPLETE**
- ⏳ Phase 4B S10 — Knowledge Graph + Relationship Engine Kickoff (THIS STEP)

---

## Active Hard Constraints (S10 scope only)

| ID | Constraint |
|----|------------|
| P4-8 | Strict Widening Only: signature changes = add ONLY. No removal. 7 aiService.ts facade UNTOUCHED. |
| P4-2 | Zero UX/UI change. S10 is type+schema design — no UI components. |
| P4-12 | HITL: applied=false structural invariant preserved (unchanged). |
| P4-3 | Edge Proposals: all edge creates are proposals only (applied=false) — never auto-applied. |

---

## Files Allowed / Forbidden (S10)

✅ ALLOWED (additive new files + widen existing types, NO UI):
- `/src/pie/bie/graph/` (new folder — KG type definitions, schema, entity resolution stubs)
- `/src/pie/bie/types.ts` (additive: KG node/edge interfaces, proposal types)
- `/src/pie/bie/RoomBrainIntelligenceRepository.ts` (additive: KG method stubs)
- `/doc/CHANGELOG.md` (append S10 closeout section)
- `/doc/ROADMAP.md` (S10 → ✅)
- `/doc/STATE.md` (this file — update for S11 kickoff)
- `/doc/prompt.text` (overwrite with S11 handoff)

❌ FORBIDDEN (no modification):
- ANY UI View / Settings / Chat component
- `aiService.ts` 7 facade methods (P4-8)
- S1–S9 delivered core modules (read-only reference only)

---

## Readiness Checklist (before ANY code edit)

- [ ] LS `/doc/` — 5 core docs + STATE.md + STANDING_INSTRUCTIONS.md exist
- [ ] Read ROADMAP.md → confirm Phase 4A = ✅ Complete, 4B S10 = ⏳
- [ ] Read CHANGELOG.md → confirm S9 entry exists at top
- [ ] Read `/doc/ROADMAP_ARCHIVE.md` → confirm 4B Full Scope/Deliverables section (KG design reference)
- [ ] Read `src/pie/bie/types.ts` → understand existing BIE type contracts before widening
- [ ] Understood: S10 = type+schema design ONLY; zero UI changes; no removal of existing exports.
- [ ] After implementation → UPDATE DOCS + prompt.text for S11 kickoff


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
| Per-Step Work Order (Current Step Detail) | `/doc/prompt.text` |
