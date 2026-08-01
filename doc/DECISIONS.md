# Decisions — My Life OS

> Architecture Decision Record (ADR) แบบย่อ เก็บเหตุผลของการตัดสินใจเชิงสถาปัตยกรรม
>
> Format: `วันที่ — หัวข้อการตัดสินใจ` → `Context` → `Decision` → `Rationale` → `Trade-offs`
>
> **ไฟล์นี้เก็บเฉพาะ ADR ที่ยังคง constrain การพัฒนา step ปัจจุบันอยู่ (Active ADRs)**
>
> **สำหรับ ADR ที่ fait accompli แล้ว / ไม่ได้กระทบ step ปัจจุบันอีกต่อไป (S4 Placeholder Strategy, S6 Sync→Async Plumbing) ดูไฟล์แยก:**
> → `/doc/DECISIONS_ARCHIVE.md`

---

## 2026-07-30 — PIE Architecture 7 Layers + Repository Pattern

**Context:** Phase 1 ต้องการ AI System ที่ขยายได้ แยก Layer ชัดเจน ไม่ผูกกับ Provider ใด Provider หนึ่ง

**Decision:** ใช้ PIE (Personal Intelligence Engine) Pipeline 9 Stages + `PipelineContext` Unified Context Object Functional (`ctx in → ctx out`). แยก `BrainRepository` เป็น Interface + `RoomBrainRepository` Concrete Implementation.

**Rationale:**
- Layer Isolation: Intent ไม่เรียก AI, Prompt ไม่ดึง Memory, Provider เป็น Pure I/O — เปลี่ยนแปลงได้โดยไม่กระทบกัน
- Functional Pipeline: ไม่มี Side Effect ใน Layer ตัวเอง → Test/Reason ง่าย
- Repository Pattern: อนุญาต LocalStorage / RoomDatabase / Remote API ด้วย interface เดียวกัน

**Trade-offs:**
- จำนวนไฟล์เพิ่ม (9 layers + roles + repository) ต้องมีเอกสารอธิบายเสมอ
- Request Context Overhead: ทุก Layer รับ Context Object เต็มแม้จะใช้แค่บาง Field

---

## 2026-07-30 — Brain Tree Engine V1: Type → Dimension → Tag → Evidence

**Context:** Phase 1-2 ต้องการ Knowledge Structure ที่ Hierarchical รองรับ RPG Growth และ Multi-label Evidence (หนึ่ง Activity เชื่อมหลาย Tag ได้)

**Decision:** 4-Chain Hierarchy: `BrainTreeType` (Goal/Habit...) → `BrainTreeDimension` (Finance/Health...) → `BrainTreeTag` (React/DCA...) → `BrainEvidence` (Journal/Habit Completion...) + RPG Exponential Growth `level = floor(sqrt(growthScore / constant))`

**Rationale:**
- Hierarchy 4 ชั้นนี้พอดีกับโครงสร้างความคิดมนุษย์ (Category → Domain → Concept → Evidence)
- RPG Growth ให้ผลตอบแทนการเรียนรู้แบบ Visual Satisfying (Exponential: `S_n = constant × level²`)
- Multi-label Evidence (`brainTreeTagIds[]`) สะท้อนความเป็นจริง: หนึ่ง Journal อาจเกี่ยวกับ "DCA" และ "Discipline" พร้อมกัน

**Trade-offs:**
- ไม่มี Semantic/Graph ความสัมพันธ์ระหว่าง Tag (Tag-to-Tag) → Phase 4B Knowledge Graph แก้
- ไม่มี Embedding/Vector → Phase 4A Semantic Retrieval แก้

---

## 2026-07-30 — Hard Constraint: Human-in-the-loop applied=false 100%

**Context:** Phase 2 Learning Engine จะเขียนลง Brain Tree หรือไม่? มีความเสี่ยง AI Suggestion ไม่แม่น → ปนเปื้อน Knowledge ของผู้ใช้

