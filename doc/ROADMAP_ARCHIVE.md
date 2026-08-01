# ROADMAP_ARCHIVE.md — Closed/Delivered Phases + Future Planned Detail

> ไฟล์นี้เก็บ:
> 1. **Past Delivered Phases Detail**: Phase 1, Phase 2, Phase 3 Full Detail (Objective/Completed/Remaining/Next Phase Text เต็ม)
> 2. **Future Planned Phases Detail**: Phase 4B, 4C, 4D, Phase 5 Full Detail (Objective/Scope/Deliverables Full Text)
>
> **ไฟล์ ROADMAP หลัก /doc/ROADMAP.md เก็บเฉพาะ Status Sections ที่แก้บ่อย (Current Status Banner, 4A Work Order Toggle Table, 4A Scope, Progress Summary Table)**

---

## 📜 Archived: Past Delivered Phases (Full Detail)

---

### ✅ Phase 1 — Foundation + 9 AI Features

**Objective:**
- โครงสร้างฐานระบบ React + TypeScript + Vite + Tailwind
- ระบบ Storage (IndexedDB + RoomDatabase + localStorage Fallback)
- 9 จุดเรียกใช้ AI ทำงานได้ผ่าน Provider API เดียว
- Basic Role Persona 9 ตัว (Prompt สำหรับแต่ละบทบาท)
- No Brain Tree / No PIE Architecture (แต่ถูกพัฒนาต่อในภายหลัง)

**Delivered:**
1. ✅ Foundation Stack: React 18 + TypeScript Strict + Vite 5 + Tailwind CSS 3
2. ✅ Storage Abstraction: `RoomDatabase` IndexedDB (`idb` package) Schema 14 Tables
   + Backup Snapshot Import/Export (Base64 ZIP)
3. ✅ Brain Tree V1 Schema: Types(5) → Dimensions(13) → Tags(N) → Evidences(N)
4. ✅ Journal Schema: Daily 5 Categories (Work/Finance/Health/Relationship/Goal)
5. ✅ Character/Growth Schema: Level, EXP, Attribute, Role XP
6. ✅ Native 9 Role Persona Prompts: Creator/Detective/Empath/Mentor/Philosopher/Strategist/Tactician/Voice/Youth/
7. ✅ AI 7 Features 100% Functional (บางส่วนผ่าน Legacy Pipeline; ไม่ได้ PIE)
8. ✅ Settings: API Provider (Gemini/OpenAI), API Key, Dark/Light Theme
9. ✅ Exports: Brain Card CSV, Journal CSV, Brain Tree JSON Snapshot

**Remaining for Next Phase:**
- AI Call Points Not Unified Routing (7 features call Provider API directly no pipeline)
- Memory Retrieval Zero: Chat ดู Context เดียว ไม่ดึง Memory จาก Brain Tree/Journal เลย
- Learning Zero: AI ไม่ได้เรียนรู้จากการสนทนา ลง Memory ใดๆ
- Role/Intent Zero: Auto Role Selection หรือ Intent Classification ไม่มี

---

### ✅ Phase 2 — Core PIE Architecture + Memory Retrieval

**Objective:**
- สร้าง PIE Pipeline 9 Layers + Unified Context Object
- Wired 7 AI Call Points 100% ผ่าน PIE
- Memory Retrieval Hierarchical (Brain Tree + Journal + Legacy Cards Fallback)
- Keyword Ranking 3 Factors (TF-IDF × Role Permission × Dimension Match)
- Response Analyzer + Learning Engine (applied=false, Pending Queue localStorage)
- Role Intent Classifier 8 Native Roles + Intent 12 ประเภท
- Prompt Manager Native Role Prompt + Auto Persona Switch
- Mode Router Legacy Mode → Role Map

**Delivered:**
1. ✅ **PIE Core**: `PipelineContext` SSOT; PIPELINE_STAGES enum; 9 Layer interfaces functional `ctx in → ctx out`
2. ✅ **Intent Classifier**: Native 8-Role Heuristic Classifier (keywords+patterns+weights) + 12 Intent Classifications
3. ✅ **Memory Retrieval 3 Layers**: BrainTree Primary + Journal Primary + Legacy BrainCards Fallback (Threshold=5)
4. ✅ **Keyword Ranking**: 3 Factors: Keyword Match TF-IDF × Role Permission Filter × Dimension Weight
5. ✅ **Response Analyzer + Learning Engine**: `analyzeAIResponse()`, `runLearningEngine()`, `mylifeos_pie_pending_learning_v1` Queue, applied=false 100%
6. ✅ **Prompt Manager Native Roles**: `getRolePrompt()`, `addPersonaContext()`, `buildFinalSystemPrompt()`
7. ✅ **Mode Router Legacy**: MODE_PROMPTS → Native Role (Coach→Strategist, Therapist→Empath, Decision→Detective, Reflection→Mentor, Chat→Youth)
8. ✅ **PipelineLogger Singleton**: FIFO 200, per-stage duration/ranking/retrieval stats
9. ✅ **7 AI Call Points 100% PIE**: Chat 6 modes, Greeting, Daily Summary, Journal Analysis, Brain Card Suggest, Life Guide, Placement Suggest

