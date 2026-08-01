# STATE.md — Handoff Single Source of Truth

> ไฟล์นี้คือสิ่งแรกที่ AI ต้องอ่านก่อนเริ่มงาน **ทุกครั้ง**
> ควรมีขนาดไม่เกิน ~100 บรรทัดเสมอ — detail ดูไฟล์อื่นตาม pointer

---

## Current Step

**Phase 4D — S26: Life Timeline Builder (M/Q/Y View)**
Deliverable:
1. Implement `TimelineBuilder` provider interface in `/src/pie/bie/identity/timelineBuilder.ts`
2. Implement `DefaultTimelineBuilder` concrete class: scan `BrainEvidence` → bucket into Month/Quarter/Year periods → build `TimelineEntry[]` with `themeBreakdown` + `milestones` + `contentHash`
3. Wire `bie_timeline` storage to `RoomBrainIntelligenceRepository` — replace timeline placeholders with real `RoomDatabase` storage (additive, rebuildable cache)
4. contentHash invalidation: if hash changes → caller rebuilds; builder returns entries with fresh hash
5. Handoff S26 → S27 via STATE.md + PROMPT.md

Status Before Start:
- ✅ Phase 4A S1–S9 ← **PHASE 4A COMPLETE**
- ✅ Phase 4B S10–S16 ← **PHASE 4B COMPLETE**
- ✅ Phase 4C S17–S22 ← **PHASE 4C COMPLETE**
- ✅ Phase 4D S23 — Identity Layer Kickoff: Type & Interface Contracts ← **DONE**
- ✅ Phase 4D S24 — Identity Engine (Singleton Row) ← **DONE**
- ✅ Phase 4D S25 — Insight Generator (6 Kinds, FIFO 100) ← **DONE**
- ⏳ Phase 4D S26 — Life Timeline Builder (M/Q/Y View) (THIS STEP)

---

## Active Hard Constraints (S26 scope only)

| ID | Constraint |
|----|------------|
| P4-8 | Strict Widening Only: signature changes = add ONLY. No removal. 7 aiService.ts facade UNTOUCHED. |
| P4-2 | Zero UX/UI change. S26 is engine logic only — no UI components. |
| P4-12 | HITL: Timeline cache is NOT HITL-gated (it's a rebuildable cache, not structural). No applied flag needed on TimelineEntry. |

---

## Files Allowed / Forbidden (S26)

✅ ALLOWED (engine logic only, NO UI):
- `/src/pie/bie/identity/timelineBuilder.ts` (NEW — TimelineBuilder interface + DefaultTimelineBuilder impl)
- `/src/pie/bie/identity/index.ts` (UPDATE — re-export timelineBuilder)
- `/src/pie/bie/RoomBrainIntelligenceRepository.ts` (upgrade timeline placeholder methods to real `bie_timeline` storage)
- `/src/lib/db.ts` (additive: add `getBieTimeline`/`saveBieTimeline` static methods if not present)
- `/doc/CHANGELOG.md` (append S26 closeout section)
- `/doc/ROADMAP.md` (S26 Phase 4D status update)
- `/doc/STATE.md` (update for S27 kickoff)
- `/doc/PROMPT.md` (overwrite with S27 handoff)

❌ FORBIDDEN (no modification):
- ANY UI View / Settings / Chat component
- `aiService.ts` 7 facade methods (P4-8)
- Direct structural DB writes without HITL (non-timeline structural data)

---

## Readiness Checklist (before ANY code edit)

- [ ] LS `/doc/` — all core docs exist
- [ ] Read ROADMAP.md → confirm Phase 4D S25 = ✅ Complete; S26 = THIS STEP
- [ ] Read CHANGELOG.md → confirm S25 entry exists at top
- [ ] Read `/src/pie/bie/identity/types.ts` → understand `TimelineEntry`, `TimelineRow`, `TimelineGranularity`, `TimelineThemeBreakdown`, `TimelineMilestoneEntry`
- [ ] Read `/src/pie/bie/RoomBrainIntelligenceRepository.ts` → find timeline placeholder methods (`getTimelineItems`, `getTimelineItem`, `saveTimelineItem`, `clearTimeline`)
- [ ] Read `/src/lib/db.ts` → check if `getBieTimeline`/`saveBieTimeline` exist; add if missing
- [ ] Understood: S26 = TimelineBuilder engine + wire bie_timeline storage; zero UI changes.
- [ ] After implementation → UPDATE DOCS + PROMPT.md for S27 kickoff

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