**Decision:** ทุก AI Learning Item → `applied=false` เสมอ; เข้า Pending Queue (`localStorage: mylifeos_pie_pending_learning_v1`) รอ User Confirm ก่อน Brain Tree Write จริง

**Rationale:**
- "AI มีหน้าที่เสนอ; ผู้ใช้มีหน้าที่ตัดสินใจ" — Core Philosophy ทุก Phase
- ไม่มี False Positive Persist ลง Knowledge Base
- Zero UX/UI Impact: เก็บใน localStorage ชั่วคราว; Pending Confirm UI ในภายหลัง

**Trade-offs:**
- Learning Cycle ไม่ Closed Loop (ยังไม่มี Confirm UI) → Pending อาจสะสมไม่ถูกประมวลผล
- applied field = false 100% ตอนนี้ = dead state จนกว่า Confirm UI (ตามสถาปัตยกรรม BIE 4B-4C จะมี)

---

## 2026-07-30 — Phase 3: MODE_PROMPTS → 9 Native Roles + LEGACY_MODE_CONFIG

**Context:** Phase 3 Cleanup: `aiService.ts` มี `MODE_PROMPTS` 7 Legacy Prompts ซ้ำกับ 9 Native Role Persona 5/7 อัน (Prompt กระจัดกระจาย)

**Decision:** ลบ `MODE_PROMPTS` Record ทั้งหมด; ใช้ `LEGACY_MODE_CONFIG` แทน: 5 Legacy Modes (Coach/Therapist/Decision/Reflection/Chat) → Native Role Persona โดยตรง; 2 Viewpoint Special (Future Self/Secretary) → `customSystemPrompt` inline ใน aiService

**Rationale:**
- Prompt Organization: All Persona Prompts ใน `src/pie/roles/*.ts` = Single Source of Truth
- aiService เป็น Thin Facade ล้วน (ลด 630 → 550 lines, 80 lines cleanup)
- Backward Compat: Signature aiService ไม่เปลี่ยน; `MODE_TO_ROLE` ยังคง export

**Trade-offs:**
- 2 Special Cases (Future Self, Secretary) ยังมี inline System Prompt ใน aiService (แต่เป็น viewpoint variant ไม่ใช่ persona core → ยอมรับได้)

---

## 2026-07-30 — RoomBrainRepository เป็น Single Source of Truth (SSOT)

**Context:** Phase 3 พบ DRY Violation: `memoryRetrieval.ts` และ `RoomBrainRepository.ts` มี `convertBrainCardsToSources` ซ้ำกัน 2 ที่ → Logic อาจ diverge ได้

**Decision:** ลบ Conversion Logic ทั้งหมดจาก `memoryRetrieval.ts` (272 → 67 บรรทัด, ลด 75%). ทุก Layer ห้ามอ่าน DB โดยตรง; ต้องผ่าน `BrainRepository.getRelevantMemory()`. เพิ่ม `RequestContextOverride` Interface สำหรับ Backward Compat เมื่อ Views ส่ง brainCards/recentJournals มาเอง (UX ไม่เปลี่ยน).

**Rationale:**
- SSOT: Conversion Logic เดียว → Behavior Consistency; ไม่มี Code ซ้ำ
- Future Proof: ถ้าจะเพิ่ม Semantic Retrieval (Phase 4A) → แค่แก้ที่ RoomBrainRepository เดียว
- Zero UX/UI Change: Views ยังคงส่ง extraContext.brainCards ได้เหมือนเดิม

**Trade-offs:**
- Repository Responsibility เถี่ยกว่าเดิม (Conversion + Filtering + Query)
- `RequestContextOverride` เป็น leaky abstraction นิด (Views บอก DB ว่าให้อ่านอะไร) — แต่จำเป็นสำหรับ Backward Compat

---

# ⏳ PROPOSED — รอการยืนยันจาก User ก่อนลงมือ

(ยังไม่มี PROPOSED ADR ใหม่ที่รอ confirm ในช่วงนี้; ทุก PROPOSED จากก่อนหน้าได้รับการ confirm แล้วด้านล่าง)

---

