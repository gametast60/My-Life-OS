# STATE.md — Handoff Single Source of Truth

> ไฟล์นี้คือสิ่งแรกที่ AI ต้องอ่านก่อนเริ่มงาน **ทุกครั้ง**
> ควรมีขนาดไม่เกิน ~100 บรรทัดเสมอ — detail ดูไฟล์อื่นตาม pointer

---

## Current Step

**Phase 4A — S8: Tuning & Weight Calibration**
Deliverable:
1. HybridScorer weights → Named exported constants (Σ=1.0 exact)
2. User-visible hybrid sort enable WHEN bieEnabled=true; bieEnabled=false → legacy byte-identical
3. Synonym dictionary bootstrap validation + core pair expansion
4. Semantic relevance score threshold clamp export

Status Before Start:
- ✅ Phase 4A S1 — Type & Interface Contracts
- ✅ Phase 4A S2 — Core Utilities
- ✅ Phase 4A S3 — Default Provider Implementations
- ✅ Phase 4A S4 — Repository + DB Schema Extensions
- ✅ Phase 4A S5 — Indexing & Scoring Logic
- ✅ Phase 4A S6 — Wire Hooks into PIE Layers
- ✅ Phase 4A S7 — Disable Switch Integration
- ⏳ Phase 4A S8 — Tuning & Weight Calibration (THIS STEP)
- ⏳ Phase 4A S9 — Regression & Docs Gate

---

## Active Hard Constraints (S8 scope only)

| ID | Constraint |
|----|------------|
| P4-8 | Strict Widening Only: signature changes = add ONLY. No removal. 7 aiService.ts facade UNTOUCHED. |
| P4-2 | Zero UX/UI change. S8 allows user-visible sort-order change ONLY when bieEnabled=true. bieEnabled=false → byte-identical Pre-4. |
| P4-14 | bieEnabled=false path integrity: ZERO semanticService/VectorIndex runs, ZERO embedding HTTP/cache calls, RetrievalSource[] = byte-identical pre-phase-4 (NO .semanticScore / .tagMatchScore / .graphScore mutation). |
| P4-3 | HITL: applied=false structural invariant preserved even if untested by S8 scope. |

---

## Files Allowed / Forbidden (S8)

✅ ALLOWED (3 files MAX):
- `src/pie/bie/hybridScorer.ts`
- `src/pie/repository/RoomBrainRepository.ts`
- `src/pie/bie/synonyms.ts`

❌ FORBIDDEN (no modification):
- S5 core modules: semanticService.ts, vectorIndex.ts, providers/*
- Global schemas: src/types.ts, src/lib/db.ts
- PIE pipeline & layers (pie/pipeline.ts, pie/layers/*)
- 7 aiService.ts public facade functions
- All UI Views / Settings / Chat components

---

## Readiness Checklist (before ANY code edit)

- [ ] LS `/doc/` — 5 core docs + STATE.md + STANDING_INSTRUCTIONS.md exist
- [ ] `npm run build` = Exit 0 (baseline recorded)
- [ ] `npm run lint` = Exit 0 (baseline recorded)
- [ ] Read hybridScorer.ts → located 6 inline weight literals
- [ ] Read RoomBrainRepository.ts L160-300 → pinned S8 sort-mod site
- [ ] Read synonyms.ts → identified missing 15 core Thai/Eng pairs
- [ ] Static trace: bieEnabled=false short-circuits via S7 guard BEFORE any S8 code block reached
- [ ] Understood: 3 files modified only. No other files.
- [ ] After code+validation → UPDATE DOCS PER STANDING INSTRUCTIONS

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
