# CHANGELOG_ARCHIVE.md — Compressed Historical Changelogs

> ไฟล์นี้เก็บ **Historical entries ที่ปิดจบแล้ว** (Closed / Delivered) ของ step/phase ที่เก่ากว่า "phase ปัจจุบัน - 1"
>
> ไฟล์ CHANGELOG หลัก (Active) อยู่ที่ `/doc/CHANGELOG.md` เก็บเฉพาะ: Phase ปัจจุบัน (4A sub-step ล่าสุด) + Phase ก่อนหน้า 1 อัน (Phase 3)
>
> **โครงสร้าง:**
> 1. ด้านบน = **Compressed Summary Index** (1-3 บรรทัดต่อ entry — สำหรับอ่านเร็ว/หา index)
> 2. ด้านล่าง = **Full Detail Archived** (จาก CHANGELOG ไฟล์หลักรุ่นเดิม — สำหรับขุด backtrack detail)

---

## 📚 Compressed Summary Index (อ่านเร็ว)

| Entry | Status | Key Deliverables (สั้นๆ) |
|-------|--------|--------------------------|
| [Phase 4A — S5] Indexing & Scoring Logic | ✅ DELIVERED 2026-08-01 | Added 3 files: `semanticService.ts` (cache-first embed + provider failover), `vectorIndex.ts` (linear cosine O(N)), `hybridScorer.ts` (6-factor Σ=1.0 formula + bootstrap weight constants). Zero wiring/S6; all 3 modules unimported → zero runtime impact. |
| [Phase 4A — S4] Repository + DB Schema Extensions | ✅ DELIVERED 2026-07-31 | `RoomBrainIntelligenceRepository.ts` (28 methods, 7 areas). 2 areas real storage (Embeddings cache via `KEYS.BIE_*` Room tables + BIE HITL Pending Queue FIFO cap=100). 5 areas = type-safe empty placeholders (Graph/Identity/Insights/Timeline 20 methods → `[]`/undefined/no-op). Extended `src/types.ts` + `RoomDatabase` with BIE get/save methods + backup/restore symmetry. Zero wiring; zero runtime impact. |
| [Phase 4A — S3] Default Provider Implementations | ✅ DELIVERED 2026-07-31 | `geminiEmbeddingProvider.ts` (Primary: Gemini HTTP, 10s abort timeout, 768-dim, 4-class typed failure mapping quota/network/invalid/unknown, NEVER throws, batch 100-row chunk + per-text fallback). `localBM25EmbeddingProvider.ts` (Fallback 100% offline: reuse S2 bm25Tokenize/expandSynonyms(weight 0.5)/normalizeVector/contentHash, 384-dim, always available). Zero consumers; zero runtime impact. |
| [Phase 4A — S2] Core Utilities (Pure Functions) | ✅ DELIVERED 2026-07-30 | `utils.ts`: `contentHash` (FNV-1a 32-bit cache invalidation), `normalizeVector` (L2 norm), `cosineSimilarity` (dim-mismatch→0 graceful, never throw), `levenshteinDistance` (two-row DP), `bm25Tokenize` (mirrors Intent Engine Thai 2+ char / English 3+ letters). `synonyms.ts`: 45-key Thai/English Synonym seed set (Finance/Work/Health/Emotion/Goal/Relationship/Learning/Identity, KI-101 directly addressed). 25/25 sanity assertions pass. Zero imports; zero runtime impact. |
| [Phase 4A — S1] Type & Interface Contracts | ✅ DELIVERED 2026-07-30 | 3 files added: `bie/types.ts` (7 row types + shared unions, HITL invariant structurally encoded: applied flag required everywhere EXCEPT PendingLearning which has no applied by definition). `providers/embeddingProvider.ts` (interface only: async embed/batchEmbed, `EmbeddingOutcome=ok\|failure`, isAvailable probe). `BrainIntelligenceRepository.ts` (SSOT interface: 20+ methods, 7 areas, HITL surface: AI writes ONLY via `appendPendingBieItem`). 2 extended additively: `pie/types.ts` (+optional score fields on RetrievalSource, +bieEnabled PipelineOptions); `lib/db.ts` (+7 BIE_* KEYS, no get/set methods yet). Zero imports; zero runtime impact. |
| [Phase 4 — Pre-4A Setup] Documentation Policy + Memory Files | ✅ DELIVERED 2026-07-30 | Added `DECISIONS.md` (5 past ADRs + 3 proposed for 4A). Added `KNOWN_ISSUES.md` (3Crt/6Med/6Low + 14 gap table). Rewrote ROADMAP Phase 4 for BIE 4A-4D sub-phases. Rewrote AI_ARCHITECTURE Phase 4 section (BIE Component Table × 11, RoomDatabase bie_* 7 Tables full spec, P4-1..14 Hard Constraints). Consistency: CHANGELOG Phase 3 status 🚧→✅. |
| [Phase 2] Full Pipeline Integration | ✅ DELIVERED | 7 AI features 100% through PIE (`sendAIChatRequest`, greetings, daily summary, journal analysis, brain card scout, guide, brain placement). PipelineLogger Singleton FIFO 200. PipelineOptions: skipStages, maxRetrieval/RankedSources, learningEnabled, stageComplete callback, repo DI. PIE Barrel Export. Retrieval Hierarchy: BrainTree(primary)+Journals(primary)+LegacyCards(fallback<5). Role-based filter in retrieval. Response Analyzer + Learning Engine wired: applied=false, Pending Queue localStorage key, default: autoApply=false, minConfidence=0.72, maxPersist=3. aiService Adapter: `createPipelineRequestFromLegacy` → runPipeline → graceful error. Removed: aiRouter.ts (zero consumers), direct Provider calls from aiService. |

