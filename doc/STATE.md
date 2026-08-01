# STATE.md — Handoff Single Source of Truth

> ไฟล์นี้คือสิ่งแรกที่ AI ต้องอ่านก่อนเริ่มงาน **ทุกครั้ง**
> ควรมีขนาดไม่เกิน ~100 บรรทัดเสมอ — detail ดูไฟล์อื่นตาม pointer

---

## Current Step

**Phase 4D — S28: PIE Memory Context Final Wiring**
Deliverable:
1. Enrich PIE retrieval context (`PipelineContext`) with Identity Profile summary & Timeline Insights (Phase 4D final context integration).
2. Wire BIE identity and insight retrieval to PIE Memory Retrieval Layer / Context Enricher cleanly.
3. Preserve signature changes and zero-impact behavior when `bieEnabled === false`.
4. Handoff S28 → S29 via STATE.md + PROMPT.md

Status Before Start:
- ✅ Phase 4A S1–S9 ← **PHASE 4A COMPLETE**
- ✅ Phase 4B S10–S16 ← **PHASE 4B COMPLETE**
- ✅ Phase 4C S17–S22 ← **PHASE 4C COMPLETE**
- ✅ Phase 4D S23 — Identity Layer Kickoff: Type & Interface Contracts ← **DONE**
- ✅ Phase 4D S24 — Identity Engine (Singleton Row) ← **DONE**
- ✅ Phase 4D S25 — Insight Generator (6 Kinds, FIFO 100) ← **DONE**
- ✅ Phase 4D S26 — Life Timeline Builder (M/Q/Y View) ← **DONE**
- ✅ Phase 4D S27 — Proposal Queue Integration ← **DONE**
- ⏳ Phase 4D S28 — PIE Memory Context Final Wiring (THIS STEP)

---

## Active Hard Constraints (S28 scope only)

| ID | Constraint |
|----|------------|
| P4-8 | Strict Widening Only: signature changes = add ONLY. No removal. 7 aiService.ts facade UNTOUCHED. |
| P4-2 | Zero UX/UI change. S28 is pipeline context wiring only — no UI components. |
| P4-12 | HITL: only user-confirmed (`applied: true`) identity & insights enrich PIE context. `applied: false` items MUST be excluded. |

---

## Files Allowed / Forbidden (S28)

✅ ALLOWED (engine logic only, NO UI):
- `/src/pie/layers/memoryRetrieval.ts` or context enricher hooks in PIE
- `/src/pie/types.ts` (additive widening if context interfaces need optional fields)
- `/doc/CHANGELOG.md` (append S28 closeout section)
- `/doc/ROADMAP.md` (S28 Phase 4D status update)
- `/doc/STATE.md` (update for S29 kickoff)
- `/doc/PROMPT.md` (overwrite with S29 handoff)

❌ FORBIDDEN (no modification):
- ANY UI View / Settings / Chat component
- `aiService.ts` 7 facade methods (P4-8)

---

## Readiness Checklist (before ANY code edit)

- [ ] LS `/doc/` — all core docs exist
- [ ] Read ROADMAP.md → confirm Phase 4D S27 = ✅ Complete; S28 = THIS STEP
- [ ] Read CHANGELOG.md → confirm S27 entry exists at top
- [ ] Read PIE memory retrieval layer to locate context enrichment entry points
- [ ] Understood: S28 = PIE Memory Context Final Wiring; zero UI changes.
- [ ] After implementation → UPDATE DOCS + PROMPT.md for S29 kickoff

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
