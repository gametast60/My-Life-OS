# My Life OS — AI Architecture

> เอกสารนี้อธิบายสถาปัตยกรรม AI ของ My Life OS ทั้งหมด ตั้งแต่ Flow ระดับสูง ลงไปถึง Layer แต่ละชั้น และ Folder Structure ภายใน

---

## Current Phase

```
Phase 1: Foundation (PIE 7 Layers)          ✅ Complete
Phase 2: Full Pipeline Integration          ✅ Complete
Phase 3: Clean Architecture & Docs          ✅ Complete
Phase 4: Brain Intelligence Engine (BIE)    ⏳ Pre-4A (Documentation Ready)
   ├─ 4A: Semantic Retrieval + Hybrid       ⏳ Ready to Start (3/3 Decisions CONFIRMED)
   ├─ 4B: Knowledge Graph + Relationship    ⏳ Planned
   ├─ 4C: Reflection + Memory Intel         ⏳ Planned
   └─ 4D: Identity + Insight + Timeline     ⏳ Planned
Phase 5: Personal Intelligence              ⏳ Planned
```

---

## Documentation Suite (Phase 3 onwards — Source of Truth)

| File | Purpose | Update Cadence |
|------|---------|----------------|
| **AI_ARCHITECTURE.md** | Architecture Diagrams, Layers, Data Flow, Storage | ต่อทุก Sub-Phase (4A, 4B, 4C, 4D) |
| **ROADMAP.md** | Phase Status, Scope, Blockers, Progress % | ต่อทุก Sub-Phase |
| **CHANGELOG.md** | Keep a Changelog format: Added / Changed / Removed / Fixed | ต่อทุก Sub-Phase |
| **DECISIONS.md** | ADR — เหตุผลของการตัดสินใจ Architecture | เมื่อมี Decisions ใหม่ CONFIRMED |
| **KNOWN_ISSUES.md** | Technical Debt, Known Gaps, Limitations | เมื่อพบหรือแก้ไข Debt ใหม่ |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                            UI Layer                                 │
│  (AICoachView, Journal views, Settings, Modals)                     │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        AI Facade (aiService.ts)                     │
│  • sendAIChatRequest()       • generateGreeting()                   │
│  • summarizeDailyCheckin()   • analyzeTodayJournals()               │
│  • suggestBrainCard()        • generateGuide()                      │
│  • suggestJournalBrainPlacement()  • testAIConnection()             │
│  ─────────────────────────────────────────────────────────────────  │
│  Thin Facade: Validate Input → Build Pipeline Request → Run PIE     │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │ runPipeline(request, options)
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   PIE — Personal Intelligence Engine                │
│                                                                     │
│  9 Stages:  created → intent → retrieval → ranking → prompt_build   │
│            → provider_call → analysis → learning → complete        │
│                                                                     │
│  Unified Context Object: PipelineContext (ผ่านทุก Layer)            │
└──────┬─────────┬──────────┬─────────┬──────────┬──────────┬─────────┘
       │         │          │         │          │          │
       ▼         ▼          ▼         ▼          ▼          ▼
   Intent    Retrieval   Ranking   Prompt     Provider   Analyzer
   Engine    Layer       Layer     Builder    Router     Layer
       │         │          │         │          │          │
       │         │          │         │          │          │
       │         ▼          │         │          │          ▼
       │   ┌──────────┐     │         │          │   Response Analysis
       │   │  Brain   │     │         │          │   • Tone / Length
       │   │Repository│     │         │          │   • Actionable Items
       │   │ (Single  │     │         │          │   • Fact Extraction
       │   │  Source  │◄────┘         │          │   • Suggested Memory
       │   │   of     │               │          │
       │   │  Truth)  │◄──────────────┘          │
       │   └────┬─────┘                          │
       │        │                                │
       │        ▼                                ▼
       │   RoomBrainRepository ────────► Provider Failover Chain
       │   (wraps RoomDatabase)          Gemini → Groq → OpenRouter
       │   localStorage CRUD
       │        │
       ▼        ▼
   Keyword    Brain Tree Engine V1
   Mapping    Hierarchical Graph
   (ไทย/อังกฤษ)  Type → Dimension → Tag → Evidence
                RPG Exponential Growth
                Multi-label Evidence Linking
```

---

## Dependency Rule

```
UI → AI Facade → PIE Pipeline → Layers → Repository → Database

  ใกล้ User                                             ใกล้ Database
  (High-level)                                           (Low-level)

