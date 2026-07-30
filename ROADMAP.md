# My Life OS — Roadmap

> Roadmap การพัฒนา AI Architecture ตั้งแต่ Foundation ไปจนถึง Personal Intelligence เต็มรูปแบบ

---

## Phase Overview

```
Phase 1 ─── Foundation            ✅  Complete   (PIE 7 Layers + Pipeline)
Phase 2 ─── Full Pipeline         ✅  Complete   (AI Calls 100% through PIE)
Phase 3 ─── Clean Architecture    ✅  Complete (Repo, Docs, Legacy Removal)
Phase 4 ─── Brain Intelligence    🚧  In Progress    (S1 of 4A Complete — Type & Interface Contracts)
Phase 5 ─── Personal Intelligence ⏳  Planned    (Reflection + Self-Awareness)
```

---

## Phase 1 — Foundation

```
╔══════════════════════════════════════════════════════════════════╗
║  Phase 1: Foundation                                             ║
║  Status: ✅ Complete                                              ║
╚══════════════════════════════════════════════════════════════════╝
```

### Objective
สร้างสถาปัตยกรรม PIE (Personal Intelligence Engine) แบบ Multi-layered Pipeline เป็นแกนหลักของระบบ AI โดยเน้น Layer Isolation, Unified Context, และ Backward Compatibility

### Completed
- ✅ สร้าง `src/pie/` Folder Structure (types, pipeline, layers, roles, repository)
- ✅ กำหนด `PipelineContext` เป็น Unified Context Object เดียวสื่อสารทุก Layer
- ✅ สร้าง 7 Core Layers ครบ:
  - Intent Engine (Pure Keyword Mapping ไทย/อังกฤษ)
  - Memory Retrieval (Hierarchy: BrainTree > Journal > Legacy)
  - Context Ranking (3-Factor: relevance/recency/confidence)
  - Prompt Builder (Role Persona + Context Block + Hooks)
  - Provider Router (3-Provider Failover: Gemini → Groq → OpenRouter)
  - Response Analyzer (Fact Extraction + Suggested Memory)
  - Learning Engine (Human-in-the-loop Pending Queue)
- ✅ สร้าง 9 Native Role Definitions (Coach/Therapist/Psychologist/Planner/LanguageTutor/TradingMentor/Teacher/Nutrition/Custom)
- ✅ สร้าง `AIRoleRegistry` Singleton สำหรับจัดการ Roles
- ✅ สร้าง `BrainRepository` Interface + `RoomBrainRepository` Implementation (localStorage)
- ✅ สร้าง Adapter ใน `aiService.ts` เพื่อคง Backward Compatibility (UX ไม่เปลี่ยน)
- ✅ Build & TypeScript Check ผ่าน 100%

### Remaining
- (ถูกย้ายไป Phase 3)

### Next Phase → Phase 2
- ย้าย AI Call ทุกจุดเข้าสู่ PIE 100%
- ใช้ Brain Tree เป็น Primary Memory แทน Legacy Brain Cards

---

## Phase 2 — Full Pipeline Integration

```
╔══════════════════════════════════════════════════════════════════╗
║  Phase 2: Full Pipeline Integration                              ║
║  Status: ✅ Complete                                              ║
╚══════════════════════════════════════════════════════════════════╝
```

### Objective
ย้ายระบบ AI ทั้งหมดเข้าสู่ PIE Architecture 100% ใช้ Brain Tree เป็นศูนย์กลาง Memory และปิด Human-in-the-loop Learning Cycle

### Completed
- ✅ ย้าย AI Call ทั้งหมด 7 จุดใน `aiService.ts` เข้าสู่ `runPipeline()` 100%:
  1. `sendAIChatRequest()` — 6 Legacy Modes
  2. `generateGreeting()` — Greeting Generator
  3. `summarizeDailyCheckin()` — Daily Reflection (skip retrieval/ranking)
  4. `analyzeTodayJournals()` — 4-Section Journal Analysis
  5. `suggestBrainCard()` — Brain Card Scout (JSON output)
  6. `generateGuide()` — Life GPS Guide (JSON output)
  7. `suggestJournalBrainPlacement()` — Placement Candidates
- ✅ ตั้งค่า Retrieval Hierarchy:
  - Primary: Brain Tree Tags + Recent Journals
  - Fallback: Legacy Brain Cards (ถ้า Primary < 5 ชิ้น)