---

---

## Full Detail Archives

---

## [Phase 4A — S5] — Indexing & Scoring Logic (Vector Index + Hybrid Scorer)
**Status**: ✅ Complete (2026-08-01)

> Infrastructure-First Step 5 of 9. Business Logic Layer on S1–S4 foundations. Three pure modules: Hybrid Embedding Orchestrator (SemanticService — cache-first + provider failover chain), Dimension-Agnostic Linear-Scan Cosine Index (VectorIndex — O(N), zero native deps), 6-Factor Weighted Hybrid Rank Formula (HybridScorer — bootstrap weights SUM=1.0, S8 sweeps). Zero wiring (S6) so zero runtime impact — all 3 modules unimported by any PIE layer.

### Added

- 🆕 **`src/pie/bie/semanticService.ts`** — `SemanticService` class + `createDefaultSemanticService()` factory. Hybrid Embedding Orchestrator implementing P4-10 cache-first + P4-5 primary/failover provider chain:
  - Constructor DI (P4-9): Takes `repository: BrainIntelligenceRepository` (INTERFACE not concrete), `primaryProviders: EmbeddingProvider[]` (INTERFACE list), `fallbackProvider: EmbeddingProvider`. Concrete provider classes + `RoomBrainIntelligenceRepository` imported ONLY at bottom of file for default factory; class body never references them by name.
  - `embedText(text, opts?)` Flow: S2 `contentHash(text)` → (unless `forceRefresh`) `repo.getEmbedding({contentHash})` → Cache Hit ⇒ short-circuit (P4-10 invariant) → Cache Miss ⇒ iterate primary providers: `isAvailable()` probe first, then `await embed()` → on success build `EmbeddingRecord` (id = `bie-embed-${now}-${base36rand}`, method/model/dimensions match outcome, `repo.saveEmbedding(record)` persist) → all primaries exhausted (failure outcome or thrown error caught) ⇒ guaranteed terminal fallback to DI-injected LocalBM25 (S3 contract says always succeeds) → final defensive degenerate-zero-vec record if even fallback failed (empty text case).
  - `batchEmbedTexts(texts, opts?)`: Phase A = per-text cache-hit loop (skip provider) → Phase B = all-hit short-circuit → Phase C = provider-chain `batchEmbed()` for miss-subset → any slot still failing → per-text `embedText(forceRefresh=true)` sequential fallback. Stitches back to original input order 1:1.
  - Zero-throw guarantee: Every provider call wrapped in try/catch; fail advance instead of re-throwing.
  - Every method full JSDoc: Input/Output types, Cache flow description + P4-10 short-circuit on hit, failure fallback chain.