## 2026-07-30 (✅ CONFIRMED by User) — Phase 4A Embedding Strategy

**Context:** Phase 4A Semantic Retrieval ต้องการ Text Embedding สำหรับ Semantic Similarity Search. 3 ทางเลือก: A) @google/genai Embedding API (ควบคุมง่ายแต่ Gemini ผูก), B) Local Zero-Dep TF-IDF+BM25 (Offline แต่ Synonym/Semantic แย่), C) Hybrid A+B: Priority A ถ้ามี Internet/Quota → Fallback B (Safe ที่สุด)

**✅ CONFIRMED Decision: C) Hybrid Embedding Strategy แต่ Provider-Agnostic ผ่าน Interface**

### Architecture Spec (User-Mandated):

```
┌───────────────────────────────────────────────────────────────┐
│  EmbeddingProvider (INTERFACE) — src/pie/bie/providers/types  │
│                                                               │
│  + embed(text): Promise<{embedding[], method, model, dims}>   │
│  + batchEmbed(texts): Promise<{embedding[]}>                  │
│  + isAvailable(): boolean                                     │
└──────┬────────────────────────────────────────────┬───────────┘
       │                                            │
       ▼                                            ▼
┌──────────────────────┐              ┌──────────────────────────┐
│ GeminiEmbeddingProvider │          │ LocalBM25EmbeddingProvider │
│ (Primary via HTTP API)   │          │ (Fallback — 100% Offline)  │
│ models/text-embedding-004 │          │ TF-IDF/BM25 + Synonyms    │
│ 768-dim embedding         │          │ 384-dim sparse vector     │
└──────────────────────┘              └──────────────────────────┘
```

**Rationale (User Confirmed):**
- **Provider-Agnostic:** BIE Business Logic (semanticService, vectorIndex) import ONLY `EmbeddingProvider` Interface — NEVER concrete Gemini/OpenAI directly.
- **Future Swappable:** เปลี่ยนเป็น OpenAI/VoyageAI/Ollama/WASM → สร้าง Provider ใหม่ + register ไม่ต้องแก้ Business Logic.
- **Hybrid Fallback:** API ไม่ตอบ/Quotaเต็ม/Offline → Auto switch Local BM25+Synonym; Retrieval ทำงาน (quality ลดเล็กน้อย แต่ไม่ error).
- **Cache First:** ทุก Embedding เก็บ contentHash (FNV-1a) → ห้าม regenerate ถ้า text ไม่เปลี่ยน; Cache = RoomDatabase `bie_embeddings` Persistent Table.

**Trade-offs:**
- ทุก Operation ต้อง Handle Async/Promise (Embedding API = Network I/O; Sync Fallback wrap Promise too).
- Vector Dimensions ไม่เท่า (Gemini 768 vs Local 384) → `vectorIndex.ts` ต้อง dimension-agnostic; normalize ก่อน cosine.
- Gemini Free Tier Quota: ~1M tokens/month (พอส่วนตัวมากๆ) → exceed auto fallback ไม่ crash.

---

## 2026-07-30 (✅ CONFIRMED by User) — BIE Storage Location: RoomDatabase หลัก; localStorage=Cache ชั่วคราวเท่านั้น

**Context:** Phase 4B-4D ต้องการ Storage: Embeddings, Knowledge Graph Edges, Identity, Insights, Timeline. 2 ทางเลือก: localStorage แยก Keys vs Extend RoomDatabase Tables.

**✅ CONFIRMED Decision: RoomDatabase Storage หลักทั้งหมด; localStorage เฉพาะ Runtime Cache ชั่วคราว TTL 30m**

### Storage Architecture (User-Mandated RoomDatabase 7 Tables `bie_*`):