- ✅ ย้าย Context Building Logic จาก `aiService` เข้า PIE Layers (Ranking, PromptBuilder)
- ✅ เชื่อมต่อ Response Analyzer + Learning Engine เข้าทุก Feature
  - `autoApply=false`, `minConfidence=0.72`
  - `applied=false` เสมอ (Human-in-the-loop constraint 100%)
- ✅ Legacy Audit: พบว่า `aiRouter.ts` ไม่มีผู้ใช้งาน (Zero Consumers)
- ✅ Build + TypeScript Check ผ่าน 100% + UX เดิมไม่เปลี่ยนแปลง

### Remaining
- (ถูกย้ายไป Phase 3)

### Next Phase → Phase 3
- Clean Architecture, Repository Pattern, ลบ Legacy, สร้างเอกสาร
- เตรียมพร้อมสำหรับ Brain Intelligence (Phase 4)

---

## Phase 3 — Clean Architecture & Documentation

```
╔══════════════════════════════════════════════════════════════════╗
║  Phase 3: Clean Architecture & Project Documentation             ║
║  Status: ✅ Complete                                           ║
╚══════════════════════════════════════════════════════════════════╝
```

### Objective
ปรับปรุงคุณภาพโค้ดให้สะอาด ลบ Legacy Business Logic, ทำ BrainRepository เป็น Single Source of Truth จัดระเบียบ Prompt และสร้างเอกสารโครงการ เพื่อเตรียมเข้าสู่ Phase 4: Brain Intelligence โดยไม่ต้องกลับมาแก้สถาปัตยกรรมหลัก

### Objective (รายละเอียด)
1. **BrainRepository Single Source of Truth** — Layer อื่น ห้ามอ่าน Database เอง
2. **Memory Retrieval ผ่าน Repository เท่านั้น** — ลบ Duplicate Conversion Logic
3. **aiService Cleanup** — ลดเหลือเพียง Thin Facade, Business Logic ย้ายออก
4. **Prompt Organization** — 9 Role Prompts เก็บใน `src/pie/roles/*.ts` เท่านั้น
5. **Remove Legacy MODE_PROMPTS** — ใช้ Role Persona แทน (ที่เทียบเท่ากัน)
6. **Legacy Cleanup** — aiRouter (ลบแล้ว), Dead Code, Duplicates, Unused Imports
7. **Dependency Cleanup** — Unused imports/exports, Dead code, Duplicate helpers
8. **Human-in-the-loop Confirm** — applied=false เสมอ + Pending Queue Flow สมบูรณ์
9. **Build Verification** — `npm run build` + `npm run lint` 0 Error
10. **Project Documentation** — AI_ARCHITECTURE.md + ROADMAP.md + CHANGELOG.md

### Completed (ใน Phase นี้)
- ✅ **P0 Syntax Error Fix**: แก้ `}` ที่ขาดหายไปใน `contextRanking.ts` (L141)
- ✅ **BrainRepository Single Source of Truth**:
  - ✅ เพิ่ม `RequestContextOverride` interface สำหรับ backward compat
  - ✅ อัปเดต `RoomBrainRepository.getRelevantMemory()` รองรับ `requestContext` param
  - ✅ ลบ Duplicate Conversion Logic 3 ฟังก์ชัน (convertBrainCards/Journals/BrainTree) ออกจาก `memoryRetrieval.ts`
  - ✅ `memoryRetrieval.ts` เหลือเพียง 67 บรรทัด (ลดจาก 272) — เรียก Repository เท่านั้น
- ✅ **MODE_PROMPTS Removal**:
  - ✅ ลบ `MODE_PROMPTS` Record (7 legacy prompts ที่ซ้ำกับ Role) ออกจาก `aiService.ts`
  - ✅ ใช้ `LEGACY_MODE_CONFIG` แทน → Role Persona + customSystemPrompt เฉพาะ viewpoint เฉพาะ (Future Self, Secretary)
  - ✅ 6 Legacy Modes ใช้ Native Role Persona 5/7 อัน (Coach, Therapist, Decision→planner, Reflection→coach, Chat→custom)
  - ✅ Backward compat: `MODE_TO_ROLE` export คงอยู่ (re-exported จาก LEGACY_MODE_CONFIG)
