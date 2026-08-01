# STATE.md — Handoff Single Source of Truth

> ไฟล์นี้คือสิ่งแรกที่ AI ต้องอ่านก่อนเริ่มงาน **ทุกครั้ง**
> ควรมีขนาดไม่เกิน ~100 บรรทัดเสมอ — detail ดูไฟล์อื่นตาม pointer

---

## Current Step

**Phase 4D — S25: Insight Generator (6 Kinds, FIFO 100)**
Deliverable:
1. Implement `InsightGenerator` provider interface in `/src/pie/bie/identity/insightGenerator.ts`
2. Implement `DefaultInsightGenerator` concrete class: produce 6 `InsightType` kinds (reflection / pattern / milestone / gap / conflict / prediction) from evidence + identity profile
3. FIFO 100 queue enforcement in `bie_insights` storage (via repository)
4. Wire `bie_insights` storage to `RoomBrainIntelligenceRepository` — replace insight placeholders with real `RoomDatabase` storage (additive)
5. Handoff S25 → S26 via STATE.md + PROMPT.md

Status Before Start:
- ✅ Phase 4A S1–S9 ← **PHASE 4A COMPLETE**
- ✅ Phase 4B S10–S16 ← **PHASE 4B COMPLETE**
- ✅ Phase 4C S17–S22 ← **PHASE 4C COMPLETE**
- ✅ Phase 4D S23 — Identity Layer Kickoff: Type & Interface Contracts ← **DONE**
- ✅ Phase 4D S24 — Identity Engine (Singleton Row) ← **DONE**
- ⏳ Phase 4D S25 — Insight Generator (6 Kinds, FIFO 100) (THIS STEP)

---

## Active Hard Constraints (S25 scope only)

| ID | Constraint |
|----|------------|
| P4-8 | Strict Widening Only: signature changes = add ONLY. No removal. 7 aiService.ts facade UNTOUCHED. |
| P4-2 | Zero UX/UI change. S25 is engine logic only — no UI components. |
| P4-12 | HITL: all insight proposals carry `applied: false`. No direct `applied=true` DB writes from AI. |

---

## Files Allowed / Forbidden (S25)

✅ ALLOWED (engine logic only, NO UI):
- `/src/pie/bie/identity/insightGenerator.ts` (NEW — InsightGenerator interface + DefaultInsightGenerator impl)
- `/src/pie/bie/identity/index.ts` (UPDATE — re-export insightGenerator)
- `/src/pie/bie/identity/types.ts` (additive only if new types needed; avoid unless required)
- `/src/pie/bie/RoomBrainIntelligenceRepository.ts` (upgrade insight placeholder methods to real `bie_insights` storage)
- `/src/lib/db.ts` (additive: add `getBieInsights`/`saveBieInsights` static methods if not present)
- `/doc/CHANGELOG.md` (append S25 closeout section)
- `/doc/ROADMAP.md` (S25 Phase 4D status update)
- `/doc/STATE.md` (update for S26 kickoff)
- `/doc/PROMPT.md` (overwrite with S26 handoff)

❌ FORBIDDEN (no modification):
- ANY UI View / Settings / Chat component
- `aiService.ts` 7 facade methods (P4-8)
- Direct applied=true DB writes from AI path (P4-12 HITL invariant)

---

## Readiness Checklist (before ANY code edit)

- [ ] LS `/doc/` — all core docs exist
- [ ] Read ROADMAP.md → confirm Phase 4D S24 = ✅ Complete; S25 = THIS STEP
- [ ] Read CHANGELOG.md → confirm S24 entry exists at top
- [ ] Read `/src/pie/bie/identity/types.ts` → understand `InsightItem`, `InsightRow`, `InsightType` (6 types)
- [ ] Read `/src/pie/bie/RoomBrainIntelligenceRepository.ts` → find insight placeholder methods (getInsights / appendInsight / applyInsight / deleteInsight)
- [ ] Read `/src/lib/db.ts` → check if `getBieInsights`/`saveBieInsights` exist; add if missing
- [ ] Understood: S25 = InsightGenerator engine + wire bie_insights storage; zero UI changes.
- [ ] After implementation → UPDATE DOCS + PROMPT.md for S26 kickoff

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
