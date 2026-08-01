# Changelog — My Life OS AI Architecture

> รูปแบบอ้างอิงจาก [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
>
> **ไฟล์นี้เก็บเฉพาะ:**
> - Phase ปัจจุบัน (Phase 5 — เมื่อเริ่มแล้ว) + Phase ก่อนหน้า 1 อัน (Phase 4D)
>
> **สำหรับ step/phase ที่เก่ากว่า (Phase 4A/4B/4C และ Phase 2/3 อันเก่า) ดูไฟล์แยก:**
> → `/doc/CHANGELOG_ARCHIVE.md` (Compressed Summary Index ด้านบน + Full Detail ด้านล่าง)
>
> **กฎอัปเดต (ดู STANDING_INSTRUCTIONS.md):** ทุก step append section ใหม่บนสุด สั้นๆ ไม่เกิน ~15 บรรทัดต่อ step

---

## [Phase 4D — S29] — Phase 4 Master Closeout & Gate
**Status**: ✅ Complete (2026-08-01)

### Verified
- ✅ Master BIE Regression Gate: 7 AI facade methods (`sendAIChatRequest`, `generateGreeting`, `summarizeDailyCheckin`, `analyzeTodayJournals`, `suggestBrainCard`, `generateGuide`, `suggestJournalBrainPlacement`) — signatures UNTOUCHED (P4-8).
- ✅ `bieEnabled: false` path → `enrichWithBieContext` returns sources unchanged; `RoomBrainRepository.getRelevantMemory` skips all BIE modules → Pre-Phase-4 keyword-only baseline preserved 100% (P4-14).
- ✅ `bieEnabled: true` path → identity (applied=true only), applied insights (≤5), timeline buckets (≤3) injected as additive `RetrievalSource` entries (P4-12 HITL invariant holds).
- ✅ `npm run lint` Exit 0. ✅ `npm run build` Exit 0 (2156 modules transformed).
- ✅ Phase 4A → 4B → 4C → 4D all steps ✅ Complete. Phase 4D banner updated in ROADMAP + AI_ARCHITECTURE.
- Handoff: STATE.md + PROMPT.md updated → Phase 5 kickoff.

---

## [Phase 4D — S28] — PIE Memory Context Final Wiring
**Status**: ✅ Complete (2026-08-01)

### Added
- 🆕 `enrichWithBieContext()` in `/src/pie/layers/memoryRetrieval.ts`: injects user-confirmed identity summary, applied insights (≤5), and timeline buckets (≤3) as additive `RetrievalSource` entries (`bie_identity_summary`, `bie_insight`, `bie_timeline`).
- 🆕 `RetrievedMemory.bieEnrichment` optional metadata + three new `RetrievalSource.kind` values in `/src/pie/types.ts` (strict widening only).

### Changed
- ⚙️ `retrieveMemory()` prepends BIE context sources before legacy repo sources when `bieEnabled !== false`; `bieEnabled === false` bypasses enrichment entirely (P4-14 zero-impact).

### Verified
- ✅ `npm run lint` Exit 0. ✅ `npm run build` Exit 0 (2156 modules transformed).
- ✅ P4-12 HITL: only `applied: true` identity rows and insights injected; unconfirmed items excluded.
- ✅ P4-8 Strict Widening: zero type/method removals; 7 `aiService.ts` facade methods UNTOUCHED; zero UI changes.
- [Doc Skip] AI_ARCHITECTURE.md — pipeline context wiring only; no layer diagram change.

---

## [Phase 4D — S27] — Proposal Queue Integration
**Status**: ✅ Complete (2026-08-01)

### Added
- 🆕 `proposeIdentityUpdate()` / `proposeInsightProposal()` helper methods in `BrainIntelligenceRepository` interface and `RoomBrainIntelligenceRepository` class to post proposals into `bie_pending_queue` with enforced `applied: false` (P4-12 HITL invariant).

### Changed
- ⚙️ `/src/pie/bie/RoomBrainIntelligenceRepository.ts`: updated `applyPendingBieItem(id)` to execute structural side effects for `identity_update` (writes to `bie_identity` with `applied: true`), `insight_proposal` (writes to `bie_insights` with `applied: true`), and `graph_edge` (flips edge to `applied: true`).

### Verified
- ✅ `npm run lint` Exit 0. ✅ `npm run build` Exit 0 (2156 modules transformed).
- ✅ P4-8 Strict Widening: zero type/method removals; 7 `aiService.ts` facade methods UNTOUCHED; zero UI changes.
- ✅ P4-12 HITL: Queue items start with `applied: false` strictly; side effects occur only on explicit `applyPendingBieItem`.
- [Doc Skip] AI_ARCHITECTURE.md — queue routing logic update only.

---

## [Phase 4D — S26] — Life Timeline Builder (M/Q/Y View)
**Status**: ✅ Complete (2026-08-01)

### Added
- 🆕 `/src/pie/bie/identity/timelineBuilder.ts`: `TimelineBuilder` interface + `DefaultTimelineBuilder` class to group evidence by period key according to granularity (Month / Quarter / Year), compute thematic breakdowns with dimension shares, and extract milestones using keyword checks on previews. Uses sorted evidence IDs content hashing for cache invalidation.
- 🆕 `RoomDatabase.getBieTimeline()` / `saveBieTimeline()` static methods in `db.ts` (additive; uses `KEYS.BIE_TIMELINE` storing `TimelineRow[]`).

### Changed
- ⚙️ `/src/pie/bie/identity/index.ts`: re-export `timelineBuilder` added.
- ⚙️ `/src/lib/db.ts` import: `TimelineRow` added to imports from `bie/types`.
- ⚙️ `/src/pie/bie/RoomBrainIntelligenceRepository.ts` (additive): `TimelineRow` import; upgraded timeline cache methods `getTimelineItems()`, `getTimelineItem()`, `saveTimelineItem()`, and `clearTimeline()` from placeholders to real cache storage.

### Verified
- ✅ `npm run lint` Exit 0. ✅ `npm run build` Exit 0 (2156 modules transformed).
- ✅ P4-8 Strict Widening: zero type/method removals; 7 `aiService.ts` facade methods UNTOUCHED; zero UI changes.
- [Doc Skip] AI_ARCHITECTURE.md — timeline is a cache store only; no pipeline/graph structure changes.

---

## [Phase 4D — S25] — Insight Generator (6 Kinds, FIFO 100)
**Status**: ✅ Complete (2026-08-01)

### Added
- 🆕 `/src/pie/bie/identity/insightGenerator.ts`: `InsightGenerator` interface + `DefaultInsightGenerator`. Detects all 6 `InsightType` kinds: `reflection` (keyword heuristic), `pattern` (dimension frequency ≥3), `milestone` (achievement keyword), `gap` (thin evidence <3), `conflict` (opposing polarity pairs), `prediction` (trend vs older rolling window). All InsightItems: `applied: false` readonly literal (P4-12).
- 🆕 `RoomDatabase.getBieInsights()` / `saveBieInsights()` static methods in `db.ts` (additive; uses `KEYS.BIE_INSIGHTS`, stores `InsightRow[]`).

### Changed
- ⚙️ `/src/pie/bie/identity/index.ts`: re-export `insightGenerator` added.
- ⚙️ `db.ts` import: `InsightRow` added to bie/types import.
- ⚙️ `/src/pie/bie/RoomBrainIntelligenceRepository.ts` (additive): `InsightRow` import; upgraded `getInsights()` / `appendInsight()` / `applyInsight()` / `deleteInsight()` from placeholders to real `bie_insights` storage with FIFO 100 enforcement.

### Verified
- ✅ `npm run lint` (tsc --noEmit) Exit 0. ✅ `npm run build` Exit 0 (2156 modules transformed).
- ✅ P4-8 Strict Widening: zero removals; 7 `aiService.ts` facade UNTOUCHED; zero UI changes.
- ✅ P4-12 HITL: `applied: false` readonly literal on all generated `InsightItem` objects; `applyInsight()` exclusively Confirm UI.
- [Doc Skip] AI_ARCHITECTURE.md — engine + storage layer; no PIE topology change.

---

## [Phase 4D — S24] — Identity Engine (Singleton Row)
**Status**: ✅ Complete (2026-08-01)

### Added
- 🆕 `/src/pie/bie/identity/identityEngine.ts`: `IdentityEngine` interface + `DefaultIdentityEngine` concrete class. Builds 8-category `IdentityProfile` from `BrainEvidence` via dimension+keyword heuristic bucketing + recency-decayed scoring. `compareProfiles()` returns cosine similarity [0-1] between two profile snapshots (temporal identity compare). `applied: false` readonly literal enforced on all generated profiles (P4-12).
- 🆕 `RoomDatabase.getBieIdentity()` / `saveBieIdentity()` static methods in `db.ts` (additive; uses `KEYS.BIE_IDENTITY`).

### Changed
- ⚙️ `/src/pie/bie/identity/index.ts`: re-export `identityEngine` added.
- ⚙️ `/src/pie/bie/BrainIntelligenceRepository.ts` (additive): `IdentityRow` import + `getIdentityProfile()` / `saveIdentityProfile()` method signatures.
- ⚙️ `/src/pie/bie/RoomBrainIntelligenceRepository.ts` (additive): `getIdentity()` / `saveIdentity()` / `applyIdentity()` upgraded from placeholders to real `RoomDatabase.getBieIdentity/saveBieIdentity` storage; `getIdentityProfile()` / `saveIdentityProfile()` implemented.

### Verified
- ✅ `npm run lint` (tsc --noEmit) Exit 0. ✅ `npm run build` Exit 0 (2156 modules transformed).
- ✅ P4-8 Strict Widening: zero type/method removals; 7 `aiService.ts` facade methods UNTOUCHED; zero UI changes.
- ✅ P4-12 HITL: `IdentityProfile.applied` is readonly literal `false`; `applyIdentity()` only flips existing stored row to `true`.
- [Doc Skip] AI_ARCHITECTURE.md — engine + storage layer only; no topology change to PIE pipeline or BIE dependency graph.

---

## [Phase 4D — S23] — Identity Layer Kickoff: Type & Interface Contracts
**Status**: ✅ Complete (2026-08-01)

### Added
- 🆕 `/src/pie/bie/identity/types.ts`: `IdentityProfile` singleton (8-category), `IdentityRow` DB shape, `InsightItem` (6-type: reflection/pattern/milestone/gap/conflict/prediction), `InsightRow`, `TimelineEntry` (month/quarter/year granularity), `TimelineRow`, `TimelineThemeBreakdown`, `TimelineMilestoneEntry`. `applied: false` readonly literal on all HITL domain types (P4-12).
- 🆕 `/src/pie/bie/identity/index.ts`: barrel export (`export * from "./types"`).

### Changed
- ⚙️ `/src/pie/bie/types.ts` (additive widening): re-export all identity types from `./identity`; widened `BiePendingKind` union — added `"insight_proposal"`.

### Verified
- ✅ `npm run lint` (tsc --noEmit) Exit 0. ✅ `npm run build` Exit 0 (2156 modules transformed).
- ✅ P4-8 Strict Widening: zero type removals; 7 `aiService.ts` facade methods UNTOUCHED; zero UI changes.
- ✅ P4-12 HITL: `applied: false` readonly literal on `IdentityProfile` and `InsightItem` domain types.
- [Doc Skip] AI_ARCHITECTURE.md — S23 is type contracts only, no architectural topology change.

---