Rule:
  • Layer ในระดับสูง import Layer ในระดับต่ำได้
  • Layer ในระดับต่ำ ห้าม import Layer ระดับสูงกลับขึ้นมา
  • ทุก Layer รับ PipelineContext เข้า → return PipelineContext ใหม่
    (Functional Pipeline, ไม่มี Side Effect ใน Layer ตัวเอง)
```

---

## PIE Pipeline (7 Core Layers + 2 Meta Stages)

```
PipelineStages (PIPELINE_STAGE)
┌─────────────┬───────────────────────────────────────────────────────┐
│  Stage      │  Description                                          │
├─────────────┼───────────────────────────────────────────────────────┤
│  created    │  Initialize PipelineContext from request              │
│  intent     │  Intent Engine — ดึง Intent / Dimension / Keywords    │
│  retrieval  │  Memory Retrieval — ดึง Memory ผ่าน BrainRepository   │
│  ranking    │  Context Ranking — ให้คะแนน relevance/recency/conf   │
│ prompt_build│  Prompt Builder — รวม System + Context + User Prompt  │
│provider_call│  Provider Router — เรียก AI (Gemini → Groq → OpenRouter)│
│  analysis   │  Response Analyzer — แยก Fact / Suggested Memory     │
│  learning   │  Learning Engine — สร้าง Pending Learning Item       │
│  complete   │  Finalize PipelineContext + Logging                   │
└─────────────┴───────────────────────────────────────────────────────┘
```

---

## Layer Deep Dive

### 1. Intent Engine (`intentEngine.ts`)

- **Type**: Pure Function (Zero AI Call)
- **Input**: `PipelineContext`
- **Output**: `IntentResult` — messageType, detectedDimensions, detectedBrainTypes, keywords, urgency, requiresContext
- **Method**: Keyword Mapping ภาษาไทย + อังกฤษ
  - `DIMENSION_KEYWORDS`: 12 Life Dimensions × (ไทย+อังกฤษ)
  - `BRAIN_TYPE_KEYWORDS`: 11 Brain Types × (ไทย+อังกฤษ)
  - `detectMessageType()`: greeting/emotional/question/planning/reflection/command/statement
  - `extractKeywords()`: Thai chars (2+), English words (3+), unique top 20

### 2. Memory Retrieval (`memoryRetrieval.ts`)

- **Single Source of Truth**: เสมอไปเรียก `BrainRepository.getRelevantMemory()`
- **Retrieval Hierarchy**:
  1. Brain Tree Tags (Primary — Growth Score Evidence)
  2. Recent Journals (Primary — User Written Context)
  3. Legacy BrainCards (Fallback — ถ้า Primary Sources < 5)
- **Role Permission Filter**:
  - `allowedDimensions` / `allowedBrainTypes` จาก Role Config
  - Filter ก่อนเข้า Ranking
- **Backward Compatibility**: ถ้า Views ส่ง brainCards/recentJournals ผ่าน `extraContext` → Repository รับเป็น `requestContext` override

### 3. Context Ranking (`contextRanking.ts`)

- **3 Factor Scoring** (ปรับ Weight ได้):
  - **Relevance (0.5)**: Keyword hits + Dimension match + BrainType match + Context Priority Boost
  - **Recency  (0.25)**: Decay Curve — 1วัน=1.0, 7วัน=0.7-0.9, 30วัน=0.5-0.7, 365วัน=0.15
  - **Confidence (0.25)**: Source Kind weight
    - `brain_tree_tag`: 0.95  ✅ (Primary)
    - `journal`:         0.90
    - `brain_card_legacy`: 0.85 (Fallback)
- **Final Formula**:
  ```
  base = rel*0.5 + rec*0.25 + conf*0.25
  base = base × (0.4 + memoryWeight*0.3 + goalWeight*0.3)
  ```
- Default: `maxSources = 10`

### 4. Prompt Builder (`promptBuilder.ts`)

- **System Prompt จาก Role**:
  - `role.persona` — บุคลิกของ Role
  - `role.tone` — Tone การพูด
  - `role.promptStrategy` — strategy note (concise/detailed/socratic/reflective)
  - + "ตอบภาษาไทย"
- **ถ้ามี `customSystemPrompt`**: Override ทั้งหมด (ใช้สำหรับ UX Mode พิเศษ เช่น Future Self, Secretary)
- **Context Block `[BRAIN CONTEXT]`**:
  - max 8 items / 2800 chars
  - Format: `Type|Dim|Title — ContentSnippet #tags`
