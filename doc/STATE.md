# STATE.md — Handoff Single Source of Truth

> ไฟล์นี้คือสิ่งแรกที่ AI ต้องอ่านก่อนเริ่มงาน **ทุกครั้ง**
> ควรมีขนาดไม่เกิน ~100 บรรทัดเสมอ — detail ดูไฟล์อื่นตาม pointer

---

## Current Step

**Phase 4B — S11: Entity Resolution & Duplicate Tag Matcher**
Deliverable:
1. Implement duplicate tag candidate detection using Synonym Dictionary + Semantic Vector Cosine Similarity (threshold ≥ 0.82)
2. Generate dry-run duplicate merge diff report (`DuplicateDetectionResult`)
3. Support entity normalization & node resolution logic in `entityResolver.ts`
4. Preserve P4-12 HITL invariant (dry-run report only, applied=false pending queue proposals)
5. Handoff S11 → S12 via STATE.md + prompt.text

Status Before Start:
- ✅ Phase 4A S1–S9 ← **PHASE 4A COMPLETE**
- ✅ Phase 4B S10 — KG Type & Schema Contracts Kickoff
- ⏳ Phase 4B S11 — Entity Resolution & Duplicate Tag Matcher (THIS STEP)

---

## Active Hard Constraints (S11 scope only)

| ID | Constraint |
|----|------------|
| P4-8 | Strict Widening Only: signature changes = add ONLY. No removal. 7 aiService.ts facade UNTOUCHED. |
| P4-2 | Zero UX/UI change. S11 is background matching logic — no UI components. |
| P4-12 | HITL: dry-run merge report / proposals only — zero auto-merge, zero auto-deletion. |
| P4-3 | Edge & Merge Proposals: all proposed merges are pending (applied=false) — never auto-applied. |

---

## Files Allowed / Forbidden (S11)

✅ ALLOWED (additive logic implementation, NO UI):
- `/src/pie/bie/graph/entityResolver.ts` (implement duplicate detection & merge diff generator)
- `/src/pie/bie/graph/types.ts` (additive widening if needed)
- `/src/pie/bie/graph/index.ts` (barrel export)
- `/doc/CHANGELOG.md` (append S11 closeout section)
- `/doc/ROADMAP.md` (S11 status update)
- `/doc/STATE.md` (update for S12 kickoff)
- `/doc/prompt.text` (overwrite with S12 handoff)

❌ FORBIDDEN (no modification):
- ANY UI View / Settings / Chat component
- `aiService.ts` 7 facade methods (P4-8)
- S1–S10 delivered core modules (read-only reference only)

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