- ✅ **aiService เป็น Facade**: 7 Functions คงอยู่ (Facade API) + Response Adapter logic (JSON parsing, graceful errors)
- ✅ **aiRouter**: ไม่พบไฟล์ (Zero Consumers — ลบไปแล้วก่อน Phase นี้)
- ✅ **Human-in-the-loop Verification**: `learningEngine.ts` applied = false 100% (`opts.autoApply && shouldPersist ? false : false`)
- ✅ **Build**: `npm run build` → Exit 0 ✅
- ✅ **Lint**: `npm run lint` (tsc --noEmit) → Exit 0 ✅
- ✅ **Project Docs**:
  - ✅ `AI_ARCHITECTURE.md` — Diagram, Layers, Roles, Repo, Folder, Constraints
  - ✅ `ROADMAP.md` — Phase 1-5 (เอกสารนี้)
  - ✅ `CHANGELOG.md` — Keep a Changelog format Phase 1-3

### Remaining
- (Optional Phase 3 cleanup tasks):
  - [ ] Pending Learning Confirm UI (ปิด Human-in-the-loop Closed Loop)
  - [ ] 9 Native Roles UI ใน AICoachView (ยังคงแสดง 6 Legacy Modes สำหรับ UX ไม่เปลี่ยน)
  - [ ] Decommission Legacy Brain Cards (ถูกลบออกเมื่อ Brain Tree มี Evidence พอสมควร — Phase 4)
  - [ ] UserSettings legacy single-key fields: `aiApiKey`, `aiModel` → force ใช้ `apiProviders[]`
  - [ ] Views cleanup: Stop passing `brainCards`/`recentJournals` เอง; ให้ Repository โหลดจาก DB

### Next Phase → Phase 4
- Semantic Retrieval (Vector Embeddings) แทน Keyword-only
- Knowledge Graph Query
- Reflection Engine (AI ทบทวน Learning ของตัวเอง)
- Evidence Decay V2: Active decay + Tag Importance
- Phase 4 Target: Brain Tree เป็นศูนย์ความรู้เดียว, Semantic Recall แม่นยำ, AI สามารถ Reflection ได้

---

## Phase 4 — Brain Intelligence Engine (BIE)

```
╔══════════════════════════════════════════════════════════════════╗
║  Phase 4: Brain Intelligence Engine (BIE)                        ║
║  Status: 🚧 In Progress — 4A S1 Complete                         ║
║  Sub-Phase Breakdown (per 2026-07-30 user specification):        ║
║    4A: Semantic Retrieval + Hybrid Search        🚧 In Progress  ║
║       └─ S1: Type & Interface Contracts ✅ (2026-07-30)          ║
║       └─ S2-S9: ⏳ Pending                                       ║
║    4B: Knowledge Graph + Relationship Engine     ⏳ Planned 25%  ║
║    4C: Reflection Engine + Memory Intelligence   ⏳ Planned 25%  ║
║    4D: Identity + Insight + Timeline             ⏳ Planned 25%  ║
╚══════════════════════════════════════════════════════════════════╝
```

### Objective
สร้าง **Brain Intelligence Engine (BIE)** เป็น "สมอง" ของ My Life OS ที่นั่งเหนือ PIE Pipeline (แต่ไม่แทนที่ PIE) เพื่อยกระดับ:
- **Semantic Retrieval** (แทน Keyword-only)
- **Knowledge Graph** (Semantic Links)
- **Memory Intelligence** (Consolidation, Scoring, Decay)
- **Reflection & Personal Intelligence** (Identity, Insights, Timeline)

โดยยึดข้อจำกัดอย่างเข้มงวด:
- 🔒 ห้ามแก้ PIE Architecture (7 Layers เดิมคงอยู่ — BIE เป็น Hooks / Extension Layers)
- 🔒 ห้ามเปลี่ยน UX/UI เดิม (AICoachView 6 Legacy Modes คงอยู่)
- 🔒 ห้ามเปลี่ยน Prompt หลักของ 9 Native Roles
- 🔒 Human-in-the-loop applied=false 100% (BIE outputs → Pending Queue รอ User Confirm)

---

### 📦 Phase 4A — Semantic Retrieval + Hybrid Search (Infrastructure-First)
> **Status:** 🚧 In Progress (S1 Complete — 1/9 Steps)
>
> **Engineering Style:** Infrastructure First (Interfaces → Default Impls → Utilities → Hooks → Tuning)
>
> **Blocking Dependencies:** None (เริ่มได้ทันที)