- **Recent Journals Block `[RECENT JOURNALS]`**: max 3 items / 900 chars
- **Hooks**:
  - `customUserPrefix` / `customUserSuffix`
  - `outputFormat = "json"` → "ตอบเป็น JSON เท่านั้น"
- **Token Estimate**: `Math.ceil(length / 4)`

### 5. Provider Router (`providerRouter.ts`)

- **Pure I/O Layer**: ห้ามมี Business Logic ใดๆ
- **Multi-provider Failover Chain** (เรียงตาม Priority):
  1. **Gemini** — `generativelanguage.googleapis.com`
  2. **Groq** — `api.groq.com/openai/v1`
  3. **OpenRouter** — `openrouter.ai` (FREE_MODELS auto-fallback chain)
- **Status**:
  - `"ok"` — สำเร็จ
  - `"quota"` — HTTP 429 หรือ Response มี "QUOTA:" prefix
  - `"error"` — อื่นๆ
- **Connection Test**: `testProviderConnection()` — ส่ง "Respond with CONNECTED" → ตรวจ include("CONNECTED")

### 6. Response Analyzer (`responseAnalyzer.ts`)

- **Metadata**:
  - Tone: energetic/warm/harsh/professional/casual/deep/default
  - LengthCat: short/medium/long (<200/800)
  - Actionable: verb list + numbered (`1.`) + bullet regex
- **Fact Extraction**:
  - Bold `**text**`
  - Bullet / Numbered lines (top 15)
- **Suggested Memories (4 Regex Patterns)**:
  - `บบันทึก(ลง Brain)?:` / `เราควร(ที่จะ)?จด(ไว้)?:`
  - `Remember to:`
  - `Key (insight|takeaway|lesson):?`
- **Confidence Calculation**:
  ```
  0.7 base + min(0.15, sourceCount*0.02)
  − latency penalty
  − errorCount*0.03
  ```

### 7. Learning Engine (`learningEngine.ts`)

- **Human-in-the-loop (HARD CONSTRAINT)**:
  - `applied` field = **เสมอ false** (`opts.autoApply && shouldPersist ? false : false`)
  - Items ถูกบันทึกลง Pending Queue (localStorage) รอ User Confirm ก่อน
- **2 Input Streams**:
  1. `analysis.suggestedMemories` → Brain Card
  2. `analysis.extractedFacts` (dedup by title) → Brain Card
- **Persistence**:
  - `repo.savePendingLearning(items)`
  - localStorage key: `mylifeos_pie_pending_learning_v1`
  - max 100 items (FIFO slice)
  - Non-fatal failure: try/catch → ไม่ propagate error
- **Defaults**: `autoApply=false, minConfidence=0.72, maxItemsToPersist=3`

---

## Human-in-the-loop Learning Flow

```
  AI Response (Provider Router)
        │
        ▼
  Response Analyzer
   ├── extractedFacts[]
   └── suggestedMemories[]
        │
        ▼
  Learning Engine (decideLearning)
   ├── คัดเลือกด้วย minConfidence + dedup
   ├── applied = false (เสมอ)
   └── itemsToPersist[]
        │
        ▼
  BrainRepository.savePendingLearning()
   └── localStorage: mylifeos_pie_pending_learning_v1
        │
        ▼
  ⏸ Pending Queue (รอ User Action)
        │
        ▼
  User Confirm / Reject (Future UI: Confirm Modal)
   ├── Confirm → Write to Brain Tree (Type → Dimension → Tag + Evidence)
   └── Reject  → Discard
```

---

## Brain Repository Pattern

```
Interface: BrainRepository (src/pie/repository/BrainRepository.ts)
    │
    ├── getBrainTree()            → { types, dimensions, tags }
    ├── getBrainTreeTypes()       → BrainTreeType[]
    ├── getJournals(limit?)       → JournalLike[]
    ├── getLegacyBrainCards()     → BrainCard[]
    ├── getSettings()             → UserSettings
    │
    ├── getRelevantMemory(params) → RetrievalSource[]
    │     keywords, detectedDimensions, detectedBrainTypes
    │     allowedDimensions, allowedBrainTypes
    │     maxSources (default 30)
    │     requestContext? (per-request override for backward compat)
    │
    ├── savePendingLearning(items) → void
    └── getPendingLearning()       → LearnResult.itemsToPersist


Implementation: RoomBrainRepository (wraps RoomDatabase singleton)
    │
    ├── Private Conversion Helpers (Single Location — DRY)
    │   ├── convertBrainCardsToSources()
    │   ├── convertJournalsToSources()
    │   └── convertBrainTreeToSources()
    │
    ├── localStorage CRUD
    └── defaultBrainRepository = new RoomBrainRepository() (singleton export)
```