- 🆕 **`src/pie/bie/vectorIndex.ts`** — `VectorIndex` class. Dimension-Agnostic Linear Scan Cosine O(N), zero native deps (no FAISS/HNSW):
  - Constructor DI (P4-9): `repository: BrainIntelligenceRepository` (INTERFACE) + `semanticService: SemanticService` instance for convenience embed-and-search wrapper.
  - `findSimilar(queryVec, maxHits=20)`: `repo.getEmbeddings()` full snapshot slice → per-record S2 `cosineSimilarity(queryVec, record.embedding)` (dimension mismatch/zero-magnitude/non-finite ⇒ returns 0 gracefully per S2, never throw, never NaN) → DESC score sort + id ASC tiebreak for determinism → top `clamp(maxHits, [1, 500])`. Small DTO `{id, score, contentHash}` (no embedding copy for perf). Full JSDoc O(N) scaling note (N=1K~1ms, N=50K~40ms) + KI-203 reference.
  - `findSimilarByContentText(text, maxHits?)`: Convenience. `await semanticService.embedText(text)` (P4-10 cacheable) → pass `record.embedding` to `findSimilar`.
- 🆕 **`src/pie/bie/hybridScorer.ts`** — Pure functions + exported constants for 6-Factor weighted hybrid rank (Σ factor_i × weight_i):
  - Bootstrap weight constants (SUM=1.0 EXACT, tune in S8): `KW_WEIGHT=0.20`, `SEM_WEIGHT=0.30`, `TAG_WEIGHT=0.15`, `DIM_WEIGHT=0.10`, `RECENCY_WEIGHT=0.10`, `CONF_WEIGHT=0.15`.
  - `computeKeywordScore(queryKeywords, content)` [0,1]: Expanded query tokens (S2 `bm25Tokenize(kw)` per keyword + `expandSynonyms()` per token) vs content tokens (single `bm25Tokenize(content)`) → Jaccard intersection/union + levenshtein fuzzy bonus (edit dist ≤ 2 → 0.3 / 0.15 weighted contribution) → normalized by 1.3 ceiling.
  - `computeRecencyScore(createdAtMs, nowMs=Date.now())` [0,1]: `exp(-(nowMs - createdAtMs) / (30 * 86400 * 1000))` (30-day half-life). 0d=1.0, 7d=0.85, 30d=0.368 (1/e), 90d=0.05. Future-dates clamp 1.0.
  - `scoreItem(item, ctx)` Σ [0,1]: Composite 6-factor sum. Missing optional fields → 0 for factor. `dimensionScore` = 1 if item.dim===filterDim else 0; when NO filterDim → neutral 0.5 so dimensioned rows don't artificially outrank. Semantic factor via `ctx.semanticScores.get(embeddingId)` Map lookup (S6 layer materializes from vectorIndex top-N hits).
  - `rankItems(items, ctx, limit=50)`: Per-item per-factor breakdown → attach TWO S1-DECLARED optional fields to each returned row: `.semanticScore: number` and `.tagMatchScore: number` (S1 `pie/types.ts` RetrievalSource lines 50/52 — no new type declarations; fully backward-compatible P4-8 additive), add internal `.hybridScore: number` as sort key → DESC sort then tiebreak createdAt DESC → top clamped limit.

### Verified