**Objective:** แทน Keyword-only Retrieval ด้วย Hybrid Semantic Search โดยเน้น Provider-Agnostic Interfaces; ถ้า BIE disabled → Behavior ย้อนกลับ Pre-Phase 4 100%

**Infrastructure-First Work Order (Must Follow Order):**

| Step | Priority | Work Item | Deliverable | Status |
|------|----------|-----------|-------------|--------|
| **S1** | P0 (Blocking) | Define Type & Interface Contracts (All First) | `pie/types.ts` new optional fields + `src/pie/bie/types.ts` + `providers/embeddingProvider.ts` Interface + `BrainIntelligenceRepository.ts` Interface | ✅ Complete |
| **S2** | P0 (Blocking) | Core Utilities (Pure Functions — No I/O) | `contentHash()`, `normalizeVector()`, `cosineSimilarity()`, `levenshteinDistance()`, `bm25Tokenize()`, Thai/English synonym dictionary | ⏳ Next |
| **S3** | P0 | Default Provider Implementations | `GeminiEmbeddingProvider` (via existing @google/genai provider router) + `LocalBM25EmbeddingProvider` (Fallback, offline) |
| **S4** | P0 | Repository + DB Schema Extensions | `RoomBrainIntelligenceRepository` Impl + RoomDatabase add: `bie_embeddings`, `bie_pending_queue` tables (just Phase 4A tables first) |
| **S5** | P1 | Indexing & Scoring Logic | `semanticService.ts` (Hybrid orchestrator: Cache lookup → Primary Provider → Failover Local) + `vectorIndex.ts` (Dimension-agnostic cosine O(N)) + `hybridScorer.ts` (6-factor weights) |
| **S6** | P1 | Wire Hooks into PIE Layers (Preserve Signatures) | Add additive fields: `RetrievalSource.semanticScore`, `.tagMatchScore`, `.graphScore`; Extend `RoomBrainRepository.getRelevantMemory()` to call semantic service when enabled |
| **S7** | P1 | Disable Switch Integration | `PipelineOptions.bieEnabled?: boolean = true` — if false → SKIP ALL BIE HOOKS, behave = Pre-Phase-4 100% (Keyword-only 3-factor ranking, no cache, no embeddings) |
| **S8** | P2 (After S1-S7 verified) | Tuning & Weight Calibration | 6-factor formula weight testing, threshold tuning, synonym dictionary bootstrap |
| **S9** | P3 (Blocking Gate) | Regression & Docs Gate | Build + Lint Pass; 7 aiService features still work; Update 3 Core Docs + DECISIONS/KNOWN_ISSUES |

**Phase 4A Scope (ไม่เกิน Scope — ถ้าอยู่ใน 4B/4C/4D ต้องรอ):**
- ✅ IN SCOPE: EmbeddingProvider Interface + 2 Impls (Gemini default, BM25 fallback)
- ✅ IN SCOPE: Persistent Embedding Cache (bie_embeddings RoomDatabase table + contentHash invalidation)
- ✅ IN SCOPE: Vector Similarity Search (Linear Scan, dimension-agnostic)
- ✅ IN SCOPE: 6-Factor Hybrid Ranking (kw 0.20, semantic 0.30, tag 0.15, dim 0.10, recency 0.10, confidence 0.15)
- ✅ IN SCOPE: bieEnabled Disable Switch
- ✅ IN SCOPE: bie_pending_queue infrastructure (but graph/identity items = 4B/4D)
- ❌ OUT OF SCOPE: Knowledge Graph / Graph Edges (→ 4B)
- ❌ OUT OF SCOPE: Memory Consolidation / Scoring / Decay (→ 4C)
- ❌ OUT OF SCOPE: Identity / Insights / Timeline (→ 4D)