**Hard Rule**: ทุก Layer ห้าม Query RoomDatabase / localStorage โดยตรง ต้องผ่าน Repository เท่านั้น

---

## AI Roles (9 Native Roles)

ไฟล์: `src/pie/roles/{coach,therapist,psychologist,planner,languageTutor,tradingMentor,teacher,nutrition,custom}.ts`

```
  Role Id              Persona / Strategy          allowedDimensions             Temp  memoryW goalW
  ────────────────────────────────────────────────────────────────────────────────────────────────
  coach               Life Coach — detailed        *                              0.7   0.7     0.9
  therapist           CBT Therapist — reflective   [emotion,mindset,relationship,identity,values]
                                                                                   0.6   0.8     0.3
  psychologist        Depth Psych — socratic       [emotion,mindset,identity,values,relationship]
                                                                                   0.5   0.9     0.2
  planner             Strategic Planner — concise  [goal,work,finance,learning,lifestyle]
                                                                                   0.4   0.5     1.0
  language_tutor      Language Tutor — detailed    [learning,lifestyle,identity]  0.6   0.7     0.6
  trading_mentor      Trading Mentor — concise     [finance,mindset,learning,goal]0.3   0.7     0.7
  teacher             AI Teacher — detailed        [learning,mindset,goal]         0.6   0.7     0.6
  nutrition           Nutrition Coach — detailed   [health,lifestyle,goal,mindset] 0.7   0.7     0.8
  custom              Default Fallback              *                              0.7   0.5     0.5
```

Registry: `AIRoleRegistry` (Singleton Map-based) — Methods: `register()`, `get()`, `getAll()`, `ids()`

Backward Compatibility: 6 Legacy UX Modes → Map to 9 Native Role Ids:
  - Coach → coach, Therapist → therapist, Decision → planner
  - Future Self → coach (with customSystemPrompt for viewpoint twist)
  - Secretary → planner (with customSystemPrompt for Secretary persona)
  - Reflection → coach, Chat → custom

---

## Brain Tree Engine V1

**Data Model (4 ชั้น)**:
```
BrainType (11)  →  Dimension (12)  →  Tag (N)  →  Evidence (N)
    │                  │                 │              │
    │                  │                 │              └─ evidenceKind: journal/habit/reminder/goal/checkin/ai_memory/brain_card_legacy
    │                  │                 │              └─ weight (config)
    │                  │                 │              └─ timestamp
    │                  │                 └─ growthScore, level, status (seedling/growing/strong/mastery)
    │                  │                 └─ RPG Exponential:  level = floor(sqrt(score/constant))
    │                  │                 └─ statusThresholds: 20/50/80/100%
    │                  │
    │                  └─ LIFE_DIMENSIONS: work,finance,relationship,health,mindset,learning,emotion,goal,lifestyle,values,hobby,identity
    │
    └─ BRAIN_TYPES: Goal,Habit,Knowledge,Belief,Identity,Preference,Skill,Strength,Weakness,Decision,Relationship
```

**Default Template (9 Seed Types)**: Goal, Habit, Knowledge, Belief, Identity, Skill, Memory, Fear, Idea  
(Idempotent seed: ถ้ามี type อยู่แล้ว return 0)

**Growth Formula (growth.ts)**:
```
S_n = constant × level^2       (constant = growthLevelConstant)
level = floor(sqrt(score / constant))
progressPct = (score - S_n) / (S_{n+1} - S_n)
STATUS_META = seedling🌱 (<=20%) → growing🌿 (<=50%) → strong🌳 (<=80%) → mastery🌟 (<=100%)
```

**Evidence Kinds**:
- journal (2), habit_completed (5), reminder_completed (3)
- goal_progress (10), daily_checkin (1)
- ai_memory (1), brain_card_legacy (2)

---

## Folder Structure