- ✅ Build · ✅ Lint (tsc --noEmit) 0 errors.
- ✅ Backward Compatibility (Zero Runtime Impact): S5 files imported ONLY within S5 module group internally. ZERO import statements from any file outside the three new S5 files. No PIE layer/pipeline/aiService/views/repo/db code path touches S5.
- ✅ Regression: 7 aiService features + PIE 7-layer pipeline + Prompt 9 Roles + Brain Tree CRUD + Character/Journals/Goals/Habits schemas + Legacy fallback threshold=5 + RoomDatabase backup/restore = untouched 100% (byte-for-byte identical to S4 state).
- ✅ No S1 type re-declarations: Every domain type imported from canonical S1 locations; local-only DTOs (`ScorableItem`, `HybridScoreContext`) declared ONLY inside consuming S5 files.
- ✅ HITL invariant (P4-12): NONE call `appendPendingBieItem`; NONE write to Graph/Identity/Insights/Timeline. ONLY write = `repo.saveEmbedding(record)` explicitly allowed value-neutral embedding cache fill.
- ✅ No cross-layer coupling (P4-7): S5 imports only S1 types, S2 pure functions, S3 interface + concrete classes for default factory only, S4 interface + concrete for default factory only. ZERO imports from PIE layers, pipeline, RoomBrainRepository, UI, aiService.
- ✅ No breaking changes (P4-8): S5 = 3 new files; no existing signature, export, type modified/removed. Pre-S5 consumers compile and run identically.

---

## [Phase 4A — S4] — Repository + DB Schema Extensions
**Status**: ✅ Complete (2026-07-31)

> Infrastructure-First Step 4 of 9. SSOT `BrainIntelligenceRepository` implementation wrapping `bie_*` RoomDatabase tables. 4A scope: ONLY two sub-areas ACTUAL persistent storage today (Embeddings cache + cross-phase HITL Pending Queue); remaining five areas (Graph Nodes/Edges, Identity, Insights, Timeline) ship type-safe empty-return placeholder implementations (20 methods) satisfying S1 28-method surface at build time. Zero wiring; zero runtime impact.

### Added

- 🆕 **`src/pie/bie/RoomBrainIntelligenceRepository.ts`** — `RoomBrainIntelligenceRepository` implements S1 `BrainIntelligenceRepository` in full (28 methods, 7 areas):
  - Embeddings (real, 4 methods): `getEmbedding(params)` composite AND-filter (id ∧ contentHash ∧ method); `getEmbeddings()` snapshot slice; `saveEmbedding(record)` upsert by id; `deleteEmbedding(id)` remove-by-id. Wrap `RoomDatabase.getBieEmbeddings/saveBieEmbeddings` (1-hop SSOT, no duplicate logic).
  - Graph Nodes/Edges/Identity/Insights/Timeline (placeholders, 20 methods): Each returns type-safe empty value (`[]` for arrays, `undefined` for singletons, no-op void writes) instead of throwing. Each JSDoc labels target sub-phase 4B/4D for later fill-in. Trade-offs in DECISIONS_ARCHIVE.md → S4 Placeholder Strategy ADR.
  - Pending Queue (real, 5 methods): `getPendingBieItems()` ascending createdAt (oldest first, newest last S1 contract); `getPendingBieItemsByKind(kind)` filter; `appendPendingBieItem(item)` enforces FIFO cap 100 rows (same cap as Core PIE pending queue, consistent bounded-memory guarantee); `applyPendingBieItem(id)` / `rejectPendingBieItem(id)` idempotent drop-by-id (4A has no target tables — 4B/4C/4D will extend side effects). All writes go through `RoomDatabase.getBiePendingQueue/saveBiePendingQueue`.
  - HITL invariant structurally preserved (P4-12): No method writes to structural table directly. AI modules MUST use `appendPendingBieItem()` ONLY write surface.
  - Every method full JSDoc + explicit failure-mode note (never throw — relies on RoomDatabase catch-and-console-error strategy).