**Deliverables:**
- Files ใหม่: `src/pie/bie/types.ts`, `src/pie/bie/providers/embeddingProvider.ts` (Interface), `src/pie/bie/providers/geminiEmbeddingProvider.ts`, `src/pie/bie/providers/localBM25EmbeddingProvider.ts`, `src/pie/bie/semanticService.ts`, `src/pie/bie/vectorIndex.ts`, `src/pie/bie/hybridScorer.ts`, `src/pie/bie/BrainIntelligenceRepository.ts` (Interface), `src/pie/bie/RoomBrainIntelligenceRepository.ts`, `src/pie/bie/utils.ts` (Pure Fn Utils + Synonyms), `src/pie/bie/index.ts` (Barrel)
- Files แก้ไข (Additive only, no breaking API): `src/types.ts` (RoomDatabase bie_* schema), `src/lib/db.ts` (RoomDatabase getter/setter extensions), `src/pie/types.ts` (new RetrievalSource optional fields, PipelineOptions.bieEnabled), `src/pie/layers/memoryRetrieval.ts` (hook semantic query injection), `src/pie/layers/contextRanking.ts` (extend scorer with 3 new factors), `src/pie/repository/RoomBrainRepository.ts` (call to semantic service + vector index), `src/pie/pipeline.ts` (bieEnabled option pass-through)
- Docs Updated: AI_ARCHITECTURE.md + ROADMAP.md + CHANGELOG.md + KNOWN_ISSUES.md (Phase 4A resolved gaps)

**Next Sub-phase → 4B**
Knowledge Graph Node/Edge + Relationship Engine (uses Semantic Matching from 4A → auto-detect similar tags → create MERGE/supports/conflicts suggestions in bie_pending_queue)

---

### 📦 Phase 4B — Knowledge Graph + Relationship Engine
> **Status:** ⏳ Planned (Blocked until 4A complete)

**Objective:** ยกระดับ Brain Tree จาก Hierarchical 4-Chain (Type→Dim→Tag→Evidence) เป็น Full Knowledge Graph ที่มี Tag-to-Tag Semantic Links

**Scope:**
- ⏳ BrainIntelligenceRepository ไฟล์แยก (Storage: `bie_graph_v1`)
- ⏳ GraphNode Interface: tag / person / fear / lesson / experience / milestone
- ⏳ GraphEdge Interface: supports / conflicts / causes / derived_from / related / opposes
- ⏳ Graph Consistency: Auto-detect similar tags (4A Semantic >0.85 → suggest MERGE)
- ⏳ Relationship Engine: supports / conflicts / causes / derived_from

**Deliverables:**
- `src/pie/bie/BrainIntelligenceRepository.ts` — ใหม่
- `src/pie/bie/graphStore.ts` — ใหม่

**Next Sub-phase → 4C**
Memory Consolidation, Scoring, Decay + Reflection Engine (ใช้ Graph จาก 4B + Semantic จาก 4A)

---

### 📦 Phase 4C — Reflection Engine + Memory Intelligence
> **Status:** ⏳ Planned (Blocked until 4B complete)

**Objective:** ทำให้ Memory มีคุณภาพ (ไม่ซ้ำ, ไม่ขัดแย้ง, Decay ถูกต้อง) + เริ่ม Reflection Pattern Detection

**Scope:**
- ⏳ Memory Consolidation (Duplicate/Conflict/Merge/↑Confidence)
- ⏳ Evidence Scoring Fields (importance, evidenceCount, lastConfirmed, lastUsed) บน BrainTreeTag
- ⏳ Memory Decay Implementation (`BrainConfiguration.decay` ที่มี key อยู่แล้ว)
- ⏳ Reflection Engine: Frequency Pattern, Co-occurrence, Core Value Detector (90D ≥10 occurrences = Core)
- ⏳ Conflict Detection: Goal-Action Misalignment, Supports vs Conflicts Graph Edges
- ⏳ Optional PIE Stage `consolidation` ระหว่าง analysis → learning

**Deliverables:**
- `src/pie/bie/consolidationEngine.ts` — ใหม่
- `src/pie/bie/memoryScoring.ts` — ใหม่
- `src/pie/bie/reflectionEngine.ts` — ใหม่

**Next Sub-phase → 4D**
Identity, Insights, Timeline Aggregation (Aggregate ผลจาก 4A, 4B, 4C)

---

### 📦 Phase 4D — Identity Engine + Insight Generator + Life Timeline
> **Status:** ⏳ Planned (Blocked until 4C complete)

**Objective:** Aggregate Intelligence จากทุกเลเยอร์ แล้วสร้าง Personal Intelligence Products ที่ผู้ใช้บริโภคได้

