# STATE.md — Handoff Single Source of Truth

> ไฟล์นี้คือสิ่งแรกที่ AI ต้องอ่านก่อนเริ่มงาน **ทุกครั้ง**
> ควรมีขนาดไม่เกิน ~100 บรรทัดเสมอ — detail ดูไฟล์อื่นตาม pointer

---

## Current Step

**Phase 4C — S19: Contradiction & Conflict Detector**
Deliverable:
1. Implement `ConflictDetector` logic in `/src/pie/bie/reflection/conflictDetector.ts`
2. Scan evidence statements and identifying opposing tags or contradictory memory entries
3. Generate structured `ConflictItem` proposals with `applied: false` HITL invariant
4. Handoff S19 → S20 via STATE.md + PROMPT.md

Status Before Start:
- ✅ Phase 4A S1–S9 ← **PHASE 4A COMPLETE**
- ✅ Phase 4B S10–S16 ← **PHASE 4B COMPLETE**
- ✅ Phase 4C S17 — Reflection Type & Provider Contracts Kickoff (COMPLETE)
- ✅ Phase 4C S18 — Evidence Consolidation Engine (COMPLETE)
- ⏳ Phase 4C S19 — Contradiction & Conflict Detector (THIS STEP)

---

## Active Hard Constraints (S19 scope only)

| ID | Constraint |
|----|------------|
| P4-8 | Strict Widening Only: signature changes = add ONLY. No removal. 7 aiService.ts facade UNTOUCHED. |
| P4-2 | Zero UX/UI change. S19 is conflict detection logic only — no UI components. |
| P4-12 | HITL: all reflection conflict proposals strictly carry `applied: false` invariant. |
| P4-11 | Async Reflect: non-blocking background operations. |

---

## Files Allowed / Forbidden (S19)

✅ ALLOWED (conflict detector implementation, NO UI):
- `/src/pie/bie/reflection/conflictDetector.ts` (Conflict detection engine logic)
- `/src/pie/bie/reflection/index.ts` (Reflection barrel export)
- `/src/pie/bie/reflection/types.ts` (Additive type widening if needed)
- `/doc/CHANGELOG.md` (append S19 closeout section)
- `/doc/ROADMAP.md` (S19 status update)
- `/doc/STATE.md` (update for S20 kickoff)
- `/doc/PROMPT.md` (overwrite with S20 handoff)

❌ FORBIDDEN (no modification):
- ANY UI View / Settings / Chat component
- `aiService.ts` 7 facade methods (P4-8)
- Direct applied=true DB writes (P4-12 HITL invariant)

---

## Readiness Checklist (before ANY code edit)

- [ ] LS `/doc/` — 5 core docs + STATE.md + STANDING_INSTRUCTIONS.md exist
- [ ] Read ROADMAP.md → confirm Phase 4A/4B = ✅ Complete, Phase 4C S17/S18 = ✅ Complete
- [ ] Read CHANGELOG.md → confirm S18 entry exists at top
- [ ] Read `/doc/ROADMAP_ARCHIVE.md` → understand Phase 4C Full Scope / S19 Deliverables
- [ ] Understood: S19 = Contradiction & Conflict Detector only; zero UI changes.
- [ ] After implementation → UPDATE DOCS + PROMPT.md for S20 kickoff

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
