# AI_ARCHITECTURE_ARCHIVE.md — Archived Step-by-Step Rationale

> ไฟล์นี้เก็บ **Implementation Rationale / Step-by-step Flow Diagrams / Component Detail Tables** ของแต่ละ Sub-step ที่ **ปิดจบแล้ว** (Closed / Delivered)
>
> ไฟล์หลัก Current Architecture State อยู่ที่ `/doc/AI_ARCHITECTURE.md` (เก็บเฉพาะสถาปัตยกรรมปัจจุบัน + Active Hard Constraints — ไม่เก็บประวัติ)
>
> **เมื่อไหร่ต้องเปิดไฟล์นี้:** เมื่อต้องดู "ว่าทำไมถึงตัดสินใจแบบนั้น", "spec implementation รายละเอียดของ step เก่าๆ" เมื่อ debug หรือ refactor backlog

---

## Phase 4 — Brain Intelligence Engine (BIE) Components Archive

### 🆕 Phase 4A S1 — Type & Interface Contracts (DELIVERED 2026-07-30)

> S1 = Foundation Only. **No Business Logic, No Queries, No Migration.**
> All contracts are additive; zero existing signatures changed (P4-8).
> BIE not yet wired into the pipeline — `bieEnabled=false` (or omitted) is the current effective behavior, identical to Pre-Phase-4.

**Files Added (`src/pie/bie/`):**
| File | Role |
|------|------|
| `types.ts` | 7 BIE row-type contracts + shared unions (single source of truth) |
| `providers/embeddingProvider.ts` | `EmbeddingProvider` interface (no Gemini/Local impl — S3) |
| `BrainIntelligenceRepository.ts` | SSOT repository interface for all `bie_*` tables (no impl — S4) |

**Files Extended (Additive Only):**
| File | Additions |
|------|-----------|
| `src/pie/types.ts` | `RetrievalSource.semanticScore?` / `.tagMatchScore?` / `.graphScore?` (optional); `PipelineOptions.bieEnabled?` (optional, default true) |
| `src/lib/db.ts` | `KEYS.BIE_*` constants × 7 — Table DEFINITIONS only. No get/set methods yet (S4). |

---

### 🆕 Phase 4A S2 — Core Utilities (Pure Functions) (DELIVERED 2026-07-30)

> S2 = Pure Functions only. **No I/O, No Provider, No Database, No Pipeline, No Business Logic.**
> S3 (Provider Impl) and S4 (Repository) import from here; keeping S2 side-effect-free keeps S3/S4 tests isolated.
> All additions are unimported — zero runtime impact.

**Files Added (`src/pie/bie/`):**
| File | Role |
|------|------|
| `utils.ts` | 5 pure functions: `contentHash`, `normalizeVector`, `cosineSimilarity`, `levenshteinDistance`, `bm25Tokenize` |
| `synonyms.ts` | Thai/English Synonym Dictionary (~45 keys seed set) + `expandSynonyms()` lookup |

**Utility Details:**
| Function | Purpose | Edge-case Guard |
|----------|---------|-----------------|
| `contentHash(content)` | FNV-1a 32-bit hash for embedding cache invalidation (P4-10) | Empty/whitespace-only → constant hash |
| `normalizeVector(vector)` | L2 normalization before cosine similarity | Empty → []; zero-magnitude → copy; input never mutated |
| `cosineSimilarity(a, b)` | Cosine similarity [-1, 1] | Dimension mismatch → returns 0 (graceful, not throw P4-5) |
| `levenshteinDistance(a, b)` | Edit distance for fuzzy synonym matching | Empty string → length of other |
| `bm25Tokenize(text)` | Tokenizer for LocalBM25EmbeddingProvider (S3) | Empty → []; de-duplicated, lowercase |

**Synonym Dictionary (`synonyms.ts`):**
- Addresses KI-101 directly (Thai ↔ English cross-script mirrors: finance, work, health, emotion, goal, relationship, learning, identity)
- `expandSynonyms(term)` — case-insensitive lookup, returns fresh de-duplicated array
- Intentionally small seed set — S8 will bootstrap expansion from evidence co-occurrence

---