```
src/
├─ pie/                                          ← PIE — Personal Intelligence Engine
│  ├─ types.ts                                   ← Global PIE Types (PipelineContext, AIRole, Stages ฯลฯ)
│  ├─ pipeline.ts                                ← Core Orchestrator: runPipeline(), createEmptyContext(), resolveRepository()
│  ├─ registry.ts                                ← AIRoleRegistry Singleton (9 Roles register)
│  ├─ logger.ts                                  ← PipelineLogger Singleton — maxLogs=200 FIFO
│  ├─ index.ts                                   ← Public Barrel Export (ทุกอย่างที่ภายนอกต้อง import)
│  │
│  ├─ layers/                                    ← 7 Core Layers (Functional: ctx → ctx)
│  │  ├─ intentEngine.ts                         ← Pure Keyword Mapping (ไทย/อังกฤษ) — 0 AI Calls
│  │  ├─ memoryRetrieval.ts                      ← เรียก BrainRepository.getRelevantMemory() เท่านั้น
│  │  ├─ contextRanking.ts                       ← 3-factor Scoring (rel/rec/conf)
│  │  ├─ promptBuilder.ts                        ← Role Persona + Context + User Prompt
│  │  ├─ providerRouter.ts                       ← Pure I/O — Gemini/Groq/OpenRouter Failover
│  │  ├─ responseAnalyzer.ts                     ← Fact + Suggested Memory Extraction
│  │  └─ learningEngine.ts                       ← Human-in-the-loop Pending Queue
│  │
│  ├─ roles/                                     ← 9 Role Definitions (Persona/Tone/Strategy/Permissions)
│  │  ├─ index.ts                                ← registerAllRoles() — 9 roles register
│  │  ├─ coach.ts
│  │  ├─ therapist.ts
│  │  ├─ psychologist.ts
│  │  ├─ planner.ts
│  │  ├─ languageTutor.ts
│  │  ├─ tradingMentor.ts
│  │  ├─ teacher.ts
│  │  ├─ nutrition.ts
│  │  └─ custom.ts (Fallback)
│  │
│  └─ repository/                                ← Brain Repository Pattern (Single Source of Truth)
│     ├─ BrainRepository.ts                      ← Interface + RequestContextOverride type
│     └─ RoomBrainRepository.ts                  ← Implementation wraps RoomDatabase(localStorage)
│                                                  + Conversion Helpers (DRY — ไม่มีซ้ำที่อื่น)
│
├─ lib/
│  ├─ aiService.ts                               ← AI Facade (Thin Orchestration Layer)
│  ├─ db.ts                                      ← RoomDatabase Singleton — localStorage Storage
│  └─ brainTree/
│     ├─ brainTreeService.ts                     ← Brain Tree CRUD + Evidence Helpers + Placement Search
│     └─ growth.ts                               ← RPG Exponential Growth Formula
│
├─ views/                                        ← UI Views (เรียกผ่าน aiService เท่านั้น)
│  └─ AICoachView.tsx                            ← 6 Legacy UX Modes Grid
│
└─ types.ts                                      ← Global App Types (LIFE_DIMENSIONS, BRAIN_TYPES, BrainCard, AIMode ฯลฯ)
```

---

## Data Flow (End-to-End Example: AI Chat)

```
1. User types message in AICoachView.tsx
      │
2. View calls: sendAIChatRequest({prompt, mode, brainCards, recentJournals, settings})
      │
3. aiService Facade:
      ├── Validate providers present
      ├── LEGACY_MODE_CONFIG[mode] → {roleId, customSystemPrompt?}
      ├── Build extraContext: brainCards, recentJournals, journalBlock suffix
      └── createPipelineRequestFromLegacy()
            │
4. PIE Pipeline (runPipeline):
      │
      ├─ Stage 1: Intent Engine
      │   └── detect dimensions, brain types, keywords → keyword count
      │
      ├─ Stage 2: Memory Retrieval
      │   └── repo.getRelevantMemory(kw, dims, types, allowed, requestContext)
      │       ├─ Primary: BrainTree Tags + Journals
      │       └─ Fallback: Legacy BrainCards (if < 5 primary)
      │
      ├─ Stage 3: Context Ranking
      │   └── 3-factor scoring → top 10 sources
      │
      ├─ Stage 4: Prompt Builder
      │   ├── System Prompt:
      │   │   ├── ถ้ามี customSystemPrompt (Future Self/Secretary) → ใช้นั้น
      │   │   └── ถ้าไม่มี → Role persona + tone + strategy + "ตอบไทย"
      │   ├── Context Block [BRAIN CONTEXT]
      │   ├── Recent Journals Block
      │   └── User Input + hooks
      │
      ├─ Stage 5: Provider Router (Failover Chain)
      │   └── Gemini → Groq → OpenRouter → rawText
      │
      ├─ Stage 6: Response Analyzer
      │   ├── Extract: facts, tone, length
      │   └── Detect: suggestedMemories (regex)
      │
      └─ Stage 7: Learning Engine
          ├── คัด facts/memories ด้วย minConfidence 0.72
          ├── applied = false (เสมอ)
          └── repo.savePendingLearning() → localStorage queue
            │
5. Pipeline returns finalText (success or graceful error)
      │
6. View displays AI response to User
```

