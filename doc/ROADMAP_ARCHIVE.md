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

**Deliverables & Step Breakdown (S10–S16):**
| Step | ชื่องาน | Scope สั้น | Status |
|------|---------|------------|--------|
| S10 | Type + Schema Contracts Kickoff | KG Node/Edge interfaces, DB row schemas, resolution/proposal stubs | ✅ Complete 2026-08-01 |
| S11 | Entity Resolution & Duplicate Tag Matcher | Synonym Dict + Cosine (≥0.82) matching & dry-run merge diff report | ⏳ In Progress |
| S12 | Entity Extraction Engine | Extract Person, Fear, Lesson, Milestone nodes from Brain Tree/Journal | ⏳ Planned |
| S13 | Graph Edge Engine (6 Types) | 6 relationship types + Auto Edge Proposal Generator (`applied=false`) | ⏳ Planned |
| S14 | Graph Inference Engine (2-Hop Transitive) | Transitive closure 2-hop graph queries ("A causes B, B conflicts C → A indirect conflicts C") | ⏳ Planned |
| S15 | Graph Context Enrichment Hook | Rank context + similar nodes with tag co-occurrence & graph edge weights | ⏳ Planned |
| S16 | Phase 4B Closeout & Regression Gate | Build, Lint, 100% test pass & docs update | ⏳ Planned |

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

**Deliverables & Step Breakdown (S17–S22):**
| Step | ชื่องาน | Scope สั้น | Status |
|------|---------|------------|--------|
| S17 | Reflection Type & Provider Contracts | ReflectorEngine, ConflictDetector, DecayEngine interfaces & stubs | ⏳ Planned |
| S18 | Evidence Consolidation Engine | Clean up dangling references, reassign evidence IDs post tag merge | ⏳ Planned |
| S19 | Contradiction & Conflict Detector | Evidence-based contradiction detection & resolution proposal (`applied=false`) | ⏳ Planned |
| S20 | Brain Tree Decay Calculation Engine | Time since last evidence exponential decay curve calculation | ⏳ Planned |
| S21 | Background Reflect Job Runner (P4-11) | Non-blocking async background reflect job runner (Consolidate → Conflict → Merge) | ⏳ Planned |
| S22 | Phase 4C Closeout & Regression Gate | Build, Lint, 100% test pass & docs update | ⏳ Planned |

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

**Deliverables & Step Breakdown (S23–S29):**
| Step | ชื่องาน | Scope สั้น | Status |
|------|---------|------------|--------|
| S23 | Identity/Insight/Timeline Type Contracts | 8-category Identity, 6-kind Insight, M/Q/Y Timeline interfaces | ⏳ Planned |
| S24 | Identity Engine (Singleton Row) | Dynamic 8-category identity profile & temporal similarity compare | ⏳ Planned |
| S25 | Insight Generator (6 Kinds, FIFO 100) | 6 insight types generator with FIFO 100 queue (`bie_insights`) | ⏳ Planned |
| S26 | Life Timeline Builder (M/Q/Y View) | Rebuildable timeline cache with contentHash invalidation | ⏳ Planned |
| S27 | Proposal Queue Integration | Wire Identity & Insight proposals to HITL pending queue (`applied=false`) | ⏳ Planned |
| S28 | PIE Memory Context Final Wiring | Enrich PIE retrieval context with identity & timeline insights | ⏳ Planned |
| S29 | Phase 4 Master Closeout & Gate | Master BIE regression test, 0 errors build/lint & handoff to Phase 5 | ⏳ Planned |

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

### ⏳ Phase 6 — Personal Evolution Engine (AI ถาม → AI เรียนรู้)
*Blocking Chain: Phase 5 Delivered → Phase 6 Start*

**Objective:**
- เปลี่ยนบทบาท AI จากผู้ตอบคำถามแบบ Reactive เป็นผู้เรียนรู้และเสนอแนะเชิงรุก (Proactive Learning Engine)
- ค้นหาช่องว่างความรู้ (Knowledge Gap Detector) จาก Brain Tree และ Journal เพื่อตั้งคำถามที่ตรงจุด (Adaptive Question Engine)
- พัฒนาระบบ Curiosity Engine เพื่อเลือกจังหวะเวลาและความถี่ในการถามอย่างเหมาะสม ไม่รบกวนผู้ใช้
- คำนวณค่า Confidence Score ของข้อมูลแต่ละ Tag/Evidence และนำมาประเมิน Identity Model เบื้องต้น

**Scope:**
- Provider Interfaces: KnowledgeGapDetector, CuriosityEngine, AdaptiveQuestionEngine, IdentityEvaluator
- Storage Extensions: `bie_curiosity_queue` (คำถามหรือหัวข้อที่ AI สงสัยและเตรียมถาม), `bie_confidence_scores`
- HITL Policy: ทุกคำตอบของผู้ใช้จะถูกเสนอเข้า Pending Queue (`applied=false`) ก่อนให้ผู้ใช้ยืนยันบันทึกเป็น Evidence หรือ Tag ใหม่

**Deliverables:**
1. ✨ Knowledge Gap Detector: ตรวจจับ Tag ที่มี Evidence น้อย หรือขาดข้อมูลมิติสำคัญ (Missing Dimension Context)
2. ✨ Curiosity Engine: อัลกอริทึมเลือกจังหวะการถามแบบพอดี (Question Frequency & Contextual Triggering)
3. ✨ Adaptive Question Engine: สร้างคำถามเชิงสะท้อนคิด (Reflective Prompt Generation) ตาม Role Persona
4. ✨ Identity Model Baseline: การประเมินน้ำหนักความเชื่อมั่นของข้อมูลส่วนบุคคล (Confidence-Weighted Personal Data)
5. ✨ Daily Self Interview UI: หน้าจอสัมภาษณ์/ถามตอบประจำวันที่ AI เป็นผู้ชวนคุยเพื่อเก็บความรู้เพิ่ม

