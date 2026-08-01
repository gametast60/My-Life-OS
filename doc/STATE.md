# STATE.md — Handoff Single Source of Truth

> ไฟล์นี้คือสิ่งแรกที่ AI ต้องอ่านก่อนเริ่มงาน **ทุกครั้ง**
> ควรมีขนาดไม่เกิน ~100 บรรทัดเสมอ — detail ดูไฟล์อื่นตาม pointer

---

## Current Step

**Phase 4A — S9: Regression & Docs Gate**
Deliverable:
1. Full regression pass: Build + Lint (Exit 0) + static trace both bieEnabled paths
2. 7 aiService features × (bieEnabled T/F) trace verification
3. Phase 4A documentation closeout (CHANGELOG, ROADMAP, STATE toggle 4A → ✅)
4. Handoff S9 → (4B Kickoff) via STATE.md + prompt.text

Status Before Start:
- ✅ Phase 4A S1 — Type & Interface Contracts
- ✅ Phase 4A S2 — Core Utilities
- ✅ Phase 4A S3 — Default Provider Implementations
- ✅ Phase 4A S4 — Repository + DB Schema Extensions
- ✅ Phase 4A S5 — Indexing & Scoring Logic
- ✅ Phase 4A S6 — Wire Hooks into PIE Layers
- ✅ Phase 4A S7 — Disable Switch Integration
- ✅ Phase 4A S8 — Tuning & Weight Calibration
- ⏳ Phase 4A S9 — Regression & Docs Gate (THIS STEP)

---

## Active Hard Constraints (S9 scope only)

| ID | Constraint |
|----|------------|
| P4-8 | Strict Widening Only: signature changes = add ONLY. No removal. 7 aiService.ts facade UNTOUCHED. |
| P4-2 | Zero UX/UI change. S9 is doc+regression gate ONLY — no new functional code. |
| P4-14 | bieEnabled=false path integrity: must pass static trace before phase closeout. |
| P4-3 | HITL: applied=false structural invariant preserved (unchanged). |

---

## Files Allowed / Forbidden (S9)

✅ ALLOWED (doc files + zero functional source changes):
- `/doc/CHANGELOG.md` (append S9 closeout section)
- `/doc/ROADMAP.md` (S9 → ✅, 4A → ✅ Complete 100%)
- `/doc/STATE.md` (this file — update for 4B kickoff)
- `/doc/prompt.text` (overwrite with S10 / 4B handoff)
- `/doc/AI_ARCHITECTURE.md` (if architecture summary needs final update)

❌ FORBIDDEN (no modification):
- ANY source file under `src/` (S9 = regression+doc gate only)
- S5 core modules: semanticService.ts, vectorIndex.ts, providers/*
- hybridScorer.ts, synonyms.ts, RoomBrainRepository.ts (S8 delivered; S9 read-only)
- All UI Views / Settings / Chat components

---

## Readiness Checklist (before ANY code edit)

- [ ] LS `/doc/` — 5 core docs + STATE.md + STANDING_INSTRUCTIONS.md exist
- [ ] `npm run build` = Exit 0 (baseline recorded)
- [ ] `npm run lint` = Exit 0 (baseline recorded)
- [ ] Read ROADMAP.md → confirm S8 = ✅, S9 = ⏳
- [ ] Read CHANGELOG.md → confirm S8 entry exists at top
- [ ] Static trace: bieEnabled=false → S7 guard fires at RoomBrainRepository.ts L181 (confirmed S8)
- [ ] Static trace: bieEnabled=true → hybrid sorted return path runs (confirmed S8)
- [ ] Understood: S9 = doc+regression ONLY; zero functional source code changes.
- [ ] After validation+docs → UPDATE DOCS + prompt.text for 4B kickoff

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
