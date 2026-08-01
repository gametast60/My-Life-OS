# ROADMAP_ARCHIVE.md — Closed/Delivered Phases + Future Planned Detail

> ไฟล์นี้เก็บ:
> 1. **Past Delivered Phases Detail**: Phase 1, Phase 2, Phase 3 Full Detail (Objective/Completed/Remaining/Next Phase Text เต็ม)
> 2. **Future Planned Phases Detail**: Phase 4B, 4C, 4D, Phase 5 Full Detail (Objective/Scope/Deliverables Full Text)
> 3. **Intelligence Evolution Track Detail**: Phase 6 (Personal Evolution Engine), Phase 7 (Life Pattern Intelligence), Phase 8 (Second Brain) Full Detail (Objective/Core Components/Deliverables Full Text)
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

## 🚀 Archived: Intelligence Evolution Track Detail (Phase 6/7/8)

> Direction Shift หลัง Phase 5: จากพัฒนา "ฟีเจอร์" → พัฒนา "สติปัญญา (Intelligence)" ของ AI
> Blocking Chain: 5 (Full Intel Platform) → 6 → 7 → 8

---

### ⏳ Phase 6 — Personal Evolution Engine
*Blocking Chain: Phase 5 Delivered → Phase 6 Start*

**Objective:**
- เปลี่ยนรูปแบบจาก "User ถาม → AI ตอบ" เป็น "AI ถาม → AI เรียนรู้ → AI เข้าใจเจ้าของ"
- AI เริ่มเก็บข้อมูลเจ้าของอย่างเป็นระบบ ผ่านคำถามที่เลือกเอง ไม่ใช่สุ่ม
- ทุก Insight ต้องมี Evidence รองรับ ไม่ใช่การเดา (สอดคล้องหลัก HITL applied=false เดิม)

**Core Components:**
1. 🗣️ **Daily Self Interview**: AI ถาม 1-3 คำถาม/วัน (ความภูมิใจ, ความเสียใจ, บทเรียน, อารมณ์, ความเครียด, บุคคลที่มีอิทธิพล, พลังงาน, การตัดสินใจผิดพลาด)
2. 📊 **Knowledge Gap Detector**: Progress Bar ต่อ Dimension (Identity/Goal/Career/Relationship/Fear ฯลฯ) แสดงว่ายังขาดข้อมูลด้านไหน
3. 🔍 **Curiosity Engine**: จำเหตุการณ์ที่ผู้ใช้เล่าไว้ (เช่น "ทะเลาะกับหัวหน้า") แล้วย้อนถามติดตามผลในภายหลัง (เช่น อีก 3 วัน) เพื่อจำลองความอยากรู้แบบมนุษย์
4. 🧬 **Identity Model**: สร้างโปรไฟล์จาก Evidence ครอบคลุม Core Values, Beliefs, Thinking Style, Decision Style, Stress Pattern, Motivation, Love Language, Communication Style, Learning Style, Risk Tolerance, Money Mindset, Leadership Style — ใช้ศัพท์ Identity ให้สอดคล้องกับ Phase 4D (Identity Singleton) ทั้งโปรเจกต์
5. 📈 **Confidence Score**: ทุกข้อสรุปเกี่ยวกับผู้ใช้ต้องมี Confidence % + Evidence Count + Last Updated + Contradiction Flag + Source อ้างอิง
6. 🧠 **Adaptive Question Engine** *(แกนกลางของ Phase 6)*: ตัวตัดสินใจว่า "วันนี้ AI ควรถามอะไร" โดยรวมสัญญาณจาก Knowledge Gap + Identity Confidence + Timeline + Recent Events + Reflection + Pattern (Phase 7) แล้วคำนวณว่าคำถามไหนจะเพิ่มความเข้าใจเจ้าของได้มากที่สุด — ไม่สุ่มถาม และไม่ถามซ้ำสิ่งที่ Confidence สูงอยู่แล้ว ทำให้ Daily Self Interview / Curiosity Engine ไม่ทำงานแยกกันแบบสุ่ม แต่ถูกสั่งงานจากเอนจินเดียวกัน

**Scope:**
- Provider Interfaces: SelfInterviewEngine, KnowledgeGapDetector, CuriosityEngine, IdentityModelBuilder, AdaptiveQuestionEngine
- Storage: คำถาม/คำตอบ Interview History, Identity Model Fields พร้อม Confidence Metadata, Question Selection Log (สำหรับ Adaptive Question Engine ใช้อ้างอิงว่าเคยถามอะไรไปแล้ว)
- ต้องเชื่อมกับ BIE (Phase 4) เพื่อดึง/บันทึก Evidence ผ่าน Repository SSOT เดิม
- Adaptive Question Engine เป็น Orchestrator เรียกใช้ Knowledge Gap Detector + Curiosity Engine + Identity Confidence Score เป็น Input ก่อนตัดสินใจเลือกคำถาม

