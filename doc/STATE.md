# STATE.md — Handoff Single Source of Truth

> ไฟล์นี้คือสิ่งแรกที่ AI ต้องอ่านก่อนเริ่มงาน **ทุกครั้ง**
> ควรมีขนาดไม่เกิน ~100 บรรทัดเสมอ — detail ดูไฟล์อื่นตาม pointer

---

## Current Step

**Phase 4C — S17: Reflection Type & Provider Contracts Kickoff**
Deliverable:
1. Define type contracts and interfaces for Phase 4C Memory Intelligence & Reflection Engine (`ReflectorEngine`, `ConflictDetector`, `EvidenceConsolidator`, `DecayEngine`)
2. Create initial module stubs under `/src/pie/bie/reflection/` (pure type & stub declarations, zero side effects)
3. Preserve P4-12 HITL invariant: all reflection proposals & conflict resolutions route to `bie_pending_queue` (`applied: false`)
4. Handoff S17 → S18 via STATE.md + PROMPT.md

Status Before Start:
- ✅ Phase 4A S1–S9 ← **PHASE 4A COMPLETE**
- ✅ Phase 4B S10–S16 ← **PHASE 4B COMPLETE**
- ⏳ Phase 4C S17 — Reflection Type & Provider Contracts Kickoff (THIS STEP)

---

## Active Hard Constraints (S17 scope only)

| ID | Constraint |
|----|------------|
| P4-8 | Strict Widening Only: signature changes = add ONLY. No removal. 7 aiService.ts facade UNTOUCHED. |
| P4-2 | Zero UX/UI change. S17 is type & interface contracts only — no UI components. |
| P4-12 | HITL: all reflection & conflict proposals use `applied: false` pending queue routing. |
| P4-3 | Edge & Merge Proposals: pending queue only — zero auto-applied writes. |

---

## Files Allowed / Forbidden (S17)

✅ ALLOWED (additive types & module kickoff, NO UI):
- `/src/pie/bie/reflection/types.ts` (NEW — Reflection & Memory Intelligence types)
- `/src/pie/bie/reflection/index.ts` (NEW — Reflection barrel export)
- `/src/pie/bie/types.ts` (additive widening if needed)
- `/doc/CHANGELOG.md` (append S17 closeout section)
- `/doc/ROADMAP.md` (S17 status update)
- `/doc/STATE.md` (update for S18 kickoff)
- `/doc/PROMPT.md` (overwrite with S18 handoff)

❌ FORBIDDEN (no modification):
- ANY UI View / Settings / Chat component
- `aiService.ts` 7 facade methods (P4-8)
- S1–S16 delivered core modules (read-only reference only)

---

## Readiness Checklist (before ANY code edit)

- [ ] LS `/doc/` — 5 core docs + STATE.md + STANDING_INSTRUCTIONS.md exist
- [ ] Read ROADMAP.md → confirm Phase 4A = ✅ Complete, Phase 4B = ✅ Complete
- [ ] Read CHANGELOG.md → confirm S16 entry exists at top
- [ ] Read `/doc/ROADMAP_ARCHIVE.md` → understand Phase 4C Full Scope / Deliverables
- [ ] Understood: S17 = types & interface contracts ONLY; zero UI changes.
- [ ] After implementation → UPDATE DOCS + PROMPT.md for S18 kickoff

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