**Remaining for Next Phase:**
- No Semantic Retrieval (Keyword Only) → Precision/Recall Issue
- No Knowledge Graph (Tag-to-Tag Relationships)
- No Identity Model / No Reflection Engine / No Insight Generator / No Life Timeline
- Pending Confirm UI = Zero applied=false Items Stuck
- Legacy MODE_PROMPTS Duplicate Native Roles

---

### ✅ Phase 3 — Clean Architecture: Repository SSOT + Legacy Prompt Merge

**Objective:**
- BrainRepository Interface + RoomBrainRepository Concrete Implementation (SSOT for Memory)
- memoryRetrieval.ts ลบ Conversion Logic ซ้ำ (RoomBrainRepository SSOT)
- MODE_PROMPTS Deletion → 9 Native Roles Single Source of Truth
- aiService.ts Clean Up: Thin Facade ลด 630 → 550 lines
- PIE Public Barrel Export (src/pie/index.ts)
- Consistency: Pending Learning Queue / Settings / Role Prompt Policy Clear
- 100% Regression Pass

**Delivered:**
1. ✅ **BrainRepository Interface + RoomBrainRepository Concrete**: 23 Methods Full Coverage (Brain Tree CRUD, Journal, Intent Permissions, Settings, Backup)
2. ✅ **memoryRetrieval.ts 75% Deletion**: 272 → 67 lines; RoomBrainRepository.getRelevantMemory() = SSOT for conversion
3. ✅ **RequestContextOverride Interface**: Views extraContext backward compat (Brain Cards / Recent Journals Passthrough)
4. ✅ **MODE_PROMPTS → LEGACY_MODE_CONFIG**: Delete Legacy Prompt Record 7; 5 → Native Role Direct Map; 2 → customSystemPrompt inline Future Self/Secretary
5. ✅ **aiService.ts Facade Clean**: Delete MODE_PROMPTS, Delete Dead Code, Optimize Mode → Role Configs (630→550, -80 lines)
6. ✅ **PIE Barrel**: `src/pie/index.ts` export everything; external code single-line import
7. ✅ **7 PIE Features 100% Regression**: Lint + Build 0 errors, All AI features route PIE correctly

**Remaining for Next Phase:**
- No Semantic Retrieval: Keyword-Only 3-factor ranking → Phase 4A Add Semantic Embeddings + Hybrid Scoring
- No Knowledge Graph: Tag-to-Tag / Person Relationships → Phase 4B Graph Edge Engine
- No Identity/Insight/Timeline: → Phase 4C Reflection + 4D Identity/Insight/Timeline
- Confirm UI Pending Queue Zero applied=false Pending Items not processed

---

## 🚀 Archived: Future Planned Phase Detail (4B/4C/4D + Phase 5)

---

### ⏳ Phase 4B — Knowledge Graph + Relationship Engine
*ขึ้นก่อนจะทำได้ต่อเมื่อ 4A Delivered เสร็จ (Blocking Chain: 4A→4B→4C→4D)*

**Objective:**
- Build Multi-relational Tag Knowledge Graph (supports/conflicts/derived/related/causes/opposes 6 ประเภท Edges)
- Merge Redundant Duplicate Tags (Synonym + Semantic Matching)
- Entity Resolution (Person, Organization, Fear, Life Lesson, Milestone Nodes)
- Semantic Edge Proposals (Auto Suggest but HITL applied=false Pending Queue)
- Graph Inference (Transitive Closure 2-hop): "A causes B" + "B conflicts C" → "A indirect conflicts C"

**Scope:**
- Add Provider Interfaces: GraphStore, EntityResolver, EdgeProposalGenerator
- Implementations: `RoomDatabaseGraphStore` (bie_graph_nodes / bie_graph_edges)
- Merge Flow: Detection → Dry-Run Diff Report → Confirm UI → applied=true Commit
- Entity Ingestion: Scan Brain Tree/Journal/Evidence → Extract Person/Fear/Milestone → Graph Nodes

**Deliverables:**
1. ✨ Graph Schema 7 Node Kinds + 6 Edge Types + Transitive 2-hop Queries
2. ✨ Merge Strategy: Synonym Match (S2 dict) + Semantic Similarity ≥ 0.82 → Dry-Run Diff Report
3. ✨ Entity Resolution: Person/Fear/Lesson/Milestone/Experience Node Extractors
4. ✨ Edge Proposal Generator: Automatic Proposal + HITL Pending Queue (applied=false)
5. ✨ Graph Retrieval Layer: Rank Context + Similar Nodes (tag co-occurrence + semantic+edge weights)
6. ✨ Knowledge Graph CRUD UI (Confirm / Reject / Edit Edges before applied=true)

