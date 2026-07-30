# Decisions — My Life OS

> Architecture Decision Record (ADR) แบบย่อ เก็บเหตุผลของการตัดสินใจเชิงสถาปัตยกรรม
> 
> Format: `วันที่ — หัวข้อการตัดสินใจ` → `Context` → `Decision` → `Rationale` → `Trade-offs`

---

## 2026-07-30 — PIE Architecture 7 Layers + Repository Pattern

**Context:** Phase 1 เริ่มต้นต้องการ AI System ที่ขยายได้ แยก Layer ชัดเจน ไม่ผูกกับ Provider ใด Provider หนึ่ง

**Decision:** ใช้ PIE (Personal Intelligence Engine) Pipeline 9 Stages + `PipelineContext` Unified Context Object แบบ Functional (`ctx in → ctx out`) แยก `BrainRepository` เป็น Interface + `RoomBrainRepository` Implementation

**Rationale:**
- Layer Isolation: Intent ไม่เรียก AI, Prompt ไม่ดึง Memory, Provider เป็น Pure I/O — เปลี่ยนแปลงได้โดยไม่กระทบกัน
- Functional Pipeline: ไม่มี Side Effect ใน Layer ตัวเอง → Test/Reason ง่าย
- Repository Pattern: อนุญาตให้ LocalStorage, RoomDatabase หรือ API ได้เหมือนกัน

**Trade-offs:**
- จำนวนไฟล์เพิ่มขึ้น (9 layers + roles + repository) ต้องมีเอกสารอธิบายเสมอ
- Request Context Overhead: ทุก Layer รับ Context Object เต็มแม้จะใช้แค่บาง Field

---

## 2026-07-30 — Brain Tree Engine V1: Type → Dimension → Tag → Evidence

**Context:** Phase 1-2 ต้องการ Knowledge Structure ที่ Hierarchical รองรับ RPG Growth และ Multi-label Evidence (หนึ่ง Activity เชื่อมหลาย Tag ได้)

**Decision:** 4-Chain Hierarchy: `BrainTreeType` (Goal/Habit...) → `BrainTreeDimension` (Finance/Health...) → `BrainTreeTag` (React/DCA...) → `BrainEvidence` (Journal/Habit Completion...) + RPG Exponential Growth `level = floor(sqrt(growthScore / constant))`

**Rationale:**
- Hierarchy 4 ชั้นนี้พอดีกับโครงสร้างความคิดมนุษย์ (Category → Domain → Concept → Evidence)
- RPG Growth ให้ผลตอบแทนการเรียนรู้แบบ Visual & Satisfying
- Multi-label Evidence (brainTreeTagIds[]) สะท้อนความเป็นจริง: หนึ่ง Journal อาจเกี่ยวกับ "DCA" และ "Discipline" พร้อมกัน

**Trade-offs:**
- ไม่มี Semantic/Graph ความสัมพันธ์ระหว่าง Tag (Tag-to-Tag) → Phase 4 Knowledge Graph จะแก้
- ไม่มี Embedding/Vector → Phase 4A Semantic Retrieval จะแก้

---

## 2026-07-30 — Hard Constraint: Human-in-the-loop applied=false 100%

**Context:** Phase 2 Learning Engine จะเขียนลง Brain Tree หรือไม่? มีความเสี่ยงว่า AI Suggestion ไม่แม่น → ปนเปื้อน Knowledge ของผู้ใช้

**Decision:** ทุก Learning Item ที่ AI สร้าง → `applied=false` เสมอ; เข้า Pending Queue (`localStorage: mylifeos_pie_pie_pending_learning_v1`) รอ User Confirm ก่อนเขียน Brain Tree จริง

**Rationale:**
- "AI มีหน้าที่เสนอ; ผู้ใช้มีหน้าที่ตัดสินใจ" — Core Philosophy
- ไม่มี False Positive Persist ลง Knowledge Base
- Zero UX/UI Impact: เก็บใน localStorage ชั่วคราว; UI จะมาในภายหลัง (Pending Confirm UI)

**Trade-offs:**
- Learning Cycle ไม่ Closed Loop (ยังไม่มี UI Confirm) → Pending Learning อาจสะสมไม่ถูกประมวลผล
- applied field เป็น `false` 100% ตอนนี้ = field นี้เป็น dead state จนกว่าจะมี Confirm UI

---

## 2026-07-30 — Phase 3: MODE_PROMPTS → 9 Native Roles + LEGACY_MODE_CONFIG