**Deliverables:**
1. ✨ Daily Self Interview Engine + Question Bank (Gap-Aware, Non-Random)
2. ✨ Knowledge Gap Dashboard (Progress Bar ต่อ Dimension)
3. ✨ Curiosity Engine: Follow-up Question Scheduler
4. ✨ Identity Model Schema (12 Dimensions) + Builder from Evidence
5. ✨ Confidence Score System (Confidence / Evidence Count / Last Updated / Contradiction / Source)
6. ✨ Adaptive Question Engine: Signal Aggregator + Question Ranking/Selection Logic (Core Orchestrator ของ Phase 6)

---

### ⏳ Phase 7 — Life Pattern Intelligence
*Blocking Chain: Phase 6 Delivered → Phase 7 Start*

**Objective:**
- เมื่อ AI มีข้อมูลมากพอจาก Phase 6 ให้เริ่มค้นหา "Pattern" ของชีวิตผู้ใช้
- เชื่อมโยงเหตุและผล (Cause & Effect) ระหว่างพฤติกรรม/สภาวะต่าง ๆ
- เริ่มทำนายพฤติกรรม/ผลลัพธ์ล่วงหน้า และชี้ Blind Spot ที่ผู้ใช้อาจไม่รู้ตัว

**Core Components:**
1. 🔁 **Pattern Discovery Engine**: ค้นหา Pattern ที่เกิดซ้ำเองจากทุกแหล่งข้อมูล ไม่ใช่แค่ Habit — ครอบคลุม Journal, Goal, Reminder, Reflection, Check-in, AI Chat, Brain Tree (เช่น นอน<6ชม. → อารมณ์เสีย → กินของหวาน → ไม่ออกกำลังกาย)
2. ⚙️ **Cause & Effect Engine**: สร้างสายโซ่เหตุ-ผล A→B→C จาก Evidence (เช่น ออกกำลังกาย → เขียน Journal → คิดบวก → ตัดสินใจดีขึ้น)
3. 🔮 **Personal Prediction**: ทำนายผลลัพธ์ล่วงหน้าจาก Pattern ที่เจอ (เช่น "ถ้าไม่พักวันนี้ พรุ่งนี้มีโอกาสสูงที่จะไม่มีสมาธิ")
4. 🕳️ **Blind Spot Detection**: ชี้จุดที่ผู้ใช้มักหลีกเลี่ยงโดยไม่รู้ตัว (เช่น หลีกเลี่ยงคุยเรื่องการเงินเวลาเครียดสูง)
5. 📅 **Growth Report**: สรุปรายเดือน — สิ่งที่ดีขึ้น, นิสัยใหม่, Mindset ใหม่, Skill ใหม่, Identity ใหม่, Goal Progress

**Scope:**
- Provider Interfaces: PatternDiscoveryEngine, CauseEffectEngine, PredictionEngine, BlindSpotDetector, GrowthReportGenerator
- Pattern Discovery Engine ต้องอ่านข้ามหลาย Source (Journal/Goal/Reminder/Reflection/Check-in/AI Chat/Brain Tree) ไม่จำกัดแค่ Habit/Behavior Log
- ต้องอาศัย Identity Model + Confidence Score จาก Phase 6 เป็น Input หลัก
- Background/Periodic Analysis คล้าย Reflection Engine (Phase 4C) แต่ทำงานระดับ Pattern ไม่ใช่ระดับ Tag

**Deliverables:**
1. ✨ Pattern Discovery Engine (Cross-Source Repeated Pattern Detection)
2. ✨ Cause & Effect Chain Builder (A→B→C Evidence-based)
3. ✨ Personal Prediction Engine (Confidence-scored Forecasts)
4. ✨ Blind Spot Detector + Alert
5. ✨ Monthly Growth Report Generator (HITL Review before Save)

---

### ⏳ Phase 8 — Second Brain
*Blocking Chain: Phase 7 Delivered → Phase 8 Start*

**Objective:**
- เป้าหมายสูงสุดของสาย Intelligence Evolution: AI ไม่ใช่แค่ "จำได้" แต่ "เข้าใจตัวคุณ" พร้อมหลักฐานอ้างอิงได้ทุกข้อสรุป
- รวม Identity, Timeline, Insight และความสามารถ Proactive เข้าด้วยกันเป็นระบบเดียว