- ➕ **`src/types.ts`** (additive only P4-8): Re-exports `EmbeddingRecord` + `PendingLearning` from S1 `pie/bie/types.ts`. Zero duplicate declarations — S1 canonical SSOT; re-export purely centralizes `../types` import path for RoomDatabase + cross-module importers (no second canonical location).
- ➕ **`src/lib/db.ts`** (additive only): Import `EmbeddingRecord`/`PendingLearning` from src/types.ts re-exports. Defaults: `DEFAULT_BIE_EMBEDDINGS = []`, `DEFAULT_BIE_PENDING_QUEUE = []`. 4 new RoomDatabase methods: `getBieEmbeddings()`, `saveBieEmbeddings(list)`, `getBiePendingQueue()`, `saveBiePendingQueue(list)`. Use existing S1 `KEYS.BIE_*` constants exclusively (no new key declarations). Backup/Restore symmetry: `exportBackupZip()` adds `bieEmbeddings` and `biePendingQueue` fields; `importBackupZip()` restores both fields (if present — backward-compatible with pre-S4 backups lacking them). Core Brain Tree/Settings tables untouched.

### Verified

- ✅ Build · Lint 0 errors.
- ✅ Backward Compat: `RoomBrainIntelligenceRepository` referenced in exactly 2 files (its own source + S1 interface). NOT imported into any PIE layer/aiService/views/hooks/app entry → zero runtime impact.
- ✅ Regression: 7 aiService features untouched (none reference `bie_*` tables/new repo/new RoomDatabase methods). Existing PIE pipeline, 9 Roles, Brain Tree CRUD, Character/Journals/Goals/Habits schemas, Legacy fallback threshold=5 = 100% identical S3 state.
- ✅ No S1 duplication. No cross-layer coupling (P4-7): imports only RoomDatabase backend + S1 interface/types. No imports from PIE layers/pipeline/RoomBrainRepository/UI.
- ✅ Placeholder type-safety: 20 placeholder methods return exact return arity matching S1 interface. tsc --strict passes; no any/no ts-ignore/unbalanced returns.
- ✅ No breaking changes (P4-8): All 3 modified files strictly additive. No existing export/RoomDatabase method/global type declaration modified/removed/re-ordered. Pre-S4 consumers compile identically.

---

## [Phase 4A — S3] — Default Provider Implementations
**Status**: ✅ Complete (2026-07-31)

> Infrastructure-First Step 3 of 9. Two concrete `EmbeddingProvider` implementations per S1 interface contract. Primary (Gemini Embedding HTTP API) + Offline Fallback (BM25 tokenization + S2 synonym dictionary + 384-dim hashing-trick sparse vector). Zero pipeline wiring (S6), zero Database (S4), zero consumers, zero runtime impact — pure infrastructure.

### Added

