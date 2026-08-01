# STATE.md — Handoff Single Source of Truth

> ไฟล์นี้คือสิ่งแรกที่ AI ต้องอ่านก่อนเริ่มงาน **ทุกครั้ง**
> ควรมีขนาดไม่เกิน ~100 บรรทัดเสมอ — detail ดูไฟล์อื่นตาม pointer

---

## Current Step

**Phase 4D — S27: Proposal Queue Integration**
Deliverable:
1. Wire `Identity` and `Insight` proposals to `bie_pending_queue` via `RoomBrainIntelligenceRepository` (as `identity_update` and `insight_proposal` kinds).
2. All proposals must carry `applied: false` strictly (P4-12 HITL invariant).
3. Update `applyPendingBieItem(id)` in `RoomBrainIntelligenceRepository` to handle structural side effects:
   - For `"identity_update"`: save the pending profile to `bie_identity` with `applied: true`.
   - For `"insight_proposal"`: save the pending insight to `bie_insights` with `applied: true`.
4. Update `rejectPendingBieItem(id)` to simply discard the queue items.
5. Handoff S27 → S28 via STATE.md + PROMPT.md

Status Before Start:
- ✅ Phase 4A S1–S9 ← **PHASE 4A COMPLETE**
- ✅ Phase 4B S10–S16 ← **PHASE 4B COMPLETE**
- ✅ Phase 4C S17–S22 ← **PHASE 4C COMPLETE**
- ✅ Phase 4D S23 — Identity Layer Kickoff: Type & Interface Contracts ← **DONE**
- ✅ Phase 4D S24 — Identity Engine (Singleton Row) ← **DONE**
- ✅ Phase 4D S25 — Insight Generator (6 Kinds, FIFO 100) ← **DONE**
- ✅ Phase 4D S26 — Life Timeline Builder (M/Q/Y View) ← **DONE**
- ⏳ Phase 4D S27 — Proposal Queue Integration (THIS STEP)

---

## Active Hard Constraints (S27 scope only)

| ID | Constraint |
|----|------------|
| P4-8 | Strict Widening Only: signature changes = add ONLY. No removal. 7 aiService.ts facade UNTOUCHED. |
| P4-2 | Zero UX/UI change. S27 is engine logic only — no UI components. |
| P4-12 | HITL: all identity / insight proposals carry `applied: false` when in the pending queue. Flipped to `applied: true` ONLY when the user applies the pending item. |

---

## Files Allowed / Forbidden (S27)

✅ ALLOWED (engine logic only, NO UI):
- `/src/pie/bie/RoomBrainIntelligenceRepository.ts` (update `applyPendingBieItem` to execute real side effects for identity/insights)
- `/doc/CHANGELOG.md` (append S27 closeout section)
- `/doc/ROADMAP.md` (S27 Phase 4D status update)
- `/doc/STATE.md` (update for S28 kickoff)
- `/doc/PROMPT.md` (overwrite with S28 handoff)

❌ FORBIDDEN (no modification):
- ANY UI View / Settings / Chat component
- `aiService.ts` 7 facade methods (P4-8)
- Direct applied=true DB writes without HITL confirmation (P4-12)

---

## Readiness Checklist (before ANY code edit)

- [ ] LS `/doc/` — all core docs exist
- [ ] Read ROADMAP.md → confirm Phase 4D S26 = ✅ Complete; S27 = THIS STEP
- [ ] Read CHANGELOG.md → confirm S26 entry exists at top
- [ ] Read `/src/pie/bie/RoomBrainIntelligenceRepository.ts` → locate `applyPendingBieItem`
- [ ] Understood: S27 = Proposal Queue Integration; zero UI changes.
- [ ] After implementation → UPDATE DOCS + PROMPT.md for S28 kickoff

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
