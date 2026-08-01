# STATE.md — Handoff Single Source of Truth

> ไฟล์นี้คือสิ่งแรกที่ AI ต้องอ่านก่อนเริ่มงาน **ทุกครั้ง**
> ควรมีขนาดไม่เกิน ~100 บรรทัดเสมอ — detail ดูไฟล์อื่นตาม pointer

---

## Current Step

**Phase 4D — S29: Phase 4 Master Closeout & Gate**
Deliverable:
1. Master BIE regression gate: 7 AI features × (`bieEnabled` true/false) byte-for-byte integrity baseline.
2. Full Phase 4A–4D lint/build 0 errors + doc closeout banner (Phase 4D → ✅ Complete).
3. Handoff S29 → Phase 5 kickoff via STATE.md + PROMPT.md.

Status Before Start:
- ✅ Phase 4A S1–S9 ← **PHASE 4A COMPLETE**
- ✅ Phase 4B S10–S16 ← **PHASE 4B COMPLETE**
- ✅ Phase 4C S17–S22 ← **PHASE 4C COMPLETE**
- ✅ Phase 4D S23 — Identity Layer Kickoff: Type & Interface Contracts ← **DONE**
- ✅ Phase 4D S24 — Identity Engine (Singleton Row) ← **DONE**
- ✅ Phase 4D S25 — Insight Generator (6 Kinds, FIFO 100) ← **DONE**
- ✅ Phase 4D S26 — Life Timeline Builder (M/Q/Y View) ← **DONE**
- ✅ Phase 4D S27 — Proposal Queue Integration ← **DONE**
- ✅ Phase 4D S28 — PIE Memory Context Final Wiring ← **DONE**
- ⏳ Phase 4D S29 — Phase 4 Master Closeout & Gate (THIS STEP)

---

## Active Hard Constraints (S29 scope only)

| ID | Constraint |
|----|------------|
| P4-8 | Strict Widening Only: no signature removals. 7 aiService.ts facade UNTOUCHED. |
| P4-2 | Zero UX/UI change unless explicitly in Phase 5 scope — S29 is regression + doc gate only. |
| P4-12 | HITL invariant must hold in regression: unconfirmed items never enrich context. |
| P4-14 | `bieEnabled=false` must preserve Pre-Phase-4 keyword-only baseline 100%. |

---

## Files Allowed / Forbidden (S29)

✅ ALLOWED (regression + doc closeout only):
- `/doc/CHANGELOG.md` (append S29 closeout section)
- `/doc/ROADMAP.md` (S29 status + Phase 4D banner → ✅ Complete)
- `/doc/STATE.md` (update for Phase 5 kickoff)
- `/doc/PROMPT.md` (overwrite with Phase 5 handoff)
- `/doc/AI_ARCHITECTURE.md` (Phase 4 master closeout banner only, if arch state changed)

❌ FORBIDDEN (no modification unless regression finds a bug):
- ANY UI View / Settings / Chat component
- `aiService.ts` 7 facade methods (P4-8)
- Engine logic files (unless regression failure requires minimal fix)

---

## Readiness Checklist (before ANY code edit)

- [ ] LS `/doc/` — all core docs exist
- [ ] Read ROADMAP.md → confirm Phase 4D S28 = ✅ Complete; S29 = THIS STEP
- [ ] Read CHANGELOG.md → confirm S28 entry exists at top
- [ ] Understood: S29 = Master regression gate + Phase 4 doc closeout; no new features.
- [ ] After verification → UPDATE DOCS + PROMPT.md for Phase 5 kickoff

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