**Context:** Phase 3 Cleanup: `aiService.ts` มี `MODE_PROMPTS` (7 Legacy Prompts) ซ้ำกับ 9 Native Role Persona 5/7 อัน ทำให้ Prompt กระจัดกระจาย

**Decision:** ลบ `MODE_PROMPTS` Record ทั้งหมด; ใช้ `LEGACY_MODE_CONFIG` แทน โดยให้ 5 Legacy Modes (Coach, Therapist, Decision, Reflection, Chat) ใช้ Native Role Persona โดยตรง; เหลือ 2 Viewpoint Special (Future Self, Secretary) ใช้ `customSystemPrompt` inline

**Rationale:**
- Prompt Organization: All Prompts ใน `src/pie/roles/*.ts` Single Source of Truth
- aiService เป็น Facade เท่านั้น (ลดจาก 630 → 550 lines)
- Backward Compatibility: Signature ไม่เปลี่ยน; `MODE_TO_ROLE` ยังคง export

**Trade-offs:**
- 2 Special Cases (Future Self, Secretary) ยังมี System Prompt ใน aiService (แต่เป็น viewpoint variant ไม่ใช่ persona core → ยอมรับได้)

---

## 2026-07-30 — RoomBrainRepository เป็น Single Source of Truth (SSOT)

**Context:** Phase 3 พบ DRY Violation: `memoryRetrieval.ts` และ `RoomBrainRepository.ts` มี `convertBrainCardsToSources` ซ้ำกัน 2 ที่ → Logic อาจ diverge

**Decision:** ลบทุก Conversion Logic ออกจาก `memoryRetrieval.ts` (ลดจาก 272 → 67 บรรทัด) ทุก Layer ห้ามอ่าน DB เอง; ต้องผ่าน `BrainRepository.getRelevantMemory()` + เพิ่ม `RequestContextOverride` Interface สำหรับ Backward Compatibility เมื่อ Views ส่ง brainCards/recentJournals เอง

**Rationale:**
- Single Source of Truth: Conversion Logic ที่เดียว → Behavior Consistency
- Future Proof: ถ้าจะเพิ่ม Semantic Retrieval (Phase 4A) แค่แก้ที่ RoomBrainRepository เดียว
- Zero UX/UI Change: Views ยังส่ง extraContext.brainCards ได้เหมือนเดิม

**Trade-offs:**
- Repository Responsibility เถี่ยวกว่าเดิม (Conversion + Filtering + Query)
- `RequestContextOverride` เป็น "leaky abstraction" เล็กน้อย (Views บอก DB ได้ว่าจะให้อ่านอะไร) — แต่จำเป็นสำหรับ Backward Compat

---

# ⏳ PROPOSED — รอการยืนยันจาก User ก่อนลงมือ

---

## 2026-07-30 (✅ CONFIRMED by User) — Phase 4A Embedding Strategy

**Context:** Phase 4A Semantic Retrieval ต้องการ Text Embedding สำหรับ Semantic Similarity Search มี 3 ทางเลือก:

- A) Provider-based ผ่าน @google/genai Embedding API (ควบคุมง่าย แต่ผูกกับ Gemini)
- B) Local Zero-Dep TF-IDF + BM25 (Offline แต่ Synonym/Semantic แย่)
- C) Hybrid A+B: Priority A ถ้ามี Internet/Quota → Fallback B ถ้า Offline (Safe ที่สุด)

**✅ CONFIRMED Decision:** **C) Hybrid Embedding Strategy แต่ Provider-Agnostic ผ่าน Interface**

### Architecture Spec (User-Mandated):

```
┌───────────────────────────────────────────────────────────────┐
│  EmbeddingProvider (INTERFACE) — src/pie/bie/providers/types  │
│                                                               │
│  + embed(text: string): Promise<{                            │
│       embedding: number[],                                    │
│       method: string,                                         │
│       model: string,                                          │
│       dimensions: number                                      │
│    }>                                                          │
│  + batchEmbed(texts: string[]): Promise<{embedding[]}>        │
│  + isAvailable(): boolean                                     │
└──────┬────────────────────────────────────────────┬───────────┘
       │                                            │
       ▼                                            ▼
┌──────────────────────┐              ┌──────────────────────────┐
│ GeminiEmbeddingProvider │          │ LocalBM25EmbeddingProvider │
│ (Default Impl)          │          │ (Fallback — Offline)       │
│ + Uses @google/genai    │          │ + TF-IDF token weights     │
│   via Provider Router   │          │ + BM25 term frequency      │
│ + models/text-embedding-│          │ + Thai/English Synonym Dict│
│   004 (768-dim)         │          │ + 384-dim sparse vector    │
└──────────────────────┘              └──────────────────────────┘
```