### 🆕 Phase 4A S3 — Default Provider Implementations (DELIVERED 2026-07-31)

**Summary:** สร้าง 2 Embedding Provider ตาม Interface ที่กำหนดไว้ใน S1 โดยใช้ Utilities จาก S2
- `geminiEmbeddingProvider.ts`: Primary — Google GenAI SDK. **Config:** 10s timeout, 768-dim embedding. Returns EmbeddingOutcome (ok/failure) — ห้าม throw error กรณี quota/network.
- `localBM25EmbeddingProvider.ts`: Fallback — 100% Offline. ใช้ `bm25Tokenize()` + `normalizeVector()` + `expandSynonyms()` จาก S2. **Config:** 384-dim.
- Zero Runtime Impact (ตาม P4-8 constraint): Provider ยังไม่ได้ถูก Wire เข้า Pipeline หรือ Layer ใดๆ จนกว่าจะถึง S6.
- Cache Key: ใช้ `contentHash()` จาก S2 เพื่อเตรียมความพร้อมสำหรับ Caching ในชั้น Repository (S4)

---

### 🆕 Phase 4A S4 — Repository + DB Schema Extensions (DELIVERED 2026-07-31)

**Summary:**
- สร้าง `RoomBrainIntelligenceRepository.ts` — Implementation ของ BrainIntelligenceRepository Interface (S1)
  - 2 Areas Real Storage: Embeddings cache (via contentHash key) + BIE HITL Pending Queue
  - 5 Areas = Placeholder Methods: Graph Nodes/Edges, Identity, Insights, Timeline (คืน array ว่างหรือ void — ไม่ throw)
- ขยาย `RoomDatabase` class ใน `src/lib/db.ts` ด้วย getter/setter methods สำหรับ 7 `bie_*` tables
- Structural HITL invariant encoded: ทุก applied flag เป็น required boolean; Pending Queue items ไม่มี applied field (in-queue = not applied by definition)

**Archive Pointer:** ADR detail ของ S4 Placeholder Strategy อยู่ที่ `DECISIONS_ARCHIVE.md` section [S4 ADR: Placeholder Strategy]

---

### 🆕 Phase 4A S5 — Indexing & Scoring Logic (DELIVERED 2026-07-31)

**Summary:**
- `semanticService.ts`: Cache-first Embedding Orchestrator (lookup bie_embeddings cache ก่อน → ถ้า miss → เรียก Provider Chain: Gemini Primary → Local BM25 Fallback → save cache)
- `vectorIndex.ts`: Dimension-Agnostic Linear Scan Cosine O(N) Top-N Similarity (รองรับ 768-dim ของ Gemini + 384-dim ของ Local BM25 ได้โดยอัตโนมัติผ่าน dimension mismatch graceful return 0)
- `hybridScorer.ts`: 6-Factor Hybrid Rank Formula (Σ=1.0 exact). Factors: semantic, keywordMatch, tagMatch, graph, recency, confidence. Weights รอบแรกเป็น inline literal (จะเป็น named constants export ใน S8)

**Scoring Matrix:**
| Factor | Default Weight | Data Source |
|--------|----------------|-------------|
| semanticScore | 0.35 | Provider Embedding Cosine |
| keywordMatchScore | 0.25 | expandSynonyms + levenshtein (ยืมจาก S2) |
| tagMatchScore | 0.20 | Brain Tree Tag Co-occurrence |
| graphScore | 0.05 | BIE Graph (ยัง placeholder 0 ใน 4A) |
| recencyScore | 0.10 | Time Decay |
| confidenceScore | 0.05 | Source Kind Weight |
| **Σ** | **1.00** | |

---

### 🆕 Phase 4A S6 — Wire Hooks into PIE Layers (DELIVERED 2026-08-01)