```
RoomDatabase (Storage Backend BIE หลัก 100%)
├── bie_embeddings: {id, contentHash(UNIQUE), embedding[], dims, method, updatedAt}
├── bie_graph_nodes: GraphNode (tag/person/fear/lesson/experience/milestone) — id + kind + dimension
├── bie_graph_edges: GraphEdge (supports/conflicts/causes/derived/related/opposes) — UNIQUE(fromId,toId,type) + applied boolean (🔒=false จน Confirm) + confidence + evidenceIds[] + auto flag
├── bie_identity: IdentitySummary (singleton 1-row id="singleton") — coreValues/goals/motivations/personality/strengths/weaknesses/thinkingPattern JSON + applied=false จน Confirm
├── bie_insights: FIFO 100 — trend/anomaly/progress/milestone/conflict_alert/pattern kind + title/description (ไทย) + severity + dataContext + confidence + applied=false
├── bie_timeline: Cache (rebuildable) — periodKey (month/qtr/year) + periodKind + themeBreakdown JSON + milestones JSON + contentHash (invalidated เมื่อ Evidence เปลี่ยน)
└── bie_pending_queue: HITL Pending Queue BIE — graph_edge/graph_merge/identity_update/insight/tag_confidence_boost kind + payload JSON + reason (AI-generated explain user) + confidence + createdAt + **NO applied field** (in-queue = applied FALSE by DEFINITION, structural HITL invariant)
```

**Allowed localStorage Cache:** `bie_runtime_cache_v1` (In-memory ระหว่าง App Session + Hot Paths เช่น last N semantic queries). TTL 30m; ห้าม Sync กับ RoomDatabase ถ้าอัพเดต; ไม่เก็บถาวร embeddings/graph/identity/insights.

**Rationale:**
- Single Storage Backend: All Data ใน RoomDatabase เดียวกับ Brain Tree → Export/Import Backup Snapshot เดียวครบทุกอย่าง.
- Schema Migrations: get/set methods บน RoomDatabase class; ไม่ใช่ raw string localStorage ที่ไม่มี contract.
- Transactional Potential: อนาคต Update Graph+Embedding+Identity ใน Transaction เดียว build ได้บน RoomDatabase.
- Isolation: ทุก Table มี prefix `bie_` namespace → Wipe BIE ทั้งหมดได้โดยไม่กระทบ Brain Tables (brain_tree_types/.../evidence).

**Trade-offs:**
- localStorage ถูกจำกัดแค่ Cache (ไม่เก็บถาวร BIE structural data) → ตอน App รีสตาร์ท Runtime Cache หาย; แต่ Persistent Data อยู่ใน RoomDatabase (ถูกต้องตามสถาปัตยกรรม).
- 7 Tables `bie_*` = Schema มากขึ้น; แต่ TypeScript types + Repository Interface ครอบคลุม.

---

## 2026-07-30 (✅ CONFIRMED by User) — Phase 4 Execution Order & Engineering Style

**Context:** Phase 4 แบ่ง 4A-4D; จะเริ่มไหนก่อน? Feature-First (ทำได้ก่อน) หรือ Infrastructure-First (วาง Foundation 100% ก่อน)?

**✅ CONFIRMED Decision: Phase 4A First + Infrastructure-First**

### Sub-phase Order (Blocking Chain):
```
4A Semantic Retrieval + Hybrid Search
   ↓ (4B ใช้ Semantic Matching จาก 4A หา Similar Nodes สร้าง Graph Edges)
4B Knowledge Graph + Relationship Engine
   ↓ (4C ใช้ Graph + Semantic สำหรับ Consolidation/Conflict Detection)
4C Memory Intelligence + Reflection Engine
   ↓ (4D Aggregate ผลจากทุกอย่างข้างต้น)
4D Identity Engine + Insight Generator + Life Timeline
```

