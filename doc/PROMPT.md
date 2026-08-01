# PROMPT.md — Current Step Work Order

> **PHASE 4D — S26: Life Timeline Builder (M/Q/Y View)**
> **My Life OS — Brain Intelligence Engine (BIE)**

---

## 📌 สิ่งแรกที่ต้องทำ

1. อ่าน `/doc/STATE.md` (current step = S26, constraints, allowed files)
2. ปฏิบัติตาม `/doc/STANDING_INSTRUCTIONS.md` (ทุก workflow rule)

---

## 🎯 PRIMARY DELIVERABLE (S26 = Life Timeline Builder — M/Q/Y View)

- `TimelineBuilder` provider interface + `DefaultTimelineBuilder` concrete class
- Scan `BrainEvidence` → bucket into Month / Quarter / Year periods
- For each period: compute `themeBreakdown` (dimension % share), collect `milestones`, compute `contentHash` (SHA-1 of contributing evidence IDs)
- Wire real `bie_timeline` storage in `RoomBrainIntelligenceRepository` (rebuildable cache — no HITL, no applied flag)
- `contentHash` invalidation: caller checks stored hash vs computed hash → rebuild on mismatch

---

## ⚙️ WORK ORDER — EXECUTE IN ORDER

### S26 Step 1 of 4 — Read-only exploration:
- Read `/doc/STATE.md` & `/doc/ROADMAP.md` → confirm S25 = ✅ Complete, S26 = THIS STEP
- Read `/src/pie/bie/identity/types.ts` → understand `TimelineEntry`, `TimelineRow`, `TimelineGranularity`, `TimelineThemeBreakdown`, `TimelineMilestoneEntry`
- Read `/src/pie/bie/RoomBrainIntelligenceRepository.ts` → locate timeline placeholder methods
- Read `/src/lib/db.ts` → check `getBieTimeline`/`saveBieTimeline` exist; add if missing (use `KEYS.BIE_TIMELINE`)

### S26 Step 2 of 4 — Implement TimelineBuilder:

Create `/src/pie/bie/identity/timelineBuilder.ts` with:
- `TimelineBuilderContext`: `{ evidences, tags, dimensions, granularity, nowMs? }`
- `TimelineBuilder` interface: `buildTimeline(context): Promise<TimelineEntry[]>`
- `DefaultTimelineBuilder`: bucket evidence by `occurredAt` into M/Q/Y period keys → per-period dimension share → top milestones → SHA-1 contentHash
- Use `contentHash()` from `../utils` for hashing

Update `/src/pie/bie/identity/index.ts` to re-export timelineBuilder.

### S26 Step 3 of 4 — Wire bie_timeline storage:
- In `db.ts` (additive): add `getBieTimeline()` / `saveBieTimeline()` static methods if not present (stores `TimelineRow[]`)
- In `RoomBrainIntelligenceRepository.ts`: upgrade `getTimelineItems()` / `getTimelineItem()` / `saveTimelineItem()` / `clearTimeline()` from placeholders to real storage

### S26 Step 4 of 4 — Verification & Doc Closeout:
- `npm run lint` & `npm run build` → must exit 0
- `CHANGELOG.md`: append S26 closeout section at TOP (≤15 lines per SI-2)
- `ROADMAP.md`: update Phase 4D row → In Progress S26 ✅ (4/7)
- `STATE.md`: update Current Step → Phase 4D S27 (Proposal Queue Integration)
- `PROMPT.md`: overwrite with S27 handoff

---

> **END OF S26 HANDOFF PROMPT.**