---

## Hard Constraints (Non-negotiable)

| # | Rule | Status |
|---|------|--------|
| 1 | **All AI Calls through PIE** — ทุก AI Call ต้องผ่าน `runPipeline()` ห้ามเรียก Provider ตรง | ✅ |
| 2 | **Layer Isolation** — Intent=Pure, Prompt=no Memory I/O, Provider=Pure I/O only | ✅ |
| 3 | **Human-in-the-loop** — Learning Engine `applied=false` เสมอ; User Confirm ก่อน Brain Tree | ✅ |
| 4 | **BrainRepository Single Source of Truth** — Layer อื่น ห้าม Query Database เอง | ✅ |
| 5 | **No UX/UI Change** — Refactor/Architecture ต้องไม่กระทบ Feature และ UX เดิม | ✅ |
| 6 | **Zero Dead Code** — No commented code, no unused imports, no duplicate helpers | ✅ |

---

## 🌟 Phase 4 — Brain Intelligence Engine (BIE) Components

> **Position:** BIE = Side Extension Layer เหนือ PIE (ไม่แทนที่ PIE, ไม่แก้ PIE Architecture เดิม)
>
> **Folder:** `src/pie/bie/` (แยกจาก PIE core Layers)
>
> **Runtime Pattern:** BIE Hooks ถูกเรียกจากภายใน `runMemoryRetrieval()` + `rankContext()` + (optional) ระหว่าง `analysis → learning`

### Component Overview

| Sub-Phase | Component File | What it does | Input | Output | Persist? |
|-----------|---------------|--------------|-------|--------|----------|
| **4A** | `semanticService.ts` | Hybrid Embedding Provider: Primary via Gemini Embedding API, Fallback via Local TF-IDF/BM25 + Synonyms | `text: string, providers: APIProvider[]` | `embedding: number[], method: "gemini" \| "local"` | Persistent Cache (`bie_embeddings` RoomDB table via contentHash) |
| **4A** | `vectorIndex.ts` | Vector Index (Linear Scan Cosine Similarity O(N), Dimension-Agnostic) | `query_vec: number[], maxHits: number` | `{nodeId, score}[]` Top-N Similar | No (reads from `bie_embeddings` table) |
| **4B** | `graphStore.ts` | Knowledge Graph CRUD: GraphNodes, GraphEdges, Path Queries | CRUD Ops, Path Queries | `GraphNode[] \| GraphEdge[] \| Path` | `bie_graph_nodes` + `bie_graph_edges` (RoomDB applied=false) |
| **4B** | `relationshipEngine.ts` | Auto-detect Relationships: supports, conflicts, causes, derived_from (via Semantic >0.85 + Evidence Patterns) | `Tag A, Tag B, EvidenceWindow[]` | `GraphEdge[] suggestions[]` | **`bie_pending_queue`** (HITL applied=false) |
| **4C** | `consolidationEngine.ts` | Memory Consolidation: Duplicate Check, Conflict Check, Merge Suggest, Confidence Boost | `newLearningItem[] + existingTag[] + embeddings[]` | `ConsolidationResult[]` | **`bie_pending_queue`** (HITL applied=false) |
| **4C** | `memoryScoring.ts` | Evidence Scoring + Decay: 5 Fields (importance, evidenceCount, lastConfirmed, lastUsed) on BrainTreeTag | `All BrainTreeTags + Config.decay` | `UpdatedTags[] + importanceScore[]` | Brain Tree (via BrainRepository + Confirm UI) |
| **4C** | `reflectionEngine.ts` | Pattern Detection: Core Value (90D ≥10 occurrences), Co-occurrence, Frequency, Conflict Detection | `BrainEvidence[] + 90D Window` | `Reflection[]` | `bie_identity` (RoomDB) + Pending Queue |
| **4D** | `insightGenerator.ts` | Insights: Trend 30D/90D %Change, Anomaly (>2σ), Progress, Milestone, Conflict Alert | `Timeline + Scoring + Graph` | `BieInsight[]` (Top 10 per run) | `bie_insights` (RoomDB FIFO 100 applied=false) |
| **4D** | `identityEngine.ts` | Identity Summary: 8 Categories (Values, Goals, Motivations, Personality, Strengths, Weaknesses, Thinking Pattern) | `Top Tags + Core Reflections` | `IdentitySummary` | `bie_identity` (RoomDB 1-row singleton applied=false) |
| **4D** | `timelineEngine.ts` | Life Timeline: Month / Quarter / Year Buckets + Milestones + Theme % Breakdown | `All Evidence + Time Buckets` | `TimelineQuarter[]` | `bie_timeline` (RoomDB Cache, contentHash invalidated rebuildable) |
| **4B** | `BrainIntelligenceRepository.ts` | SSOT Repository สำหรับ BIE (CRUD Interface 12 Methods): getEmbeddings, saveEmbedding, getGraphNodes/Edges, saveGraphEdge, getInsights/Identity/Timeline, append/applied BIE Pending Queue | Request Objects | Domain Objects + Storage | **All 7 `bie_*` RoomDatabase Tables** (Zero localStorage persistent data) |