### Engineering Style: Infrastructure-First for ทุก Sub-phase
| Step | 4A Example | Priority |
|------|-----------|----------|
| 1. Define Interfaces First | EmbeddingProvider, BrainIntelligenceRepository, VectorIndex, HybridScorer Interfaces + Type Contracts | P0 |
| 2. Default Implementations | GeminiEmbeddingProvider, LocalBM25EmbeddingProvider, RoomBrainIntelligenceRepository | P0 |
| 3. Test Wrapper Utilities | contentHash, normalizeVector, cosineSimilarity, levenshtein | P0 |
| 4. Hook into PIE Layer (preserve signature) | Extend RetrievalSource optional fields (no existing change) | P1 |
| 5. Wire Hook in runMemoryRetrieval/rankContext + Disable Switch | Call BIE ถ้ามี; ถ้า disabled → Keyword 100% Zero Impact Default | P1 |
| 6. Feature Logic Tuning (Weight Calibration, Formula Tuning) | 6-factor weight Sweep, Synonym Bootstrap Expansion | P2 |
| 7. Regression Gate | Build + Lint + 7 AI Features + PIE Stage Integrity | P3 Blocking Gate |

### Additional Mandatory Constraints (User Specified — ALL Phase 4 work):
| ID | Rule | How Enforced |
|----|------|--------------|
| **P4-8** | Backward Compatibility: ห้ามแก้ Existing API Signatures (aiService, PipelineContext existing fields, PIPELINE_STAGES, BrainRepository existing methods) | tsc --noEmit + interface inheritance; additive only (new optional fields ONLY) |
| **P4-9** | Clean Architecture: All new components depend on INTERFACES, NOT concrete implementations | Code Review: Constructor takes Interface (e.g. `EmbeddingProvider` never `GeminiEmbeddingProvider` concrete) |
| **P4-10** | Performance — Cache First: Embeddings NOT regenerate if contentHash same; Cache on RoomDatabase bie_embeddings | contentHash(text) before call API + lookup first |
| **P4-11** | Performance — Async Heavy: Reflection/Graph Rebuild/Insight Gen/Consolidation = Background Promise (NOT block chat response path) | BIE Background Runner = Promise.then().catch() ไม่ await; User Response first |
| **P4-12** | HITL 100%: AI NEVER writes Brain Tree / bie_* applied=true directly. Every structural change → bie_pending_queue applied=false | Code: all structural write = pending queue ONLY; no direct write from AI |
| **P4-13** | Preserve Core PIE HITL: Core PIE Learning applied=false + `mylifeos_pie_pending_learning_v1` localStorage unchanged 100%. BIE Queue = คู่ขนานสำหรับ BIE items ONLY | 2 Separate Pending Queues; No cross-contamination, No merge needed |
| **P4-14** | Disable Switch Everywhere: `bieEnabled?: boolean` (default true). If explicit false → BIE hooks SKIP 100% → Pre-Phase-4 Keyword-only + Hierarchical Brain Tree 100% (no graph/vector) | STATE.md lists bieEnabled=false integrity check; S7 threads guard, S8 preserve legacy when bieEnabled=false |

**Rationale:**
- 5+ Year Project: Infra Foundation ถูกตั้งแต่แรก → ลด Maintenance Burden อย่างมากใน Phase 5/6 ต่อไป
- Zero Risk: ถ้า Sub-phase ใดล้มเหลวกลางทาง — ได้ Interface + Infrastructure ใช้งานเสมอ; ไม่เกิด Dead Code (Interface แทน Concrete)
- Parallelization: ถ้าต้องการเร่ง 4A infra เสร็จ → 4B Design Graph Interfaces ได้เลยโดยไม่รอ 4A Business Logic Tuning
- Backward Safety: Default เมื่อ BIE Component ไหนยังไม่มี → Pre-Phase-4 100%; ไม่มี Regression ใน UI/Feature ใดๆ

---

## 2026-07-31 (✅ CONFIRMED during S3 impl) — S3 Provider Runtime Decisions: Timeout/Dimensions/Chunking

**Context:** ระหว่าง S3 implementation of Gemini/LocalBM25 Embedding Providers — มี numeric "knobs" จำนวนหนึ่งต้อง hardcode default ครั้งแรกให้สมเหตุสมผลก่อน S8 จะ sweep values.

**✅ Decision: ค่า default ดังต่อไปนี้ (hardcoded ภายใน provider class S3; สามารถ override ผ่าน constructor ได้ในอนาคตถ้าจำเป็น — S3 ไม่ expose parameter เพื่อ contract simplicity):**