---

### ⏳ Phase 4C — Memory Intelligence + Reflection Engine
*Blocking Chain: 4B Delivered → 4C Start*

**Objective:**
- Auto-Merge Duplicate Brain Tags (Periodic Background Reflect)
- Resolve Conflicts: "I am introvert" + "I love hosting" → Auto Contradiction Detector → Propose Resolution
- Evidence Consolidation + Cleanup: Old tagIds → New after Merge; No Dangling References
- Reflection Engine (P4-11): Overnight Background Async: Consolidate → Conflict → Merge → Propose
- Semantic-Similarity-Driven Outdated Tag Replacement (Threshold Tuned)
- Brain Tree Decay Impl (KI-202): Time since last evidence → Exponential Decay Level Curve

**Scope:**
- Add Provider Interfaces: ReflectorEngine, ConflictDetector, EvidenceConsolidator, DecayEngine
- Background Runner: Promise.allSettled / setTimeout 2min idle
- Dry-Run Reports before Commit (applied=true 100% HITL Confirm)

**Deliverables:**
1. ✨ Consolidation Engine: Duplicate Tag Merge + Dangling Reference Fix + Rollback Safe
2. ✨ Conflicts + Contradiction Detector (Evidence-based)
3. ✨ Outdated Tag Replacement Engine (Semantic + Decay Thresholds)
4. ✨ Decay Calculation Engine (Exponential Level Curve)
5. ✨ HITL Reflect UI: Diff Reports + Confirm/Reject for Proposed Changes
6. ✨ Background Reflect Job Runner (P4-11 Promise-based, Non-Blocking)

---

### ⏳ Phase 4D — Identity Engine + Insight Generator + Life Timeline
*Blocking Chain: 4C Delivered → 4D Start*

**Objective:**
- Identity Summary (Single 1-row BIE Identity: Values/Goals/Motivations/Personality/Strengths/Weaknesses/Thinking Pattern)
- Insight Generator (6 Types): Trend / Anomaly / Progress / Milestone / Conflict Alert / Pattern Detection
- Life Timeline Month/Quarter/Year View (Thematic Phases + Milestones + Top Tag Evolution)
- Semantic Identity Similarity Matching (Who Am I Today vs 6 Months Ago)
- Timeline Rebuild Cache Invalidation: Evidence Set contentHash → Rebuild Timeline Cache

**Scope:**
- Provider Interfaces: IdentityEngine, InsightGenerator, TimelineBuilder
- Timeline Cache = `bie_timeline` RoomDB (rebuildable; contentHash invalidation)
- Identity = `bie_identity` singleton row applied=false until Confirm

**Deliverables:**
1. ✨ Identity Summary + Identity Similarity Temporal Compare
2. ✨ Insight Generator 6 Types FIFO 100 (`bie_insights`)
3. ✨ Life Timeline (M/Q/Y View) + Thematic Breakdown
4. ✨ Timeline + Identity Propose (Confirm UI) = applied=false pending queue
5. ✨ Content Hash Cache Invalidation Policy for Timeline

---

### ⏳ Phase 5 — Full Intelligence Platform (UI + Services + BIE Fully Integrated)

**Objective:**
- BIE Full Features 4A-4D Integrated 100% with UI/UX
- Confirm UIs (HITL): Identity/Graph/Insight/Timeline Edits
- Learning Loop Closed: AI Propose → User Confirm → applied=true Persist → Next Retrieval Improved
- Model Context Protocol (MCP) Integration (ถ้าจำเป็น)
- AI Agent Tool Use (Local Browser Tooling: File/Calendar/Email/Task Optional Integrations)

**Scope:**
- UI Overhaul for BIE Integration + HITL Confirm Screens
- Service Worker (KI-302) Background Reflect Periodic
- MCP SDK Optional Local integrations (Calendar/Task/Email)
- Cross-Device Sync Optional (Cloud Service Optional — Room Database sync)

**Deliverables:**
1. ✨ BIE UI Suite: Semantic Search, Graph Explorer, Identity Dashboard, Insights Center, Life Timeline
2. ✨ Confirm + Edit UIs Full Suite (HITL applied=true commits)
3. ✨ Service Worker Background Reflect Jobs (KI-302)
4. ✨ MCP Optional SDK Integration (Local Tools)
5. ✨ Learning Loop Close Verification (End-to-End applied=true)

---

### ⏳ Phase 6 — Mobile + Cross-Platform (Postpone: Future Work)
- React Native / PWA Installable / Capacitor Mobile (ยังไม่ระบุรายละเอียด)
