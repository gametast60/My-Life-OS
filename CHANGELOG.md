# Changelog — My Life OS AI Architecture

> รูปแบบอ้างอิงจาก [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
>
> จัดกลุ่มตาม **Phase** การพัฒนา AI Architecture (Phase 1 → 5)

---

## [Phase 4A — S1] — Type & Interface Contracts
**Status**: ✅ Complete (2026-07-30)

> Infrastructure-First Step 1 of 9. Foundation only — no business logic,
> no queries, no migration. All additions additive; zero existing
> signatures changed. BIE not yet wired into pipeline; effective
> behavior is identical to Pre-Phase-4 (Keyword-only 3-factor ranking).

### Added

- 🆕 **`src/pie/bie/types.ts`** — BIE domain type contracts (single source of truth):
  - 7 row types: `EmbeddingRecord`, `GraphNode`, `GraphEdge`, `IdentityProfile`, `Insight`, `TimelineItem`, `PendingLearning` (+ `IdentityEntry`, `TimelineTheme`, `TimelineMilestone` helpers)
  - Shared unions: `EmbeddingMethod`, `GraphNodeKind`, `GraphEdgeType`, `GraphNodeCoreType`, `InsightKind`, `InsightSeverity`, `IdentityCategory`, `TimelinePeriodKind`, `BiePendingKind`
  - Schema mirrors CONFIRMED `bie_*` table spec (DECISIONS.md "BIE Storage Location")
  - HITL invariant encoded structurally: `GraphEdge.applied` / `IdentityProfile.applied` / `Insight.applied` required `boolean`; `PendingLearning` carries no `applied` (in-queue = not applied by definition)
- 🆕 **`src/pie/bie/providers/embeddingProvider.ts`** — `EmbeddingProvider` interface ONLY (no Gemini/Local impl — deferred to S3):
  - Async-only surface: `embed()`, `batchEmbed()` (uniform for hybrid fallback, P4-5)
  - Typed `EmbeddingOutcome = ok | failure` — providers never throw on quota/network
  - `isAvailable()` cheap probe + `dimensions`/`id`/`displayName` so orchestrator can probe before awaiting
- 🆕 **`src/pie/bie/BrainIntelligenceRepository.ts`** — SSOT repository interface for all `bie_*` tables (no impl — deferred to S4):
  - 20+ methods across 7 areas: Embeddings, Graph Nodes, Graph Edges, Identity, Insights, Timeline, Pending Queue
  - HITL surface enforced: AI writes go via `appendPendingBieItem()`; `applyGraphEdge()` / `applyIdentity()` / `applyInsight()` reserved for Confirm UI

### Changed

- ➕ **`src/pie/types.ts`** (additive only, no breaking change — P4-8):
  - `RetrievalSource`: + optional `semanticScore?`, `tagMatchScore?`, `graphScore?` (undefined ⇒ existing 3-factor scorer runs unchanged)
  - `PipelineOptions`: + optional `bieEnabled?` (default true; explicit `false` ⇒ SKIP all BIE hooks ⇒ Pre-Phase-4 behavior, P4-14)
- ➕ **`src/lib/db.ts`** (additive only):
  - `KEYS` map extended with 7 `BIE_*` storage-key constants — Table DEFINITIONS only (`BIE_EMBEDDINGS`, `BIE_GRAPH_NODES`, `BIE_GRAPH_EDGES`, `BIE_IDENTITY`, `BIE_INSIGHTS`, `BIE_TIMELINE`, `BIE_PENDING_QUEUE`). No get/set methods yet (S4). No migration.

### Verified

- ✅ **Lint**: `npm run lint` (`tsc --noEmit`) → Exit 0, 0 errors
- ✅ **Build**: `npm run build` (vite + esbuild server) → Exit 0
- ✅ **Backward Compatibility**: 3 new files unimported anywhere → zero runtime impact; all changes to `pie/types.ts` and `db.ts` are additive optional fields/constants
- ✅ **Regression**: existing 7 aiService features unaffected (PipelineContext shape unchanged beyond optional fields)

---

## [Phase 4 — Pre-4A Setup] — Documentation Policy + Project Memory Files
**Status**: ✅ Complete (2026-07-30)

### Added

- 🧠 **DECISIONS.md** — Architecture Decision Record (ADR) แบบย่อ:
  - Past Decisions 5 ข้อ (PIE 7 Layers, Brain Tree V1, Human-in-the-loop applied=false, MODE_PROMPTS→Roles, SSOT Repository) พร้อม Context + Rationale + Trade-offs
  - 3 PROPOSED Decisions สำหรับ Phase 4A (Hybrid Embedding, localStorage Storage, 4A-first Execution Order)
- ⚠️ **KNOWN_ISSUES.md** — Known Limitations & Technical Debt Registry:
  - 🔴 Critical 3 ข้อ (No Confirm UI, aiService 550 lines, Legacy BrainCards threshold=5)
  - 🟡 Medium 6 ข้อ (No Semantic, No Graph, Missing 5 Evidence Fields, Decay no impl, 9 Roles no UI, Views pass extraContext)
  - 🟢 Low 6 ข้อ (No Local Embedding Model, No Multi-hop Graph, Linear Scan Vector, Legacy aiApiKey, Logger no persistence, No Service Worker)
  - Phase 4 Gaps Reference Table (14 items target 4A-4D)

### Changed

- 🗺️ **ROADMAP.md** — Phase 4 Section:
  - แปลงจาก "Brain Intelligence (🚧 In Progress)" เป็น **"Brain Intelligence Engine (BIE)" (⏳ Pre-4A)**
  - เพิ่ม Sub-phase 4A / 4B / 4C / 4D Section แยก (Objective, Scope, Deliverables, Blocking Chain)
  - Summary Table เพิ่ม 4A-4D + Phase 5 rename เป็น "Full Intelligence"
  - เพิ่ม Phase 4 Hard Constraints Banner (🔒 4 rules: PIE no edit, UX no change, Prompts no change, applied=false)
- 📄 **AI_ARCHITECTURE.md** — เพิ่ม:
  - BIE Components Table (11 Components, 4A-4D Sub-phase mapping, I/O, Persistence)
  - Storage Structure COMPLETELY REWRITTEN (RoomDatabase 7 Tables `bie_*` Full Spec; localStorage = Cache ชั่วคราวเท่านั้น TTL 30m)
  - Phase 4 Additional Hard Constraints Table (P4-1 → P4-14 รวม 14 ข้อ)
- 🧹 **Consistency Fix**: CHANGELOG Phase 3 status 🚧 → ✅ (อินคอนซิสเตนซีจากก่อนหน้า — ROADMAP บอก Complete แต่ CHANGELOG ยัง In Progress)

---

## [Phase 3] — Clean Architecture & Documentation
**Status**: ✅ Complete (2026-07-30)

### Added

- 🏗️ **BrainRepository: RequestContextOverride** interface สำหรับ backward compatibility เมื่อ Views ส่ง brainCards/recentJournals มาเอง (ยังคง UX เดิมได้ 100%)
- 📄 **AI_ARCHITECTURE.md** — เอกสารสถาปัตยกรรม AI ครบถ้วน:
  - Architecture Diagram + Dependency Rule
  - PIE 7 Layers Deep Dive (Intent / Retrieval / Ranking / Prompt / Provider / Analyzer / Learning)
  - Human-in-the-loop Learning Flow Diagram
  - Brain Repository Pattern Diagram
  - 9 Native AI Roles Configuration Table
  - Brain Tree Engine V1 Data Model + Growth Formula
  - Folder Structure (src/pie/, src/lib/, src/views/)
  - End-to-End Data Flow (Chat Example Step-by-step)
  - Hard Constraints Table (6 Rules Non-negotiable)
- 🗺️ **ROADMAP.md** — Roadmap Phase 1 ถึง Phase 5:
  - แต่ละ Phase มี: Objective / Completed / Remaining / Next Phase
  - Summary Table (Phase, Name, Status, Deliverable)
- 📋 **CHANGELOG.md** — Changelog ตามรูปแบบ Keep a Changelog (เอกสารนี้)
- 🆕 **aiService exports**:
  - `getRoleForLegacyMode(mode: AIMode): AIRoleId` — helper สำหรับดึง Role Id จาก Legacy Mode
  - `LEGACY_MODE_CONFIG` — internal config map `mode → {roleId, customSystemPrompt?}`

### Changed

- 🔧 **Syntax Error Fix**: `src/pie/layers/contextRanking.ts` L141 — เพิ่ม `}` ปิด function body ของ `rankContext()` ก่อน `export function runContextRanking()` (Syntax Error เด็ดที่จะทำให้ Build ไม่ผ่าน)
- ♻️ **BrainRepository = Single Source of Truth**:
  - `src/pie/repository/BrainRepository.ts`
    - `getRelevantMemory()` เพิ่ม `requestContext?: RequestContextOverride` parameter
    - `getJournals()` return type แก้ไขให้ถูกต้อง (จาก `& {timestamp?}` ไปเป็น union type ที่ถูกต้อง)
  - `src/pie/repository/RoomBrainRepository.ts`
    - `convertBrainCardsToSources()` เพิ่ม `overrideCards?: BrainCard[]` parameter
    - `convertJournalsToSources()` เพิ่ม `overrideJournals?: JournalLike[]` parameter
    - `getRelevantMemory()` ใช้ `requestContext` เป็น Data Source override (ถ้ามี) ก่อนจะโหลดจาก DB
    - เพิ่ม type alias `JournalLike` สำหรับ internal ใช้งาน
- ♻️ **Memory Retrieval ผ่าน Repository เท่านั้น (DRY Cleanup)**:
  - `src/pie/layers/memoryRetrieval.ts`
    - ลบ Duplicate Helper Functions 6 ฟังก์ชันออกทั้งหมด:
      - `keywordMatches()`, `dimensionAllowed()`, `brainTypeAllowed()`
      - `cardToSource()`, `convertBrainCardsToSources()`, `convertJournalsToSources()`, `convertBrainTreeToSources()`
    - ลบ Legacy Fallback Path ที่จะ convert เองถ้า Repository ไม่มีข้อมูล
    - เพิ่ม `extractRequestContext()` helper เพื่อดึง brainCards/recentJournals/brainTree จาก extraContext
    - **เสมอ**ไปเรียก `resolveRepository(options).getRelevantMemory()` เดียว
    - โค้ดลดจาก **272 บรรทัด → 67 บรรทัด** (ลด 75%)
- 🧹 **aiService Cleanup (ลดเป็น Facade + ลบ MODE_PROMPTS)**:
  - `src/lib/aiService.ts`
    - **ลบ `MODE_PROMPTS` Record (7 Legacy Prompts)** ที่ซ้ำกับ Role Persona ทั้งหมดออก
    - แทนที่ด้วย `LEGACY_MODE_CONFIG`:
      - Coach → ใช้ coachRole.persona โดยตรง (ไม่มี customSystemPrompt)
      - Therapist → ใช้ therapistRole.persona โดยตรง
      - Decision → ใช้ plannerRole.persona โดยตรง
      - Reflection → ใช้ coachRole.persona โดยตรง
      - Chat → ใช้ customRole.persona โดยตรง
      - Future Self → ใช้ coachRole id + **inline customSystemPrompt** (viewpoint 5 ปีข้างหน้า — unique UX variant)
      - Secretary → ใช้ plannerRole id + **inline customSystemPrompt** (task/checklist/reminder persona — unique UX variant)
    - `sendAIChatRequest()` อ่านค่าจาก `LEGACY_MODE_CONFIG[mode]` แทน `MODE_PROMPTS[mode]` + `MODE_TO_ROLE[mode]`
    - `MODE_TO_ROLE` ยังคง export (backward compatibility) แต่ **คำนวณมาจาก LEGACY_MODE_CONFIG** ไม่ได้ hardcode ซ้ำ
- 🔄 **aiService.ts imports**: Clean unused import types (removed `BrainCard` import? — verified no unused imports via tsc --noEmit pass)

### Removed

- ❌ **Dead code in memoryRetrieval.ts**:
  - 3 `convert*ToSources` Duplicate Functions (DRY Violation)
  - 3 Duplicate Helpers (`keywordMatches`, `dimensionAllowed`, `brainTypeAllowed`)
  - Legacy Fallback Path (ที่ทำ conversion เองนอก Repository)
- ❌ **MODE_PROMPTS Record**: 7 Legacy prompt strings ที่ซ้ำกับ 9 Native Role Persona — ถูกแทนที่ด้วย LEGACY_MODE_CONFIG ที่ใช้ Role Persona และ customSystemPrompt เฉพาะ viewpoint เฉพาะ
- ❌ **aiRouter.ts**: ไม่พบไฟล์ (ได้ถูกลบก่อน Phase 3 แล้ว — Audit พบ Zero Consumers ใน Phase 2)

### Fixed

- 🐛 **Critical Syntax Error**: `src/pie/layers/contextRanking.ts` L140-142 — `rankContext()` ขาด `}` ปิด function body → ก่อนจะเจอ `export function runContextRanking()` ทันที ทำให้ TypeScript Build ผ่านไม่ได้ (ถูกแก้ไข)

---

## [Phase 2] — Full Pipeline Integration
**Status**: ✅ Complete

### Added

- 🔗 **7 AI Call Points 100% through PIE**:
  1. `sendAIChatRequest()` — AI Chat 6 Legacy Modes
  2. `generateGreeting()` — Greeting message generator
  3. `summarizeDailyCheckin()` — Daily reflection (skip retrieval+ranking)
  4. `analyzeTodayJournals()` — 4-Section Journal analysis
  5. `suggestBrainCard()` — Brain Card Scout (JSON output)
  6. `generateGuide()` — Life GPS Guide (JSON output)
  7. `suggestJournalBrainPlacement()` — Brain Tree Placement Candidates
- 📊 **PipelineLogger**:
  - Singleton logger, maxLogs=200 FIFO
  - Per stage: durationMs, retrieval count, ranking top score, provider/model/success/error
  - Methods: `startPipeline()`, `startStage()`, `endStage()`, `completePipeline()`, `getLogs()`, `clear()`
- 🎯 **PipelineOptions**:
  - `skipStages: Partial<Record<PIPELINE_STAGE, boolean>>`
  - `maxRetrievalSources`, `maxRankedSources`
  - `learningEnabled: boolean`
  - `onStageComplete: (stage, ctx) => void` callback
  - `repository: BrainRepository` dependency injection
- 🧩 **PIE Public Barrel Export**: `src/pie/index.ts` export ทุกอย่างที่ภายนอกต้องใช้ (ไม่ต้อง import ลง layer แล้ว)

### Changed

- ♻️ **Memory Retrieval Hierarchy**: BrainTree (Primary) + Journals (Primary) + Legacy BrainCards (Fallback ถ้า Primary < 5)
- ♻️ **Role-based Permission Filter**: Memory Retrieval กรองด้วย `role.allowedDimensions` + `role.allowedBrainTypes` ก่อนเข้า Ranking
- ♻️ **Response Analyzer + Learning Engine เชื่อมต่อทุก Feature**:
  - `runLearningEngine()` default: `autoApply=false`, `minConfidence=0.72`, `maxItemsToPersist=3`
  - Items saved to Pending Queue: localStorage key `mylifeos_pie_pending_learning_v1`
- ♻️ **aiService เป็น Adapter Pattern**: ทุกฟังก์ชัน → `createPipelineRequestFromLegacy()` → `runPipeline()` → graceful error fallback

### Removed

- ❌ **aiRouter.ts**: Legacy routing logic — พบ Zero Consumers (ถูกเตรียมลบใน Phase 3)
- ❌ **Direct Provider Calls จาก aiService**: ทุก Call ผ่าน PIE แล้ว

### Fixed

- ✅ **Zero UX Change**: All 6 Legacy Modes ยังแสดงและทำงานเหมือนเดิม (Adapter pattern คง Backward Compatibility)
- ✅ **TypeScript Check Pass**: `tsc --noEmit` 0 Errors หลัง Migration ครบ

---

## [Phase 1] — Foundation
**Status**: ✅ Complete

### Added

- 🚀 **PIE (Personal Intelligence Engine) — Core Package**: `src/pie/`
- 📘 **7 Core Layer Files** ใน `src/pie/layers/`:
  1. `intentEngine.ts` — Bilingual Keyword Mapping (ไทย/อังกฤษ)
     - `DIMENSION_KEYWORDS`: 12 Life Dimensions
     - `BRAIN_TYPE_KEYWORDS`: 11 Brain Types
     - `detectMessageType()`, `detectDimensions()`, `detectBrainTypes()`, `extractKeywords()`
     - Pure function: 0 AI Calls
  2. `memoryRetrieval.ts` — Hierarchical Retrieval
  3. `contextRanking.ts` — 3-Factor Scoring (relevance 0.5 / recency 0.25 / confidence 0.25)
  4. `promptBuilder.ts` — Role Persona + `[BRAIN CONTEXT]` Block + Hooks
  5. `providerRouter.ts` — 3 Provider Failover (Gemini → Groq → OpenRouter)
  6. `responseAnalyzer.ts` — Tone/Length/Facts/SuggestedMemories
  7. `learningEngine.ts` — Human-in-the-loop (applied=false เสมอ)
- 🎭 **9 AI Role Definition Files** ใน `src/pie/roles/`:
  - `coach.ts` (Life Coach — detailed, temp 0.7)
  - `therapist.ts` (CBT Therapist — reflective, temp 0.6)
  - `psychologist.ts` (Depth Psych — socratic, temp 0.5, memoryWeight 0.9 สูงสุด)
  - `planner.ts` (Strategic Planner — concise, temp 0.4, goalWeight 1.0 สูงสุด)
  - `languageTutor.ts` (Language Tutor — detailed, temp 0.6)
  - `tradingMentor.ts` (Trading Mentor — concise, temp 0.3 ต่ำสุด)
  - `teacher.ts` (AI Teacher — detailed, temp 0.6)
  - `nutrition.ts` (Nutrition Coach — detailed, temp 0.7)
  - `custom.ts` (Default Fallback — *, temp 0.7)
- 🏬 **Repository Pattern** ใน `src/pie/repository/`:
  - `BrainRepository.ts` (Interface: 10 methods)
  - `RoomBrainRepository.ts` (Implementation wraps RoomDatabase/localStorage)
- 📋 **Pipeline Orchestrator**:
  - `pipeline.ts`: `runPipeline()`, `createEmptyContext()`, `resolveRepository()`, `getProvidersFromSettings()`, `createPipelineRequestFromLegacy()`
  - 9 Stages Order: `created → intent → retrieval → ranking → prompt_build → provider_call → analysis → learning → complete`
- 🗂️ **Registry**: `AIRoleRegistry` Singleton — `register()`, `get()`, `getAll()`, `ids()`, `getByLegacyMode()`
- 🏷️ **Type System** (`src/pie/types.ts`):
  - `PipelineContext`, `PipelineRequest`, `PipelineRunResult`
  - `IntentResult`, `RetrievedMemory`, `RankedMemory`, `BuiltPrompt`
  - `ProviderResult`, `AnalyzedResponse`, `LearnResult`, `RetrievalSource`
  - 12 `LifeDimension` Ids, 11 `BrainType` Names, 9 `AIRoleId`

### Changed

- (Phase 1 เป็นการสร้างสถาปัตยกรรมใหม่ ไม่มี Change จากเดิม)

### Removed

- (Phase 1 เป็นการสร้างสถาปัตยกรรมใหม่ ไม่มี Removal)

### Fixed

- (Phase 1 เป็นการสร้างสถาปัตยกรรมใหม่ ไม่มี Bug Fix)

---

## Legend

| Icon | Meaning |
|------|---------|
| ✅ | Complete / Stable |
| 🚧 | Work in Progress |
| ⏳ | Planned / Upcoming |
| 🔧 | Infrastructure / Refactor |
| 🐛 | Bug Fix |
| ❌ | Removed / Deleted |