**Scope:**
- ⏳ Identity Engine: Core Values / Goals / Motivations / Personality / Strengths / Weaknesses / Thinking Patterns
- ⏳ Insight Generator: Trends (30D/90D %Change), Anomalies (>2σ from mean), Progress (Level-ups, Milestones)
- ⏳ Life Timeline Engine: Month / Quarter / Year Buckets + Milestones + Theme Breakdown
- ⏳ BrainIntelligenceRepository getters for Identity / Insights / Timeline
- ⏳ Human-in-the-loop: ทุก Insight / Identity Item → applied=false 100% (Pending Queue)
- ⏳ (Optional, Non-UI Breaking) BIE Background Runner: Run Reflection/Consolidation ทุกครั้งที่ User เปิด App

**Deliverables:**
- `src/pie/bie/identityEngine.ts` — ใหม่
- `src/pie/bie/insightGenerator.ts` — ใหม่
- `src/pie/bie/timelineEngine.ts` — ใหม่
- Barrel Export `src/pie/bie/index.ts`

### Phase 4 End State → Phase 5
Phase 5 — Personal Intelligence:
- Proactive Agent (AI เริ่มคุยเอง)
- Identity & Values Decision Alignment Engine
- Multi-modal Context + Sleep-like Consolidation
- Decommission Legacy BrainCards (Threshold=0)
- Pending Learning Confirm UI (ปิด Closed Loop Human-in-the-loop)

---

## Phase 5 — Personal Intelligence

```
╔══════════════════════════════════════════════════════════════════╗
║  Phase 5: Personal Intelligence                                  ║
║  Status: ⏳ Planned                                                ║
╚══════════════════════════════════════════════════════════════════╝
```

### Objective
My Life OS AI กลายเป็น "ตัวตนเสมือน" ของผู้ใช้ — มี Self-Awareness, แนะนำเชิงรุก (Proactive), จดจำการเรียนรู้ระยะยาว และทำหน้าที่เป็น Personal Intelligence Engine เต็มรูปแบบ

### Planned (เบื้องต้น)
- **Proactive Agent**:
  - AI เริ่มการสนทนาเอง (ไม่รอ User) — ตามเวลา, ตาม Evidence Pattern
  - Daily Check-in Prompter, Goal Progress Reminder, Habit Streak Support
- **Identity & Values Alignment Engine**:
  - Values Graph: What does the user stand for?
  - Decision Auditor: ตรวจว่าการตัดสินใจของผู้ใช้สอดคล้องกับ Values หรือไม่
  - Life Trajectory Analysis: 6-12 months trend of Evidence
- **Multi-modal Context**:
  - Evidence จาก Activity Sensors (ถ้ามีบน Capacitor/Android)
  - Speech-to-Text Journal → Auto-Tag + Evidence Link
  - Export/Import Brain Tree Snapshot
- **Learning Consolidation (Sleep-like)**:
  - Background Job: รวม Learning Items ที่คล้ายกัน, ลด Duplicates
  - Hierarchical Belief Merge: Low-level Evidence → High-level Beliefs
  - Confidence Normalization

### End State
ผู้ใช้สามารถมั่นใจได้ว่า:
1. AI เข้าใจผู้ใช้จริง (จาก Brain Tree Evidence)
2. AI ไม่ "หลุด" จากตัวตนของผู้ใช้ (Values + Identity Guards)
3. AI เป็น Partner ในการเติบโต ไม่ใช่แค่ Tool
4. ทุกอย่างทำงานบน Local Storage ก็ได้ — ไม่มี Lock-in

---

## Summary Table

| Phase | Name | Status | Core Deliverable |
|-------|------|--------|-----------------|
| **1** | Foundation | ✅ Complete | PIE 7 Layers + 9 Roles + Repo Pattern |
| **2** | Full Pipeline | ✅ Complete | 100% AI Calls through PIE |
| **3** | Clean Architecture | ✅ Complete | Repo Single Source + Docs + Legacy Remove + Docs Policy |
| **4A** | Semantic Retrieval | 🚧 In Progress | S1 ✅ Type & Interface Contracts |
| **4B** | Knowledge Graph | ⏳ Planned | GraphNodes/Edges + Relationship Engine |
| **4C** | Memory + Reflection | ⏳ Planned | Consolidation + Decay + Pattern Detection |
| **4D** | Personal Intel | ⏳ Planned | Identity + Insights + Timeline |
| **5** | Full Intelligence | ⏳ Planned | Proactive Agent + Values Alignment + Consolidation |