**Rationale (User Confirmed + Staff Augmented):**
- **Provider-Agnostic:** BIE Business Logic (semanticService, vectorIndex) จะ import `EmbeddingProvider` interface เท่านั้น — NEVER import Gemini, OpenAI หรือ Provider อื่นโดยตรง
- **Future Swappable:** อนาคตเปลี่ยนเป็น OpenAI Embedding, VoyageAI, Nomic, Ollama, Local WASM Model → **เพียงสร้าง Provider ใหม่ + register** — ไม่ต้องแก้ Business Logic เลย
- **Hybrid Fallback:** ถ้า API ไม่ตอบ / Quota เต็ม / ไม่มี Internet → Auto switch ไป Local BM25 + Synonym Dictionary; Retrieval ยังทำงานได้ (quality ลดเล็กน้อย แต่ไม่ error)
- **Cache First:** ทุก Embedding result จะเก็บ contentHash (SHA-1 ของ text) → ห้าม regenerate ถ้า text ไม่เปลี่ยน; Cache = RoomDatabase table `bie_embeddings` (Persistent Cache)

**Trade-offs & Responsibilities:**
- Code path ทุก Operation ต้อง handle Async/Promise (เพราะ Embedding API = Network I/O — Sync Fallback จะต้อง wrap เป็น Promise ด้วย)
- Vector Dimensions อาจจะไม่เท่ากันระหว่าง Providers (768 vs 384) → `vectorIndex.ts` ต้อง dimension-agnostic; normalize vectors ก่อน cosine sim
- Gemini Embedding Quota: ~1M tokens/month free tier (พอสำหรับส่วนตัวมากๆ) → ถ้า exceed auto fallback โดยไม่ crash

---

## 2026-07-30 (✅ CONFIRMED by User) — BIE Storage Location (RoomDatabase vs localStorage)

**Context:** Phase 4B-4D ต้องการ Storage สำหรับ: Embeddings, Knowledge Graph Edges, Identity, Insights, Timeline — 2 ทางเลือก: localStorage แยก Keys vs Extend RoomDatabase Tables

**✅ CONFIRMED Decision:** **B) RoomDatabase เป็น Storage หลัก; localStorage = Cache ชั่วคราวเท่านั้น**

### Storage Architecture (User-Mandated):

```
RoomDatabase (Storage Backend หลัก BIE)
│
├── bie_embeddings (Persistent Embedding Cache Table)
│   ├─ id (nodeId: brainTreeTagId / customNodeId)
│   ├─ contentHash: string  ← NEVER regenerate ถ้า hash เดิม
│   ├─ embedding: number[] (JSON serialized)
│   ├─ dimensions: number (768 / 384)
│   ├─ method: "gemini" | "local_bm25" | "openai" | ...
│   ├─ updatedAt: number
│
├── bie_graph_nodes (Knowledge Graph)
│   ├─ id: string (= brainTreeTagId / bie-custom-xxx)
│   ├─ kind: "tag" | "person" | "fear" | "lesson" | "experience" | "milestone"
│   ├─ label: string
│   ├─ description?: string
│   ├─ coreType?: BrainType | "Fear" | "Lesson" | "Experience"
│   ├─ dimension?: LifeDimension
│   ├─ createdAt, updatedAt
│
├── bie_graph_edges (Knowledge Graph Relationships)
│   ├─ id: string
│   ├─ fromId, toId: string (FK → bie_graph_nodes.id)
│   ├─ type: "supports" | "conflicts" | "causes" | "derived_from" | "related" | "opposes"
│   ├─ confidence: number (0-1)
│   ├─ evidenceIds: string[] (JSON: BrainEvidence references)
│   ├─ auto: boolean (AI-detected vs User-confirmed)
│   ├─ applied: boolean (🔒 = false until User Confirm; Human-in-the-loop)
│   ├─ createdAt
│
├── bie_identity (Identity Summary Aggregate)
│   ├─ id: "singleton" (1 row only)
│   ├─ coreValues, goals, motivations: JSON (Top-N + Scores)
│   ├─ personality, strengths, weaknesses: JSON (Categories + Evidences)
│   ├─ thinkingPattern: JSON
│   ├─ generatedAt: number
│   ├─ applied: boolean (🔒 = false until User Confirm)
│
├── bie_insights (Generated Insights FIFO 100)
│   ├─ id
│   ├─ kind: "trend" | "anomaly" | "progress" | "milestone" | "conflict_alert" | "pattern"
│   ├─ title: string (ไทย)
│   ├─ description: string (ไทย)
│   ├─ severity: "info" | "warning" | "positive" | "critical"
│   ├─ dataContext: JSON (query window, values, metrics)
│   ├─ confidence: number (0-1)
│   ├─ generatedAt: number
│   ├─ applied: boolean (🔒 = false until User Confirm)
│
├── bie_timeline (Life Timeline Cache)
│   ├─ periodKey: "2026-Q2" | "2026-05"
│   ├─ periodKind: "month" | "quarter" | "year"
│   ├─ themeBreakdown: JSON (dimId → percent + tag ids)
│   ├─ milestones: JSON (milestone list)
│   ├─ generatedAt
│   └─ contentHash (for invalidation เมื่อมี Evidence ใหม่)
│
└── bie_pending_queue (BIE Pending Items = HITL Applied=False Queue)
    ├─ id
    ├─ kind: "graph_edge" | "graph_merge" | "identity_update" | "insight" | "tag_confidence_boost"
    ├─ payload: JSON
    ├─ reason: string (AI-generated explanation for User)
    ├─ confidence: number (0-1)
    ├─ createdAt
    └─ (no applied field; in Pending Queue = applied false by definition)
```

