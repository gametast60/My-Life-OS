# My Life OS — AI Architecture

> เอกสารนี้อธิบายสถาปัตยกรรม AI ของ My Life OS ปัจจุบัน (Current State Reference) เท่านั้น
>
> สำหรับ **Implementation rationale / step-by-step diagrams ของแต่ละ Sub-step ที่ปิดจบแล้ว** (เช่น Phase 4A S1, S2, S4, S5, S6, S7 Detail) ดูไฟล์แยก:
> → `/doc/AI_ARCHITECTURE_ARCHIVE.md`

---

## Current Phase

```
Phase 1: Foundation (PIE 7 Layers)          ✅ Complete
Phase 2: Full Pipeline Integration          ✅ Complete
Phase 3: Clean Architecture & Docs          ✅ Complete
Phase 4: Brain Intelligence Engine (BIE)    ✅ Complete (S29 Gate 2026-08-01)
   ├─ 4A: Semantic Retrieval + Hybrid       ✅ Complete — S1-S9 (Types → Repository → Scoring → BIE Hook → Disable Switch → Tuning → Doc Gate)
   ├─ 4B: Knowledge Graph + Relationship    ✅ Complete — S10-S16 (Graph Nodes/Edges, Merge, Entity Resolution, Edge Proposals)
   ├─ 4C: Memory Intelligence + Reflection  ✅ Complete — S17-S22 (Merge/Conflict/Decay/Evidence Consolidation, Async Reflect Jobs)
   └─ 4D: Identity + Insight + Timeline     ✅ Complete — S23-S29 (Identity Singleton, 6-kind Insights, Timeline M/Q/Y, PIE Wiring, Master Gate)
Phase 5: BIE Productization + HITL + Learning Loop Closure    ⏳ In Progress (5A Discovery/Review, 5B Identity/Insight, 5C Timeline/Context, 5D Closeout — Service Worker/MCP = P1 Optional)
```

---

## Documentation Suite (Source of Truth)