| Constant | Location | Value | Rationale |
|----------|----------|-------|-----------|
| FETCH_TIMEOUT_MS | GeminiEmbeddingProvider | **10,000 ms (10 วินาที)** | Upper bound mobile 2G/3G แย่มาก; ยังไม่ถึง freeze threshold ~30 วินาที → trigger failover LocalBM25 ภายใน 10 วินาที |
| LOCAL_DIMENSIONS | LocalBM25EmbeddingProvider | **384** | Exactly half Gemini 768 (a) half memory/compute, (b) 384 slots → collision ~5% for 5000 tags (birthday n²/(2d) = 25M/768 ≈32K collisions; 5% signals = add recall, no subtract precision → acceptable). Dimension mismatch handled gracefully by S2 cosineSimilarity dim-mismatch→0 P4-5. |
| SYNONYM_WEIGHT | LocalBM25EmbeddingProvider | **0.5** | Synonym-expanded term = half weight of original user-typed token. Recall vs precision trade-off; industry sweet spot. **S8 sweep values: [0.25, 0.4, 0.5, 0.6, 0.75]** with per-synonym evidence-co-occurrence weights (no global constant). |
| CHUNK_SIZE (batch) | GeminiEmbeddingProvider._batchChunk() | **100 texts** | Gemini free-tier limit 100/call; >100 split chunk 100 stitch results. |
| Batch failure strategy | Gemini.batchEmbed() | **Per-text sequential fallback** | If `batchEmbedContents` endpoint fails (quota/network/unsupported) — transparently fallback sequential per-text `embed()` instead propagate error → outcome array complete per `EmbeddingProvider.batchEmbed()` contract "Order matches input order". |

**Trade-offs:**
- 10s อาจยาวไปสำหรับ 5G/Wi-Fi แต่สั้นไปสำหรับ rural 2G → trade-off ยอมรับได้ (failover ตอบภายใน 10ms หลัง trigger)
- 384 dims collision real (~5%) — BM25 linear additive; collisions NO subtract signal, เพิ่ม recall เล็กน้อย ไม่ทำลาย precision มากนัก
- SYNONYM_WEIGHT=0.5 อาจสูง/ต่ำเกินไปสำหรับบาง domain → S8 แก้ด้วย per-synonym weight จาก evidence co-occurrence data (bootstrap expansion)

---

## 2026-08-01 (Runtime during S6 impl — semanticScore lookup strategy) — S6: Option Y (embed query once → cosine vs each candidate) vs Option X (vectorIndex.findSimilar per candidate)

**Context:** S6 ต้องการ build `Map<embeddingId, cosineScore ∈ [0,1]` ที่ `hybridScorer.rankItems(ctx.semanticScores)` contract expect. 2 Valid Strategies:
- **Option X:** For each candidate i, embed its vec, call `vectorIndex.findSimilar(candidateVec, N)` → find self contentHash → self-similarity score = query relevance. Requires 2 passes + N separate vectorIndex scans O(N²) indirect.
- **Option Y:** Embed raw query `keywords.join(' ')` ONCE → queryVec. For each i DIRECT compute S2 `cosineSimilarity(queryVec, candidateVec)` clamp [0,1] → Map keyed by `embeddingId` (EXACTLY what hybridScorer looks up). 1 embedText + N trivial S2 pure calls. O(N·D) trivial for N=30.

**✅ Decision: Option Y — 1 query embed + direct per-candidate cosine similarity**