**LocalStorage Scope (Cache ชั่วคราวเท่านั้น):**
- ใช้ได้เฉพาะ: `bie_runtime_cache_v1` (In-memory Cache ระหว่าง App Session + Hot Paths เช่น last N queries)
- ❌ ห้ามเก็บข้อมูลถาวรลง localStorage (embeddings, graph, identity, insights → **ต้องอยู่ RoomDatabase ทั้งหมด**)
- Runtime Cache TTL: 30 นาที; ไม่ Sync กับ RoomDatabase ถ้าอัพเดตแล้ว (หากเครียด)

**Rationale (User Confirmed):**
- **Single Storage Backend:** All Data ใน RoomDatabase เดียวกับ Brain Tree → Backup/Restore แค่ Export หนึ่งครั้ง ได้ทั้งหมด (Snapshot/Export ง่าย)
- **Schema Migrations:** Table structure เป็นทางการ; มี get/set methods บน RoomDatabase class; ไม่ใช่ raw string JSON (key-value ใน localStorage ไม่มี Schema contract)
- **Transactional Potential:** อนาคตต้องการ Update Graph + Embedding + Identity ใน Transaction เดียว → สามารถ build ได้บน RoomDatabase
- **Isolation:** ทุก Table มี prefix `bie_` (namespace) → Backup/wipe BIE ทั้งหมดได้โดยไม่กระทบ Brain Tree Tables (เช่น brain_tree_types, brain_tree_dimensions)

---

## 2026-07-30 (✅ CONFIRMED by User) — Phase 4 Execution Order & Engineering Style

**Context:** Phase 4 แบ่ง 4A-4D; จะเริ่มไหนก่อน? และ Style ของการพัฒนา "ทำ Feature ให้ได้ก่อน" หรือ "สร้าง Infra ให้แข็งแรงก่อน"?

**✅ CONFIRMED Decision:** **A) Phase 4A First + Infrastructure-First**

### Sub-Phase Order (Blocking Chain):
```
4A (Semantic Retrieval + Hybrid Search)
  ↓ (4B ใช้ Semantic Matching จาก 4A เพื่อหา Similar Nodes → สร้าง Graph Edges)
4B (Knowledge Graph + Relationship Engine)
  ↓ (4C ใช้ Graph + Semantic สำหรับ Consolidation / Conflict Detection)
4C (Memory Intelligence + Reflection Engine)
  ↓ (4D Aggregate ผลจากทุกอย่างข้างต้น)
4D (Identity Engine + Insight Generator + Life Timeline)
```

### Engineering Style: Infrastructure-First (Not Feature-First)

สำหรับทุก Sub-phase: **วาง Foundation ก่อน 100% ก่อนจะทำ Feature Business Logic**