### BIE Storage Structure (RoomDatabase Tables — Namespace bie_*)

**Important:** RoomDatabase = Storage หลัก 100% สำหรับ BIE; **localStorage ใช้ได้เฉพาะ bie_runtime_cache_v1 (Cache ชั่วคราวเท่านั้น)**

| Table Name (RoomDatabase) | Contents | Indexed By | Persistence |
|-----------|----------|-------------|-------------|
| `bie_embeddings` | `{id, contentHash, embedding[], dimensions, method, updatedAt}` | `id` (PK) + `contentHash` (UNIQUE) | **Persistent Cache** — ห้าม regenerate ถ้า hash ตรง |
| `bie_graph_nodes` | GraphNode: tag/person/fear/lesson/experience/milestone | `id` (PK) + `kind` + `dimension` | Persistent; wipeable namespace |
| `bie_graph_edges` | GraphEdge: supports/conflicts/causes/derived/related/opposes | `(fromId,toId,type)` UNIQUE; applied flag | 🔒 applied=false จนกว่า User Confirm |
| `bie_identity` | IdentitySummary: 8 Categories (singleton 1-row) | `id="singleton"` (PK) | applied=false จน Confirm |
| `bie_insights` | BieInsight[] (max 100 FIFO) | `id` + `kind` + `generatedAt DESC` | applied=false จน Confirm |
| `bie_timeline` | TimelineCache: Month/Quarter/Year buckets + Milestones | `periodKey` (PK: e.g. "2026-Q2") + `contentHash` | Cache (rebuildable when evidence changes) |
| `bie_pending_queue` | Pending BIE Items (HITL applied=false structural changes) | `id` + `kind` + `createdAt DESC` | **Applied=false by definition** (Queue ตัวเอง = Not Applied) |

**RoomDatabase Singleton Integration:**
- ทุก Table ผ่าน getter/setter methods ของ `RoomDatabase` class: `getBieEmbeddings()`, `setBieEmbedding()`, `getBieGraphEdges()`, `appendBiePendingQueueItem()`
- เก็บใน localStorage key เดียวกับ RoomDatabase (`roomdb_master`) = Snapshot Export/Import ทีเดียวได้หมด

**Storage Safety Rules:**
- Namespace `bie_` = wipe BIE ทั้งหมดได้โดยไม่กระทบ brain_tree_types, brain_tree_tags, brain_evidence (Core Brain Tree Tables)
- Persist ผ่าน `BrainIntelligenceRepository` Interface เท่านั้น → BIE Modules ห้ามเรียก `RoomDatabase.setBie*` โดยตรง
- ทุก write บน applied=true path = **ผ่าน Pending Queue + Confirm UI**; NO direct write from AI
- `contentHash(text)` = SHA-1 ของ trimmed normalized text (lowercase + remove spaces/punctuation) สำหรับ embedding cache invalidation

**Runtime Cache Only (localStorage = NOT Persistent):**
- `bie_runtime_cache_v1` = Hot-path ระหว่าง App session (recent semantic queries, cosine sim hot vectors, computed rankings)
- TTL = 30 นาที; Clean up ทุกครั้งที่เปิด App
- ❌ ห้าม store embeddings/graph/identity/insights/timeline ที่นี่ (ต้องอยู่ RoomDatabase เท่านั้น)

---

## 🔒 Phase 4 Additional Hard Constraints