**Core Components:**
1. 🪪 **Identity Engine**: ตอบคำถาม "คุณเป็นคนแบบไหน" ได้ พร้อมอ้าง Evidence ประกอบ (ต่อยอดจาก Phase 4D Identity Singleton)
2. 🗓️ **Life Timeline**: ย้อนดูเหตุการณ์ชีวิตแบบปีต่อปี (เช่น 2026: TOPIK, เปลี่ยนงาน, เริ่มลงทุน, เริ่มออกกำลังกาย → 2027: เริ่มเทรด → 2028: ลาออกจากงาน)
3. 📖 **Personal Insight Engine**: สรุปบทเรียนชีวิตจาก Pattern สะสม (เช่น "ทุกครั้งที่เลือกพัฒนาตัวเองระยะยาว มักได้ผลตอบแทนคุ้มค่ากว่าทางลัด") — ใช้ศัพท์ Insight ให้สอดคล้องกับ Insight Generator เดิมใน Phase 4D; **Wisdom คือผลลัพธ์ระดับสูงที่ Engine นี้สร้างขึ้น ไม่ใช่ชื่อโมดูล**
4. 🔔 **Proactive AI**: AI เริ่มบทสนทนาเอง — เตือนก่อนหมดไฟ, เตือนก่อนเครียด, เสนอเป้าหมายใหม่, แนะนำหนังสือ/คอร์ส, เตือนให้พัก, เตือนให้โทรหาคนสำคัญ, เตือนให้กลับไปทำเป้าหมายที่ละเลย

**Scope:**
- Provider Interfaces: IdentityEngineV2 (ต่อยอด 4D), TimelineBuilderV2, PersonalInsightEngine, ProactiveNotifier
- ต้องรวม Output จาก Phase 6 (Identity Model) + Phase 7 (Pattern/Prediction) เป็น Input
- Proactive AI ต้องผ่าน HITL เช่นเดิม — เสนอ ไม่ตัดสินใจแทนผู้ใช้

**Deliverables:**
1. ✨ Identity Engine V2 (Evidence-backed "Who Am I" Answering)
2. ✨ Life Timeline (Year-over-Year View, Milestone Linked)
3. ✨ Personal Insight Engine (Life Lesson / Wisdom Summarizer from Pattern History)
4. ✨ Proactive AI Notifier (Energy/Stress/Goal/Relationship Reminders)
5. ✨ Second Brain Integration Layer เชื่อม Identity + Timeline + Insight + Proactive เข้าด้วยกัน

---

### 🌟 Phase 9 — Living Companion AI (Vision Only — Not Scoped)
*ไม่ blocking กับ Phase 8, ไม่แตก Deliverables — ประกาศไว้เพื่อให้รู้ปลายทางของโปรเจกต์*

> นี่คือ Vision ปลายทาง ไม่ใช่ Phase ที่พร้อมพัฒนา — จะแตก Objective/Scope/Deliverables อย่างเป็นทางการเมื่อ Phase 8 ใกล้เสร็จ

**Vision:**
AI ทำหน้าที่เหมือน "คู่คิดตลอดชีวิต" มากกว่าแชตบอต ครอบคลุม:
- **Daily Conversation** — เริ่มบทสนทนาเองเมื่อเหมาะสม
- **Long-term Companion** — อยู่เคียงข้างต่อเนื่องหลายปี ไม่ใช่แค่ session ต่อ session
- **Life Advisor** — ช่วยวางแผนและติดตามเป้าหมายระยะยาว
- **Decision Support** — ให้คำแนะนำโดยอ้างอิงประสบการณ์และค่านิยมของผู้ใช้เอง
- **Memory Keeper** — จำเหตุการณ์สำคัญและเชื่อมโยงอดีตกับปัจจุบัน
- **Emotional Intelligence** — สังเกตการเปลี่ยนแปลงของอารมณ์และเสนอการดูแลตัวเอง
- **Continuous Growth** — ช่วยให้ผู้ใช้เห็นพัฒนาการของชีวิตเป็นปี ๆ ไปพร้อมกับ AI

**หลักการที่ยึดต่อเนื่องแม้ถึง Phase 9:** AI มีหน้าที่เรียนรู้และเสนอข้อมูลพร้อมหลักฐาน (Evidence) — การตัดสินใจและยืนยันความรู้ยังเป็นของผู้ใช้เสมอ (Human-in-the-loop)

---

> **Mobile + Cross-Platform** (React Native / PWA / Capacitor) ถูกนำออกจาก Roadmap หลักชั่วคราว (เดิมเคยเป็น Phase 6) — ยังไม่ระบุ Phase ใหม่ รอความชัดเจนก่อนเพิ่มกลับเข้ามา
