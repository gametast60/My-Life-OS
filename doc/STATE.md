# STATE.md — Handoff Single Source of Truth

> ไฟล์นี้คือสิ่งแรกที่ AI ต้องอ่านก่อนเริ่มงาน **ทุกครั้ง**
> ควรมีขนาดไม่เกิน ~100 บรรทัดเสมอ — detail ดูไฟล์อื่นตาม pointer

---

## Current Step

**Phase 4D — S23: Identity Layer Kickoff — Type & Interface Contracts**
Deliverable:
1. Define `Identity` singleton interface + DB schema row (`IdentityRow`) in `/src/pie/bie/identity/types.ts`
2. Define `InsightItem` 6-type enum (`reflection` | `pattern` | `milestone` | `gap` | `conflict` | `prediction`) + `InsightRow`
3. Define `TimelineEntry` (month/quarter/year granularity) + `TimelineRow`
4. Additive widening to `src/pie/bie/types.ts`: re-export identity types; widen `BiePendingKind` with `"identity_update"` | `"insight_proposal"`
5. Handoff S23 → S24 via STATE.md + PROMPT.md

Status Before Start:
- ✅ Phase 4A S1–S9 ← **PHASE 4A COMPLETE**
- ✅ Phase 4B S10–S16 ← **PHASE 4B COMPLETE**
- ✅ Phase 4C S17–S22 ← **PHASE 4C COMPLETE**
- ⏳ Phase 4D S23 — Identity Layer Kickoff: Type & Interface Contracts (THIS STEP)

---

## Active Hard Constraints (S23 scope only)

| ID | Constraint |
|----|------------|
| P4-8 | Strict Widening Only: signature changes = add ONLY. No removal. 7 aiService.ts facade UNTOUCHED. |
| P4-2 | Zero UX/UI change. S23 is type contracts only — no UI components. |
| P4-12 | HITL: all identity update / insight proposals carry `applied: false`. |

---

## Files Allowed / Forbidden (S23)

✅ ALLOWED (type contracts only, NO UI):
- `/src/pie/bie/identity/types.ts` (NEW — Identity singleton, InsightItem, TimelineEntry types + DB row shapes)
- `/src/pie/bie/identity/index.ts` (NEW — identity barrel export)
- `/src/pie/bie/types.ts` (additive widening: re-export identity types; widen `BiePendingKind`)
- `/doc/CHANGELOG.md` (append S23 closeout section)
- `/doc/ROADMAP.md` (S23 Phase 4D status update)
- `/doc/STATE.md` (update for S24 kickoff)
- `/doc/PROMPT.md` (overwrite with S24 handoff)

❌ FORBIDDEN (no modification):
- ANY UI View / Settings / Chat component
- `aiService.ts` 7 facade methods (P4-8)
- Direct applied=true DB writes (P4-12 HITL invariant)

---

## Readiness Checklist (before ANY code edit)

- [ ] LS `/doc/` — 5 core docs + STATE.md + STANDING_INSTRUCTIONS.md exist
- [ ] Read ROADMAP.md → confirm Phase 4A/4B/4C = ✅ Complete; Phase 4D S23 = THIS STEP
- [ ] Read CHANGELOG.md → confirm S22 entry exists at top
- [ ] Read `/doc/ROADMAP_ARCHIVE.md` → understand Phase 4D full deliverable scope (Identity/Insight/Timeline)
- [ ] Understood: S23 = Type & Interface Contracts only; zero UI changes.
- [ ] After implementation → UPDATE DOCS + PROMPT.md for S24 kickoff

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