| # | Rule | Rationale |
|---|------|-----------|
| P4-1 | **PIE Architecture Immutable** — Phase 4 ห้ามแก้ `PIPELINE_STAGE[]` order เดิม; BIE ถูกเรียกเป็น Hooks ภายใน Stage เดิม | ไม่ต้องกลับไปแก้ Architecture อีกครั้ง (Phase 3 จบเรียบร้อย) |
| P4-2 | **Zero UX/UI Change** — AICoachView, Journal, Modals ทั้งหมดทำงานเหมือนเดิม; BIE ไม่สร้าง Component ใหม่ | Core Philosophy Phase 4: "ทำให้ AI คิดได้ดีขึ้น ไม่ใช่ทำให้ UI เปลี่ยน" |
| P4-3 | **Human-in-the-loop 100%** — BIE ทุก Output ที่จะ persist ลง Core Brain Tree หรือ bie_graph_v1 ต้อง applied=false; เข้า `bie_pending_v1` รอ User Confirm | ไม่ให้ AI ปนเปื้อน Knowledge โดยอัตโนมัติ |
| P4-4 | **Docs-Code Co-commit** — ทุกครั้งที่แก้ BIE Code ต้องอัปเดต AI_ARCHITECTURE.md, ROADMAP.md, CHANGELOG.md ใน Commit เดียวกัน | กฎจาก Phase 4 Development Rules; ป้องกัน Code ล้าหลัง Docs |
| P4-5 | **Fallback Safety** — Semantic ทุก Operation ต้องมี Offline Fallback Path (Provider Quota Exceed / No Internet → Local TF-IDF ยังทำงานได้) | ไม่ให้การค้นหาข้อมูลพังเมื่ออินเทอร์เน็ตขาด |
| P4-6 | **Regression Gate** — ก่อน Sub-phase ถือว่า Complete ต้องผ่าน `npm run build` + `npm run lint` + 7 AI Features in aiService ยังทำงานครบ 100% | ไม่ให้ Phase 4 ทำลายระบบเดิม |
| P4-7 | **BIE Sidecar Isolation** — BIE ไม่ Import PIE Layer ภายในโดยตรง (ยกเว้น Interface types); PIE Import BIE เท่านั้น (Dependency Direction: PIE → BIE → Storage) | Clean Architecture; BIE สามารถถูก Disable ทั้งหมดได้โดยไม่กระทบ PIE Core |
| **P4-8** | **Backward Compatibility (Signature Integrity)** — ห้ามแก้ Existing API Signatures (aiService all exports, PipelineContext existing fields, PIPELINE_STAGES, BrainRepository interface methods) | tsc --noEmit check; additive changes only (new optional fields only — never modify or remove) |
| **P4-9** | **Provider-Independent Interfaces** — All new components depend on INTERFACES, NOT concrete implementations. BIE = EmbeddingProvider-Agnostic, GraphStore-Agnostic | Constructor DI accepts `EmbeddingProvider` interface (never `GeminiEmbeddingProvider` concrete type) |
| **P4-10** | **Performance — Embedding Cache First** — Never regenerate embedding ถ้า `contentHash(text)` ไม่เปลี่ยน. Persistent Cache บน `bie_embeddings` RoomDatabase table. Hit rate target > 95% สำหรับ content เดิม | Reduce API calls; Latency; Quota; Cost |
| **P4-11** | **Performance — Async Background for Heavy Tasks** — Reflection, Graph rebuild, Insight generation, Memory Consolidation = Run Async/Background Promise (no await on User response path); User response returns first; heavy work completes later | ไม่ Block User Input; Chat latency < 2s target |
| **P4-12** | **HITL Structural Changes Gate** — AI NEVER modifies Brain Tree or bie_* applied=true โดยอัตโนมัติ. Every structural change → `bie_pending_queue` (applied false by definition) | Core Philosophy: "AI เสนอ, ผู้ใช้ตัดสินใจ" 100% |
| **P4-13** | **Preserve Existing PIE HITL Flow** — PIE Learning Engine `applied=false` + `mylifeos_pie_pending_learning_v1` (localStorage) ยังคงทำงานไม่เปลี่ยนแปลง. BIE Queue = คู่ขนานสำหรับ BIE-specific Items ONLY | Two Pending Queues; No cross-contamination; No merge required |
| **P4-14** | **Future-Proof Disable Switch Everywhere** — PipelineOptions `bieEnabled?: boolean` (default true). If `bieEnabled=false`, BIE hooks ทั้งหมด SKIP → Behavior = Pre-Phase-4 100% (Keyword-only Ranking, Hierarchical Brain Tree, No Graph, No Identity) | Safe rollback; Zero regressions; A/B test ready |

