# STATE.md — Handoff Single Source of Truth

> ไฟล์นี้คือสิ่งแรกที่ AI ต้องอ่านก่อนเริ่มงาน **ทุกครั้ง**
> ควรมีขนาดไม่เกิน ~100 บรรทัดเสมอ — detail ดูไฟล์อื่นตาม pointer

---

## Current Step

**Phase 4D — S24: Identity Engine (Singleton Row)**
Deliverable:
1. Implement `IdentityEngine` provider interface in `/src/pie/bie/identity/identityEngine.ts`
2. Implement `DefaultIdentityEngine` concrete class: scan Brain Tree + Journal evidence → build 8-category `IdentityProfile`
3. Temporal similarity compare: compute cosine similarity between current and prior `IdentityProfile` snapshots (Who Am I Today vs 6 Months Ago)
4. Wire identity storage to `bie_identity` singleton row via `BrainIntelligenceRepository` (additive method)
5. Handoff S24 → S25 via STATE.md + PROMPT.md

Status Before Start:
- ✅ Phase 4A S1–S9 ← **PHASE 4A COMPLETE**
- ✅ Phase 4B S10–S16 ← **PHASE 4B COMPLETE**
- ✅ Phase 4C S17–S22 ← **PHASE 4C COMPLETE**
- ✅ Phase 4D S23 — Identity Layer Kickoff: Type & Interface Contracts ← **DONE**
- ⏳ Phase 4D S24 — Identity Engine (Singleton Row) (THIS STEP)

---

## Active Hard Constraints (S24 scope only)

| ID | Constraint |
|----|------------|
| P4-8 | Strict Widening Only: signature changes = add ONLY. No removal. 7 aiService.ts facade UNTOUCHED. |
| P4-2 | Zero UX/UI change. S24 is engine logic only — no UI components. |
| P4-12 | HITL: all identity_update proposals carry `applied: false`. No direct `applied=true` DB writes. |

---

## Files Allowed / Forbidden (S24)

✅ ALLOWED (engine logic only, NO UI):
- `/src/pie/bie/identity/identityEngine.ts` (NEW — IdentityEngine interface + DefaultIdentityEngine impl)
- `/src/pie/bie/identity/index.ts` (UPDATE — re-export identityEngine)
- `/src/pie/bie/identity/types.ts` (additive only if new types needed; avoid unless required)
- `/src/pie/bie/BrainIntelligenceRepository.ts` (additive widening: add identity get/save method signatures)
- `/src/pie/bie/RoomBrainIntelligenceRepository.ts` (additive widening: implement identity get/save for `bie_identity`)
- `/doc/CHANGELOG.md` (append S24 closeout section)
- `/doc/ROADMAP.md` (S24 Phase 4D status update)
- `/doc/STATE.md` (update for S25 kickoff)
- `/doc/PROMPT.md` (overwrite with S25 handoff)

❌ FORBIDDEN (no modification):
- ANY UI View / Settings / Chat component
- `aiService.ts` 7 facade methods (P4-8)
- Direct applied=true DB writes (P4-12 HITL invariant)

---

## Readiness Checklist (before ANY code edit)

- [ ] LS `/doc/` — 5 core docs + STATE.md + STANDING_INSTRUCTIONS.md exist
- [ ] Read ROADMAP.md → confirm Phase 4D S23 = ✅ Complete; S24 = THIS STEP
- [ ] Read CHANGELOG.md → confirm S23 entry exists at top
- [ ] Read `/src/pie/bie/identity/types.ts` → understand existing type contracts
- [ ] Read `/src/pie/bie/BrainIntelligenceRepository.ts` → understand existing method signatures
- [ ] Understood: S24 = Identity Engine implementation; zero UI changes.
- [ ] After implementation → UPDATE DOCS + PROMPT.md for S25 kickoff

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