---

### ⏳ Phase 7 — Life Pattern Intelligence (AI เห็น Pattern ชีวิต)
*Blocking Chain: Phase 6 Delivered → Phase 7 Start*

**Objective:**
- ค้นหารูปแบบความสัมพันธ์ระยะยาวและวงจรพฤติกรรมของผู้ใช้ (Pattern Discovery Engine)
- วิเคราะห์ความสัมพันธ์เชิงสาเหตุและผลกระทบ (Cause & Effect Engine) เช่น "การนอนน้อยส่งผลต่อความเครียดในวันถัดไป"
- ค้นหาจุดบอดทางความคิดหรือพฤติกรรม (Blind Spot Detection) ที่ผู้ใช้อาจมองไม่เห็นตัวเอง
- ระบบทำนายแนวโน้มส่วนบุคคล (Personal Prediction Engine) และออกรายงานสรุปการเติบโตประจำเดือน (Monthly Growth Report)

**Scope:**
- Provider Interfaces: PatternDiscoveryEngine, CauseEffectEngine, PersonalPredictor, BlindSpotDetector
- Storage Extensions: `bie_life_patterns`, `bie_cause_effects`, `bie_growth_reports`
- HITL Policy: ข้อสรุป Pattern และ Cause-Effect จะปรากฏเป็น Report ให้ผู้ใช้ review และกด Confirm/Dismiss (`applied=false`)

**Deliverables:**
1. ✨ Pattern Discovery Engine: ตรวจจับวงจรพฤติกรรม (Behavioral Loops & Trend Correlations)
2. ✨ Cause & Effect Engine: วิเคราะห์กราฟความสัมพันธ์เชิงสาเหตุข้ามมิติชีวิต (Cross-Dimension Causality)
3. ✨ Blind Spot Detection System: การเตือนจุดบอดทางความคิด/อารมณ์ที่เกิดซ้ำโดยผู้ใช้ไม่รู้ตัว
4. ✨ Personal Prediction Engine: การคาดการณ์แนวโน้มอารมณ์/พลังงาน/ความสำเร็จของเป้าหมาย
5. ✨ Monthly Growth Report Generator & UI: สรุปพัฒนาการและการเปลี่ยนแปลงของชีวิตประจำเดือน

---

### ⏳ Phase 8 — Second Brain (AI เข้าใจ "ตัวคุณ")
*Blocking Chain: Phase 7 Delivered → Phase 8 Start*

**Objective:**
- หลอมรวม BIE ทุกมิติกลายเป็น Second Brain ที่เข้าใจบริบท บุคลิก ค่านิยม และเป้าหมายชีวิตของผู้ใช้แบบ 360 องศา
- Identity Engine สมบูรณ์แบบ (Dynamic Self Identity & Values Map)
- Life Timeline (M/Q/Y View) แสดงเส้นทางการเติบโตของชีวิตในแต่ละช่วงเวลา
- Personal Insight Engine ที่สามารถให้คำแนะนำที่เหมาะกับสไตล์การคิดและบุคลิกของผู้ใช้เฉพาะบุคคล
- Proactive AI Companion ที่พร้อมช่วยวางแผน คอยเตือน และสะท้อนความคิดเคียงข้างผู้ใช้ตลอดเวลา

**Scope:**
- Full Integration: PIE 9 Layers + Knowledge Graph + Reflection Engine + Pattern Intelligence + Identity Engine
- Storage Extensions: Real-time Identity Cache & Temporal Similarity Matrix
- HITL Policy: คงหลักประกันความถูกต้อง 100% — AI ทำหน้าที่เป็นกระจกเงาและผู้เสนอแนวทาง ผู้ใช้ยังคงเป็นผู้ถือสิทธิ์ตัดสินใจบันทึก/ปรับปรุงข้อมูลชีวิตตนเองเสมอ (`applied=false`)

**Deliverables:**
1. ✨ Dynamic Identity Engine: แผนผังระบุตัวตน ค่านิยม จุดแข็ง และเป้าหมายชีวิตฉบับเต็ม
2. ✨ Life Timeline Dashboard (Month/Quarter/Year): แสดงพัฒนาการของชีวิตและเหตุการณ์สำคัญรายช่วงเวลา
3. ✨ Personal Insight Engine V2: ระบบแจ้งเตือนอินไซต์เชิงลึกที่ปรับแต่งตาม Persona และลักษณะผู้ใช้
4. ✨ Proactive AI Orchestrator: ระบบ AI เสนอแนะการวางแผนชีวิตล่วงหน้าและการบริหารพลังงานประจำวัน
5. ✨ Second Brain Master Dashboard: หน้าจอศูนย์กลางควบคุมและสำรวจสติปัญญาชีวิตทั้งหมด

---

### ⏳ Phase 9 — Living Companion AI (Vision Declaration)
*Future Vision: ยังไม่แตก Deliverables จนกว่า Phase 8 จะเสร็จสิ้น*
- AI Companion ที่เรียนรู้ ถอดแบบความคิด และเติบโตไปพร้อมกับผู้ใช้ตลอดช่วงชีวิต (Lifelong Co-evolution)

---

### ⏳ Postponed / Future Extensions
- **Mobile & Cross-Platform Engine**: React Native / PWA Installable / Capacitor Mobile (พิจารณาอีกครั้งเมื่อ Core Intelligence สมบูรณ์)