**Summary:**
- Wire BIE hook เข้า `RoomBrainRepository.getRelevantMemory()` — เมื่อ `bieEnabled !== false` → enrich legacy RetrievalSource rows ด้วย `.semanticScore` / `.tagMatchScore` / `.graphScore=0` via S5 pipeline (cache-first embed → vector cosine → 6-factor scoring)
- Interface widening: `BrainRepository.getRelevantMemory()` เพิ่ม optional param `bieEnabled?: boolean` (default undefined) — ไป thread ถึง memoryRetrieval layer → rankContext
- Thread `bieEnabled` flag ตั้งแต่ aiService.createPipelineRequestFromLegacy → PipelineOptions.bieEnabled → memoryRetrieval → Repository → actual hook
- Signature Integrity (P4-8): ทุกการเปลี่ยนแปลงเป็น **additive ONLY** (optional fields ใหม่) — ไม่มีการ remove/modify signature เก่าใดๆ
- Preserve Sort Order: ถ้า BIE enrichment skip (quota/offline/no-network) → order เก็บ byte-identical pre-phase-4 (fallback gracefully)

**Archive Pointer:** ADR detail ของ S6 Wire Hooks (Async Plumbing, Sort Strategy) อยู่ที่ `DECISIONS_ARCHIVE.md`

---

### 🆕 Phase 4A S7 — Disable Switch Integration (DELIVERED 2026-08-01)

**Summary:**
- ปรับ Short-circuit Guard: **ถ้า `bieEnabled === false` (explicit false ไม่ใช่ undefined/null)** → SKIP BIE hook ทั้งหมด 100% (ZERO embedding HTTP calls, ZERO vector cosine, ZERO semantic/tag/graph mutation)
- Integrity constraint (P4-14): bieEnabled=false path → RetrievalSource output array **byte-identical pre-phase-4** (ทุกค่า score เดิมคงอยู่, ไม่มี optional fields ใหม่ถูกเติม)
- Wire `bieEnabled` flag ตั้งแต่ aiService ทั้ง 7 functions (sendAIChatRequest, generateGreeting, ..., testAIConnection) → createPipelineRequestFromLegacy → PipelineOptions.bieEnabled
- UX Mode Mapping (LEGACY_MODE_CONFIG): Modes เก่า 6 แบบ → bieEnabled=undefined (default true = BIE on for modes ที่ผู้ใช้ไม่ได้ override explicitly)
- Zero UI Change (P4-2): ไม่มี Toggle UI ใหม่; Disable สำหรับ A/B test ผ่าน dev setting / code only ในช่วง 4A

---

## BIE Component Overview Table (Archived Reference — Active Summary อยู่ไฟล์หลัก)

| Sub-Phase | Component File | What it does | Input | Output | Persist? |
|-----------|---------------|--------------|-------|--------|----------|
| **4A** | `semanticService.ts` | Hybrid Embedding Provider: Primary via Gemini Embedding API, Fallback via Local TF-IDF/BM25 + Synonyms | `text: string, providers: APIProvider[]` | `embedding: number[], method: "gemini" \| "local"` | Persistent Cache (`bie_embeddings` via contentHash) |
| **4A** | `vectorIndex.ts` | Vector Index (Linear Scan Cosine Similarity O(N), Dimension-Agnostic) | `query_vec: number[], maxHits: number` | `{nodeId, score}[]` Top-N Similar | No (reads from `bie_embeddings`) |
| **4B** | `graphStore.ts` | Knowledge Graph CRUD: GraphNodes, GraphEdges, Path Queries | CRUD Ops, Path Queries | `GraphNode[] \| GraphEdge[] \| Path` | `bie_graph_nodes` + `bie_graph_edges` (applied=false) |
| **4B** | `relationshipEngine.ts` | Auto-detect Relationships: supports/conflicts/causes/derived_from | `Tag A, Tag B, EvidenceWindow[]` | `GraphEdge[] suggestions[]` | **`bie_pending_queue`** (HITL) |
| **4C** | `consolidationEngine.ts` | Memory Consolidation: Duplicate Check, Conflict Check, Merge Suggest, Confidence Boost | `newLearningItem[] + existingTag[] + embeddings[]` | `ConsolidationResult[]` | **`bie_pending_queue`** (HITL) |
| **4C** | `memoryScoring.ts` | Evidence Scoring + Decay: 5 Fields on BrainTreeTag | `All BrainTreeTags + Config.decay` | `UpdatedTags[] + importanceScore[]` | Brain Tree (Confirm UI) |
| **4C** | `reflectionEngine.ts` | Pattern Detection: Core Value, Co-occurrence, Conflict | `BrainEvidence[] + 90D Window` | `Reflection[]` | `bie_identity` + Pending Queue |
| **4D** | `insightGenerator.ts` | Insights: Trend 30D/90D %Change, Anomaly, Progress, Milestone, Conflict Alert | `Timeline + Scoring + Graph` | `BieInsight[]` (Top 10) | `bie_insights` (FIFO 100 applied=false) |
| **4D** | `identityEngine.ts` | Identity Summary: 8 Categories | `Top Tags + Core Reflections` | `IdentitySummary` | `bie_identity` (1-row applied=false) |
| **4D** | `timelineEngine.ts` | Life Timeline: Month/Quarter/Year Buckets + Milestones + Theme % | `All Evidence + Time Buckets` | `TimelineQuarter[]` | `bie_timeline` (Cache, contentHash) |

