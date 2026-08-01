# STATE.md — Handoff Single Source of Truth

> ไฟล์นี้คือสิ่งแรกที่ AI ต้องอ่านก่อนเริ่มงาน **ทุกครั้ง**
> ควรมีขนาดไม่เกิน ~100 บรรทัดเสมอ — detail ดูไฟล์อื่นตาม pointer

---

## Current Step

**Phase 4C — S18: Evidence Consolidation Engine**
Deliverable:
1. Implement `EvidenceConsolidator` logic in `/src/pie/bie/reflection/evidenceConsolidator.ts`
2. Clean up dangling references and reassign evidence tag IDs from source tag to target tag post merge
3. Generate evidence consolidation report diff without breaking existing evidence chains
4. Handoff S18 → S19 via STATE.md + PROMPT.md

Status Before Start:
- ✅ Phase 4A S1–S9 ← **PHASE 4A COMPLETE**
- ✅ Phase 4B S10–S16 ← **PHASE 4B COMPLETE**
- ✅ Phase 4C S17 — Reflection Type & Provider Contracts Kickoff (COMPLETE)
- ⏳ Phase 4C S18 — Evidence Consolidation Engine (THIS STEP)

---

## Active Hard Constraints (S18 scope only)

| ID | Constraint |
|----|------------|
| P4-8 | Strict Widening Only: signature changes = add ONLY. No removal. 7 aiService.ts facade UNTOUCHED. |
| P4-2 | Zero UX/UI change. S18 is evidence consolidation logic only — no UI components. |
| P4-12 | HITL: all reflection & consolidation operations preserve HITL invariants. |
| P4-11 | Async Reflect: non-blocking background operations. |

---

## Files Allowed / Forbidden (S18)

✅ ALLOWED (evidence consolidation implementation, NO UI):
- `/src/pie/bie/reflection/evidenceConsolidator.ts` (Evidence consolidation logic)
- `/src/pie/bie/reflection/index.ts` (Reflection barrel export)
- `/src/pie/bie/BrainIntelligenceRepository.ts` / `/src/pie/bie/RoomBrainIntelligenceRepository.ts` (Repository helpers if needed)
- `/doc/CHANGELOG.md` (append S18 closeout section)
- `/doc/ROADMAP.md` (S18 status update)
- `/doc/STATE.md` (update for S19 kickoff)
- `/doc/PROMPT.md` (overwrite with S19 handoff)

❌ FORBIDDEN (no modification):
- ANY UI View / Settings / Chat component
- `aiService.ts` 7 facade methods (P4-8)
- Core Brain Tree DB tables direct mutation without HITL confirmation

---

## Readiness Checklist (before ANY code edit)

- [ ] LS `/doc/` — 5 core docs + STATE.md + STANDING_INSTRUCTIONS.md exist
- [ ] Read ROADMAP.md → confirm Phase 4A/4B = ✅ Complete, Phase 4C S17 = ✅ Complete
- [ ] Read CHANGELOG.md → confirm S17 entry exists at top
- [ ] Read `/doc/ROADMAP_ARCHIVE.md` → understand Phase 4C Full Scope / S18 Deliverables
- [ ] Understood: S18 = Evidence Consolidation Engine only; zero UI changes.
- [ ] After implementation → UPDATE DOCS + PROMPT.md for S19 kickoff

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