**Rationale:**
- **Correctness contract match:** hybridScorer semanticScores = "Map item embeddingId → query relevance [0,1]" = Option Y computes EXACTLY this; Option X was "corpus centroid similarity" = different semantic concept (requires extra normalization not in contract).
- Simplicity / less code: 1 embedText cacheable + N cosineSimilarity pure = 0 vectorIndex findSimilar loops / 0 contentHash self-match probes / 0 tie-breaking.
- Performance: X = O(N²) vectorIndex; Y = 1× embedText O(1 net) + N×O(D) cosine = trivial at personal scale N≤50.
- Cache efficiency: Repeated user queries ("ทำงานยังไง", "สุขภาพ") benefit from P4-10 contentHash caching → whole embed pipeline short-circuits for hot queries.
- Determinism: No Top-N threshold tuning (Option X required maxHits where a candidate's own embedding might miss its own top-N at vector degenerate states). Option Y deterministic for given queryVec/candidateVec pair.

**Trade-offs:** Option X might benefit from future FAISS/HNSW ANN upgrades — but vectorIndex.findSimilar(vec→corpus hits) not vec→vec direct. Correct ANN path: call `vectorIndex.findSimilar(queryVec, 200)` FIRST → then build Map from hits (score 0 for items outside top-200). This is Option-Y shape with ANN pre-pass filter; same contract, zero migration cost.
Extra overhead: 1 additional embedText(queryText) call on top of candidates batch. ~200ms network / 10ms LocalBM25. Negligible vs N candidate embeds; cache hit drops to 0 overhead for repeats.

---

## 2026-08-01 (Runtime during S6 impl — sort order baseline) — S6: Preserve Legacy Keyword Sort Order; defer hybrid-sort enablement to S8

**Context:** After `hybridRankItems(...)` returns rows SORTED DESC by hybridScore = S6 has 2 valid choices:
- **Option A — Hybrid re-sort output:** Replace legacy[] with sorted ranked[] → user sees memory rows reordered by 6-factor semantic+keyword+recency. Changes user-visible UX behavior explicitly.
- **Option B — Preserve legacy keyword sort:** Use ranked[i] return ONLY for per-row `.semanticScore / .tagMatchScore` numeric fields; copy those scores onto SAME-INDEX legacy[i]. Return legacy array unchanged (same refs, same order, 3-factor keyword-hits DESC + timestamp DESC). Optional scores enriched but sort order identical to pre-phase-4.
Spec explicitly recommends Option B for S6 as "minimal hookup baseline change; easy regression verify; hybrid sort knob dedicated tuning gate S8".

**✅ Decision: Option B — Preserve legacy keyword sort order in S6; defer hybrid-sort enable conditional to S8 Tuning.**

**Rationale:**
- Minimal change principle for S6 Hookup Baseline: S6 = PROVE that S1-S5 compile, link, run inside pipeline without breaking; scores attach correctly, failures skip gracefully, all 7 features pass. Introducing UX re-order at S6 = user complaints "results weird" cannot be disentangled from genuine embedding/provider/scoring bugs vs real semantic-search quality.
- S8 = dedicated Tuning gate: S8 job = 6-factor formula weight sweeps, threshold tuning, synonym bootstrap expansion. Hybrid-sort on/off = first-order UX knob directly affecting UX perceived quality = BELONGS in S8 alongside weight sweeps, NOT hookup-only S6 baseline.
- Trivial to enable later: hybridRankItems already carries pre-sorted rows; S8 enable = 3-line switch (return ranked instead of index-copy). No architecture refactor required.
- Regression simplicity: With preserved order → unit-testable: S5 output vs S6 (bieEnabled=false) are IDENTICAL arrays (same len, same order, same element fields EXCEPT new optional ones). Hybrid reorder = subjective eyeball regression testing.

**Trade-offs:**
- S6 users = ZERO actual UX benefit from semantic scores (rows NOT reordered by hybridScore). Only downstream devs see attached fields via console/logger. Intentional: S6 = Infra Hookup step, not UX Launch. Benefit user-visible at S8 when conditional hybrid sort code path enables.
- 1 extra loop in S6 for index copy: S8 switch to hybrid sorted → this copy-loop disappears (return ranked directly). Trivial 30 iterations max.
- Knowledge gap for curious users: "why doesn't semantic search change my results?" → changelog/decisions doc explains staged rollout (S6=internal attach; S7=disable switch; S8=hybrid sort conditionally enabled).

---

### 💡 สำหรับ Archived ADR (S4 Placeholder Strategy, S6 Sync→Async Plumbing) → ดู `/doc/DECISIONS_ARCHIVE.md`