| File | Purpose | Update Cadence |
|------|---------|----------------|
| **STATE.md** | Current Step + Active Constraints (ไฟล์แรกที่ต้องอ่านทุกครั้ง) | ต่อทุก Step |
| **STANDING_INSTRUCTIONS.md** | Global Workflow Rules (handoff, doc rules, targeted edit) | ไม่บ่อย (เมื่อมี policy ใหม่) |
| **AI_ARCHITECTURE.md** | Architecture State, Layers, Data Flow, Storage (ไฟล์นี้) | เมื่อ Architecture เปลี่ยนจริงเท่านั้น |
| **AI_ARCHITECTURE_ARCHIVE.md** | Archived step-by-step rationale diagrams (S1-S7 เก่าๆ) | ไม่บ่อย |
| **ROADMAP.md** | Phase Status + Work Order Table (toggle status) | ต่อทุก Step (targeted line edit) |
| **CHANGELOG.md** | Active Changelog (phase ปัจจุบัน + ก่อนหน้า 1) | ต่อทุก Step (~15 lines) |
| **CHANGELOG_ARCHIVE.md** | Compressed historical changelogs (S5-ด่าง, Phase 2, 1) | ไม่บ่อย |
| **DECISIONS.md** | Active Architecture Decision Records (ADR) | เมื่อมี Decision ใหม่จริง |
| **DECISIONS_ARCHIVE.md** | Archived ADR (fait accompli, ไม่ constrain step ปัจจุบัน) | ไม่บ่อย |
| **KNOWN_ISSUES.md** | Active Known Issues / Technical Debt (unresolved) | เมื่อมี Issue ใหม่หรือ resolved |
| **KNOWN_ISSUES_ARCHIVE.md** | Fully Resolved Issues (compressed 1-3 lines each) | ไม่บ่อย |

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
       │   │ (Single  │◄────┘         │          │   • Fact Extraction
       │   │  Source  │               │          │   • Suggested Memory
       │   │   of     │◄──────────────┘          │
       │   │  Truth)  │                          │
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
- **BIE Hook (S6/S7)**: เมื่อ `bieEnabled !== false` → Repository hook enrich legacy rows with `.semanticScore` / `.tagMatchScore` / `.graphScore=0` via S5 hybrid pipeline (cache-first embed → vector cosine → 6-factor scoring)
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
    │     bieEnabled?: boolean (S7: if explicit false → skip BIE hook)
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
│  │  ├─ memoryRetrieval.ts                      ← เรียก BrainRepository.getRelevantMemory() เท่านั้น (thread bieEnabled flag)
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
│     ├─ BrainRepository.ts                      ← Interface + RequestContextOverride + bieEnabled widen
│     └─ RoomBrainRepository.ts                  ← Implementation wraps RoomDatabase(localStorage)
│                                                  + Conversion Helpers + S6 BIE enrichment hook (S7 bieEnabled guard)
│
├─ bie/                                          ← BIE — Brain Intelligence Engine (Phase 4 — Side Extension Layer)
│  ├─ types.ts                                   ← BIE Domain Type Contracts (S1)
│  ├─ utils.ts                                   ← Core Utilities: contentHash, normalizeVector, cosineSimilarity, levenshteinDistance, bm25Tokenize
│  ├─ synonyms.ts                                ← Thai/English Synonym Dictionary + expandSynonyms()
│  ├─ hybridScorer.ts                            ← 6-Factor Hybrid Rank Formula (Σ=1.0. Weights exported named constants S8 deliverable)
│  ├─ semanticService.ts                         ← Cache-first + Primary/Failover Embedding Orchestrator
│  ├─ vectorIndex.ts                             ← Dimension-Agnostic Linear Scan Cosine O(N)
│  ├─ BrainIntelligenceRepository.ts             ← SSOT Repository Interface (S1: 7 areas, 28 methods)
│  ├─ RoomBrainIntelligenceRepository.ts         ← S4 Implementation: Embeddings cache + HITL Pending Queue real storage; 5 areas = placeholders
│  ├─ graph/                                     ← Phase 4B: entityResolver.ts / graphQueryService.ts / relationshipExtractor.ts / graphInferenceEngine.ts / edgeProposalQueue.ts / index.ts
│  ├─ reflection/                                ← Phase 4C: evidenceConsolidator.ts / conflictDetector.ts / decayEngine.ts / reflectorEngine.ts / index.ts
│  ├─ identity/                                  ← Phase 4D: identityEngine.ts / insightGenerator.ts / timelineBuilder.ts / types.ts / index.ts
│  └─ providers/
│     ├─ embeddingProvider.ts                    ← EmbeddingProvider Interface (S1)
│     ├─ geminiEmbeddingProvider.ts              ← Primary: Gemini HTTP API (S3. 10s timeout, 768-dim)
│     └─ localBM25EmbeddingProvider.ts           ← Fallback (S3. 100% offline. BM25+synonyms. 384-dim)
│
├─ lib/
│  ├─ aiService.ts                               ← AI Facade (Thin Orchestration Layer)
│  ├─ db.ts                                      ← RoomDatabase Singleton — localStorage Storage (core tables + bie_embeddings/bie_pending_queue)
│  └─ brainTree/
│     ├─ brainTreeService.ts                     ← Brain Tree CRUD + Evidence Helpers + Placement Search
│     └─ growth.ts                               ← RPG Exponential Growth Formula
│
├─ views/                                        ← UI Views (เรียกผ่าน aiService เท่านั้น)
│  └─ AICoachView.tsx                            ← 6 Legacy UX Modes Grid
│
└─ types.ts                                      ← Global App Types
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
      │   └── repo.getRelevantMemory(kw, dims, types, allowed, requestContext, bieEnabled)
      │       ├─ Primary: BrainTree Tags + Journals
      │       ├─ Fallback: Legacy BrainCards (if < 5 primary)
      │       └─ BIE Hook (S6/S7): if bieEnabled!==false → enrich rows with semantic/tag scores (S7 guard: false → byte-identical pre-4)
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
> **Runtime Pattern:** BIE Hooks ถูกเรียกจากภายใน `RoomBrainRepository.getRelevantMemory()` เมื่อ `bieEnabled !== false`
>
> **Note:** สำหรับ Implementation Rationale / Step-by-step Flow Diagrams / Component Detail Tables ของแต่ละ Phase 4A Sub-step (S1-S7 ที่ปิดจบแล้ว) ดูไฟล์แยก:
> → `/doc/AI_ARCHITECTURE_ARCHIVE.md`