| Step | 4A Infrastructure First Example | Priority |
|------|---------------------------------|----------|
| 1. Define Interfaces First | `EmbeddingProvider`, `BrainIntelligenceRepository`, `VectorIndex`, `HybridScorer` Interfaces + Type Contracts | P0 |
| 2. Default Implementations | `GeminiEmbeddingProvider`, `LocalBM25EmbeddingProvider`, `RoomBrainIntelligenceRepository` | P0 |
| 3. Test Wrapper Utilities | `contentHash()`, `normalizeVector()`, `cosineSimilarity()`, `levenshteinDistance()` | P0 |
| 4. Hook into PIE Layer (preserve signature) | Extend `RetrievalSource` with fields: `semanticScore`, `tagMatchScore`, `graphScore` (NO existing field changes) | P1 |
| 5. Wire Hook in `runMemoryRetrieval()` + `rankContext()` | Call BIE Service ถ้ามี; ถ้า BIE Disabled → Behavior เป็น Keyword ปกติ 100% (Zero Impact Default) | P1 |
| 6. Feature Logic (Hybrid Score Formula Tuning) | 6-factor Tuning, Weight Calibration | P2 |
| 7. Regression Gate | Build + Lint + 7 AI Features + PIE Stage Integrity | P3 (Blocking Gate) |

**Rationale (User Confirmed):**
- **5+ Year Project:** Infra Foundation ถูกตั้งแต่แรก → ลด Maintenance Burden อย่างมากใน Phase 5, Phase 6 ต่อไป
- **Zero Risk:** หาก Sub-phase ใดล้มเหลวในระหว่างพัฒนา — ได้ Interface + Infrastructure ที่พร้อมใช้งานเสมอ; ไม่เกิด Dead Code (เพราะ Interface ใช้แทน Concrete)
- **Parallelization:** ถ้าต้องการเร่งระหว่าง 4A infra เสร็จ → 4B Dev สามารถเริ่ม Design Graph Interfaces ได้เลย โดยไม่ต้องรอ 4A Business Logic Tuning
- **Backward Safety:** Default เมื่อ BIE Component ไหนยังไม่สร้าง → Behavior เป็น Pre-Phase-4 100%; ไม่มี Regressions ใน UI/Feature ใดๆ

### Additional Mandatory Constraints (User Specified)

| # | Rule (Must Be Enforced For All Phase 4 Work) | How Enforced |
|---|-----------------------------------------------|--------------|
| **P4-8** | **Backward Compatibility:** ห้ามแก้ Existing API Signatures (aiService, PipelineContext existing fields, PIPELINE_STAGES, BrainRepository interface methods) | tsc --noEmit + interface inheritance; all fields = additive only (new fields optional) |
| **P4-9** | **Clean Architecture:** All new components depend on INTERFACES, NOT concrete implementations | Code Review: every service constructor accepts Provider Interface (e.g. `EmbeddingProvider`, not `GeminiEmbeddingProvider`) |
| **P4-10** | **Performance — Cache:** Embeddings จะไม่ถูก regenerate ถ้า contentHash ไม่เปลี่ยน; Cache บน RoomDatabase table | `contentHash(text)` + Lookup ก่อน call Embed API |
| **P4-11** | **Performance — Async Heavy:** Reflection, Graph Rebuild, Insight Gen, Consolidation = Run Async/Background (not block User Chat flow) | BIE Background Runner = `Promise.then().catch()` โดยไม่ await; User Response กลับไปก่อน |
| **P4-12** | **Human-in-the-loop 100%:** AI ไม่เคยแก้ Brain Tree หรือ bie_* Tables โดยอัตโนมัติ; ทุก structural change = `bie_pending_queue` applied=false | Code: ทุก write operation บน structural tables = บันทึก Pending Queue เท่านั้น; NO direct write |
| **P4-13** | **Preserve Current HITL Flow:** PIE Learning Engine (`applied=false` + `mylifeos_pie_pending_learning_v1`) ยังคงทำงานเหมือนเดิม; BIE Queue = คู่ขนานสำหรับ BIE-specific Items | Two separate Pending Queues (PIE core vs BIE sidecar) |
| **P4-14** | **Future-Proof Disable Switch:** ทุก BIE Component มี Disable flag; User สามารถ Disable BIE ทั้งหมดได้ → Behavior กลับไป Pre-4-Phase 100% (Keyword-only + Hierarchical Brain Tree) | `PipelineOptions: {bieEnabled?: boolean}` default true; แต่ `bieEnabled=false` → skip BIE hooks ทั้งหมด |

---

คำตัดสินใจ PROPOSED ทั้ง 3 ข้อ ได้รับการ **CONFIRMED** แล้วจาก User ใน conversation นี้ (2026-07-30) → Ready สำหรับลงมือ Phase 4A Implementation