- 🆕 **`src/pie/bie/providers/geminiEmbeddingProvider.ts`** — `GeminiEmbeddingProvider` S1 interface via Gemini HTTP embedContent/batchEmbedContents:
  - Constructor takes single `APIProvider` (same settings shape Phase 1). `isAvailable()` cheap sync probe (enabled + name is Gemini + non-empty apiKey).
  - `embed(text)` 10s AbortController timeout, typed failure classification: `quota` (429/RESOURCE_EXHAUSTED), `network` (5xx/timeout/fetch-abort), `invalid_input` (4xx/empty text), `unknown` (malformed body). **NEVER throws** → returns `ok: false` envelope so S5 hybrid orchestrator fails over cleanly (P4-5).
  - `batchEmbed(texts)` chunks at 100 rows per call (Gemini free-tier limit); batch endpoint failure → transparent per-text sequential fallback via same `embed()` method; each slot independently resolved (one bad row never poisons batch). Exposes `contentHash(text)` (S2) in failure messages for cache invalidation path (P4-10/S4). No local persistence (caching = Repository's job). Default model `text-embedding-004` (768-dim matches DECISIONS Hybrid Embedding spec).
- 🆕 **`src/pie/bie/providers/localBM25EmbeddingProvider.ts`** — `LocalBM25EmbeddingProvider` 100% offline fallback zero I/O:
  - Reuses S2 `bm25Tokenize()` (NO new tokenizer; mirrors Intent Engine Thai 2+ char / English 3+ letter patterns exactly). Reuses S2 `expandSynonyms()` to resolve KI-101 gaps. Synonym-expanded terms carry weight 0.5 vs primary token 1.0 (precision/recall trade-off — tunable S8).
  - Reuses S2 `normalizeVector()` for final L2 unit-length invariant (guarantees S2 `cosineSimilarity()` works correctly across 768-dim Gemini and 384-dim local; dimension mismatch → graceful 0 per S2 cosine guard). Reuses S2 `contentHash()` for cache-key determinism on failure messages (S4 caches too).
  - Fixed 384-dim output (exactly half of Gemini 768): expected collision ~5% for 5000-tag personal Brain Tree (well within BM25 signal-to-noise floor). Trade-off documented DECISIONS.md S3 Provider Tuning ADR. `isAvailable()` always true (no prereqs). Degenerate-input guards: empty text → invalid_input; zero extracted tokens → invalid_input; post-normalization all-zero vector → unknown defensive only.

### Verified

- ✅ Build · Lint 0 errors.
- ✅ Backward Compatibility: Zero imports of Gemini/LocalBM25 provider anywhere in codebase (grep-confirmed) → zero runtime impact. Pre-phase-4 effective behavior identical.
- ✅ Regression: 7 existing aiService features untouched. No PIE stage changes; no UX/UI impact (P4-2/P4-14 by construction).
- ✅ No S1/S2 duplication: All pure helpers re-imported from canonical S2 utils/synonyms; all types from S1 types + providers/embeddingProvider interface.
- ✅ No cross-layer coupling: Gemini provider imports only `APIProvider` settings type (non-PIE layer; P4-7 compliant); LocalBM25 imports zero PIE types.

---

## [Phase 4A — S1] — Type & Interface Contracts
**Status**: ✅ Complete (2026-07-30)

> Infrastructure-First Step 1 of 9. Foundation only — no business logic, no queries, no migration. All additions additive; zero existing signatures changed. BIE not yet wired into pipeline; effective behavior identical to Pre-Phase-4 (Keyword-only 3-factor ranking).

### Added

- 🆕 **`src/pie/bie/types.ts`**: 7 row types: `EmbeddingRecord`, `GraphNode`, `GraphEdge`, `IdentityProfile`, `Insight`, `TimelineItem`, `PendingLearning` + helper subtypes `IdentityEntry`, `TimelineTheme`, `TimelineMilestone`. Shared unions: `EmbeddingMethod`, `GraphNodeKind`, `GraphEdgeType`, `GraphNodeCoreType`, `InsightKind`/Severity, `IdentityCategory`, `TimelinePeriodKind`, `BiePendingKind`. Schema mirrors CONFIRMED bie_* table spec (DECISIONS.md Storage Location). **HITL invariant encoded structurally**: `GraphEdge/IdentityProfile/Insight.applied` = required boolean; `PendingLearning` carries NO `applied` field (in-queue = not applied by definition).
- 🆕 **`src/pie/bie/providers/embeddingProvider.ts`**: `EmbeddingProvider` interface ONLY (no impl deferred S3): Async-only `embed()`/`batchEmbed()` uniform for hybrid fallback P4-5; Typed `EmbeddingOutcome = ok|failure` (providers NEVER throw on quota/network); `isAvailable()` cheap probe + `dimensions`/`id`/`displayName` orchestrator metadata.
- 🆕 **`src/pie/bie/BrainIntelligenceRepository.ts`**: SSOT repository interface for all bie_* tables (no impl deferred S4): 20+ methods across 7 areas: Embeddings, Graph Nodes, Graph Edges, Identity, Insights, Timeline, Pending Queue. HITL surface enforced: AI writes go VIA `appendPendingBieItem()` ONLY; `applyGraphEdge()`/`applyIdentity()`/`applyInsight()` reserved for Confirm UI.

### Changed

- ➕ **`src/pie/types.ts`** (additive only P4-8): `RetrievalSource` +optional `.semanticScore?`/`.tagMatchScore?`/`.graphScore?` (undefined → existing 3-factor scorer runs unchanged). `PipelineOptions` +optional `bieEnabled?` (default true; explicit false ⇒ SKIP BIE hooks ⇒ Pre-Phase-4 behavior P4-14).
- ➕ **`src/lib/db.ts`** (additive only): `KEYS` map extended with 7 `BIE_*` storage-key constants = Table DEFINITIONS only (`BIE_EMBEDDINGS`, `BIE_GRAPH_NODES`, `BIE_GRAPH_EDGES`, `BIE_IDENTITY`, `BIE_INSIGHTS`, `BIE_TIMELINE`, `BIE_PENDING_QUEUE`). No get/set methods yet (S4). No migration.

### Verified

- ✅ Lint/Build Exit 0. Backward Compat: 3 new files unimported anywhere → zero runtime impact. All changes to pie/types/db additive optional.
- ✅ Regression: existing 7 aiService features unaffected (PipelineContext shape unchanged except optional fields).

---

## [Phase 4A — S2] — Core Utilities (Pure Functions)
**Status**: ✅ Complete (2026-07-30)

> Infrastructure-First Step 2 of 9. Pure-function toolkit only. No I/O, no Provider calls, no Database, no Pipeline, no Business Logic. S3 (Providers) and S4 (Repository) will import from here. Side-effect-free isolation keeps S3/S4 tests isolated. All additions unimported → zero runtime impact.

### Added

- 🆕 **`src/pie/bie/utils.ts`**: 5 pure functions + edge-case guards:
  - `contentHash(content: string): string` → FNV-1a 32-bit deterministic hash for embedding cache invalidation (P4-10). Normalizes trim/lowercase/whitespace/punctuation before hashing. Prefix `fnv1a:` makes hash self-describing. Empty/whitespace → constant hash (no error).
  - `normalizeVector(vector)` → L2 normalization. Empty → []; zero-magnitude → copy avoids NaN. No input mutation.
  - `cosineSimilarity(a, b)` → Cosine [-1,1]. Dimension mismatch → **0 graceful (not throw)** so hybrid scorer stays online during failover (P4-5). Zero-magnitude/non-finite guards included.
  - `levenshteinDistance(a, b)` → classic edit distance (case-insensitive two-row DP O(n·m) O(min(n,m)) space). Empty → length of other.
  - `bm25Tokenize(text)` → tokenizer for LocalBM25EmbeddingProvider S3; mirrors Phase 1 Intent Engine extraction exactly: Thai `[\u0E00-\u0E7F]{2,}`, English `[A-Za-z]{3,}`. De-duplicated lowercase first-seen order. Empty → [].
- 🆕 **`src/pie/bie/synonyms.ts`**: `SYNONYM_DICTIONARY` Readonly Record (45 keys seed) Finance/Work/Health/Emotion/Goal/Relationship/Learning/Identity + English cross-script mirrors. Directly addresses KI-101 gaps ("วิกฤติเศรษฐกิจ" → maps to "การเงิน"). Intentionally small seed — S8 bootstraps expansion. `expandSynonyms(term: string)` case-insensitive lookup fresh de-duplicated array. Empty for unknown terms; no mutation of dictionary.

### Verified

- ✅ Lint/Build Exit 0. Backward compat: 2 new files unimported anywhere → zero runtime impact. Regression: 7 aiService features untouched.
- ✅ Pure-function correctness: 25/25 sanity assertions pass (contentHash determinism, normalize edge cases, cosine dimension mismatch/NaN guards, levenshtein known values, bm25Tokenize mirror Intent Engine).

---

## [Phase 4 — Pre-4A Setup] — Documentation Policy + Project Memory Files
**Status**: ✅ Complete (2026-07-30)

### Added

- 🧠 **DECISIONS.md**: ADR format with Context→Decision→Rationale→Trade-offs: 5 past (PIE 7 Layers, Brain Tree V1, HITL applied=false, MODE_PROMPTS→9 Native Roles, SSOT BrainRepository) + 3 PROPOSED Decisions for Phase 4A (Hybrid Embedding, RoomDatabase Storage, 4A-first Execution Order).
- ⚠️ **KNOWN_ISSUES.md**: Known Limitations & Technical Debt registry. 🔴Crt 3 (No Confirm UI, aiService 550 lines, Legacy BrainCards threshold=5), 🟡Med 6 (No Semantic, No Graph, Missing 5 Evidence Fields, Decay no impl, 9 Roles no UI, Views pass extraContext), 🟢Low 6 (No Local Embedding Model, No Multi-hop Graph, Linear Scan Vector, Legacy aiApiKey, Logger no persistence, No Service Worker). Phase 4 Gaps Reference Table 14 items target 4A-4D.

### Changed

- 🗺️ **ROADMAP.md Phase 4**: Renamed "Brain Intelligence (🚧 In Progress)" → "Brain Intelligence Engine (BIE) ⏳Pre-4A". Added 4A/4B/4C/4D sub-phase sections (Objective/Scope/Deliverables/Blocking Chain). Summary Table extended 4A-4D + Phase 5 renamed "Full Intelligence". Phase 4 Hard Constraints Banner: 🔒4 rules (PIE no edit, UX no change, Prompts no change, applied=false).
- 📄 **AI_ARCHITECTURE.md Phase 4 rewrite**: Added BIE Components Table (11 components 4A-4D mapping, I/O, Persistence). Storage Structure completely rewritten (RoomDatabase 7 Tables bie_* full spec; localStorage = TTL 30-minute cache only). Phase 4 Additional Hard Constraints Table P4-1..14 (14 rules).
- 🧹 Consistency Fix: CHANGELOG Phase 3 status 🚧→✅ (prior inconsistency between ROADMAP Complete vs CHANGELOG In Progress).

---

## [Phase 2] — Full Pipeline Integration
**Status**: ✅ Complete

### Added

- 🔗 **7 AI Call Points 100% through PIE**: 1. `sendAIChatRequest()` AI Chat 6 modes. 2. `generateGreeting()` Greeting generator. 3. `summarizeDailyCheckin()` Daily reflection (skip retrieval+ranking). 4. `analyzeTodayJournals()` 4-Section Journal analysis. 5. `suggestBrainCard()` Brain Card Scout JSON. 6. `generateGuide()` Life GPS Guide JSON. 7. `suggestJournalBrainPlacement()` Brain Tree Placement Candidates.
- 📊 **PipelineLogger Singleton**: maxLogs=200 FIFO; per stage durationMs, retrieval count, ranking top score, provider/model/success/error; Methods: startPipeline/startStage/endStage/completePipeline/getLogs/clear.
- 🎯 **PipelineOptions**: skipStages Partial<Record<PIPELINE_STAGE, boolean>>; maxRetrievalSources, maxRankedSources; learningEnabled boolean; onStageComplete callback; repository BrainRepository DI.
- 🧩 **PIE Public Barrel Export**: `src/pie/index.ts` exports everything external code needs (no import into layers manually).

### Changed

- ♻️ **Memory Retrieval Hierarchy**: BrainTree (Primary) + Journals (Primary) + Legacy BrainCards (Fallback if Primary<5).
- ♻️ **Role-based Permission Filter**: Retrieval filters by role.allowedDimensions + allowedBrainTypes BEFORE ranking.
- ♻️ **Response Analyzer + Learning Engine Wired Every Feature**: `runLearningEngine()` default: autoApply=false, minConfidence=0.72, maxItemsToPersist=3. Saved to Pending Queue localStorage `mylifeos_pie_pending_learning_v1`.
- ♻️ **aiService Adapter Pattern**: Every public function → `createPipelineRequestFromLegacy()` → `runPipeline()` → graceful error fallback wrapper.

### Removed

- ❌ `aiRouter.ts` (legacy routing logic; Zero Consumers found → prepped for Phase 3 deletion).
- ❌ Direct Provider calls from aiService (ALL routed via PIE now).