---

## BIE Storage Structure (RoomDatabase `bie_*` Tables — Archived Detail)

**Important:** RoomDatabase = Persistent Storage 100% สำหรับ BIE; `localStorage` ใช้แค่ cache ระหว่าง session (`bie_runtime_cache_v1`, TTL 30min)

| Table Name | Contents | Indexed By | Persistence |
|-----------|----------|-------------|-------------|
| `bie_embeddings` | `{id, contentHash, embedding[], dimensions, method, updatedAt}` | id (PK) + contentHash (UNIQUE) | Persistent Cache — never regenerate ถ้า hash match |
| `bie_graph_nodes` | GraphNode (tag/person/fear/lesson/experience/milestone) | id (PK) + kind + dimension | Persistent; wipeable namespace |
| `bie_graph_edges` | GraphEdge (supports/conflicts/causes/derived/related/opposes) | (fromId,toId,type) UNIQUE; applied flag | 🔴 applied=false จนกว่า User Confirm |
| `bie_identity` | IdentitySummary 8 Categories (singleton 1-row) | id="singleton" (PK) | applied=false จน Confirm |
| `bie_insights` | BieInsight[] (max 100 FIFO) | id + kind + generatedAt DESC | applied=false จน Confirm |
| `bie_timeline` | TimelineCache: M/Q/Y Buckets + Milestones | periodKey (PK) + contentHash | Cache (rebuildable) |
| `bie_pending_queue` | Pending BIE Items (HITL applied=false structural changes) | id + kind + createdAt DESC | **Applied=false by definition** |

---

## Phase 4 Additional Hard Constraints Table (Archived Reference — Active Constraints สำหรับ step ปัจจุบัน ดู STATE.md)

| # | Rule |
|---|------|
| P4-1 | PIE Architecture Immutable — Phase 4 ห้ามแก้ `PIPELINE_STAGE[]` order; BIE = Side Hooks เท่านั้น |
| P4-2 | Zero UX/UI Change — BIE ห้ามเพิ่ม Component ใหม่ใดๆ |
| P4-3 | Human-in-the-loop 100% — BIE outputs persist applied=false เสมอ |
| P4-4 | Docs-Code Co-commit (**อัปเดต: ดู STANDING_INSTRUCTIONS.md SI-2 — Targeted Update Rule ใหม่**) |
| P4-5 | Fallback Safety — ทุก Semantic Operation ต้องมี Offline Fallback Path |
| P4-6 | Regression Gate — ทุก sub-phase ผ่าน npm run build, lint, 7 Features 100% |
| P4-7 | BIE Sidecar Isolation — Clean Architecture: PIE → BIE → Storage (单向) |
| **P4-8** | Backward Compatibility (Signature Integrity) — Existing APIs = immutable; additive only |
| P4-9 | Provider-Independent Interfaces — All components depend on INTERFACES not concrete |
| P4-10 | Performance — Embedding Cache First (contentHash invalidation) |
| P4-11 | Performance — Heavy Tasks Async Background (chat latency < 2s) |
| P4-12 | HITL Structural Changes Gate — AI NEVER writes applied=true |
| P4-13 | Preserve Existing PIE HITL Flow — 2 Pending Queues Separate |
| **P4-14** | Future-Proof Disable Switch Everywhere — bieEnabled=false → Pre-Phase-4 100% |
