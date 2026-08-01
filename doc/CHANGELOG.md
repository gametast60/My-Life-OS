# Changelog — My Life OS AI Architecture

> รูปแบบอ้างอิงจาก [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
>
> **ไฟล์นี้เก็บเฉพาะ:**
> - Phase ปัจจุบัน + Sub-step ล่าสุด (Phase 4A — S7, S6)
> - Phase ก่อนหน้า 1 อัน (Phase 3)
>
> **สำหรับ step/phase ที่เก่ากว่า (4A S5, S4, S3, S2, S1, Pre-4A Setup, Phase 2) ดูไฟล์แยก:**
> → `/doc/CHANGELOG_ARCHIVE.md` (Compressed Summary Index ด้านบน + Full Detail ด้านล่าง)
>
> **กฎอัปเดต (ดู STANDING_INSTRUCTIONS.md):** ทุก step append section ใหม่บนสุด สั้นๆ ไม่เกิน ~15 บรรทัดต่อ step

---

## [Phase 4A — S9] — Regression & Docs Gate
**Status**: ✅ Complete (2026-08-01)

### Verified
- ✅ `npm run build` Exit 0 (vite + esbuild; 2149 modules transformed, no TS errors).
- ✅ `npm run lint` (tsc --noEmit) Exit 0.
- ✅ Static trace bieEnabled=false: S7 guard at `RoomBrainRepository.ts` L181 fires FIRST → returns `legacy` BEFORE any S8/BIE code; zero semanticService/VectorIndex instantiation confirmed.
- ✅ Static trace bieEnabled=true: `hybridRankItems()` runs → `hybridSortedLegacy` returned sorted DESC at L371.
- ✅ `hybridScorer.ts` HYBRID_WEIGHT_SUM IIFE verified throws on Σ≠1.0 drift.
- ✅ `synonyms.ts` `validateSynonymDictionary()` exported; 50+ synonym pairs confirmed.
- ✅ All 7 aiService facade methods UNTOUCHED (P4-8 compliant).
- [Doc Skip] AI_ARCHITECTURE.md — S9 is doc+regression gate only; zero architecture change.

## [Phase 4A — S8] — Tuning & Weight Calibration
**Status**: ✅ Complete (2026-08-01)

### Added
- 📦 `hybridScorer.ts`: 6 private weight literals → Named exported constants (`HYBRID_WEIGHT_KEYWORD/SEMANTIC/TAG/DIMENSION/RECENCY/CONFIDENCE`), `HYBRID_WEIGHTS` bundle object, runtime `HYBRID_WEIGHT_SUM` Σ=1.0 guard (throws on drift), `DEFAULT_SEMANTIC_RELEVANCE_THRESHOLD=0.60` export.
- 📚 `synonyms.ts`: 15+ new core Thai/Eng synonym pairs (happiness, motivation, discipline, mindfulness, growth, conflict, loneliness, courage, purpose, value, communication, habit, reflection, time, success, feedback + mirrors). `validateSynonymDictionary()` bootstrap guard. `expandSynonyms(term, opts?)` widened with optional `{caseInsensitive, stripTones}` (additive — zero breaking change).
- 🔀 `RoomBrainRepository.ts`: Conditional hybrid sort enable — `bieEnabled=true` → return array sorted hybridScore DESC; `bieEnabled=false` → S7 guard at L181 fires BEFORE S8 code, byte-identical Pre-4.

### Verified
- ✅ Build Exit 0 · Lint/tsc Exit 0 post-S8.
- ✅ bieEnabled=false static trace: S7 guard fires at L181 BEFORE any S8 block — ZERO semanticService/VectorIndex instantiation.
- ✅ P4-8 Additive-only: 3 files modified; 0 files outside ALLOWED list; aiService.ts 7 facade UNTOUCHED.
- [Doc Skip] AI_ARCHITECTURE.md — S8 tuning weights + threshold only; no architecture change (layer diagram, data flow, folder structure unchanged).

## [Phase 4A — S7] — Disable Switch Integration (bieEnabled Threading Layer)

**Status**: ✅ Complete (2026-08-01)

> Infrastructure-First Step 7 of 9. P4-14 Future-Proof Disable Switch — full opt-out
> plumbing layer for BIE (Brain Intelligence Engine). Short-circuits at TOP-OF-TRY guard
> BEFORE `createDefaultSemanticService()` / `new VectorIndex()` when explicit `bieEnabled===false`.
> Zero BIE constructor calls, zero embedding HTTP calls, zero cache writes — output byte-identical Pre-Phase-4.

### Added

- 🔌 **bieEnabled Disable Switch threading pathway (4 touch-point files, additive P4-8 widening only):**
  - **Touch 1** `PipelineContext` widening: Resolved `bieEnabled: boolean` field on context.options (via `createEmptyContext()` 3-line resolver), visible to ALL 7 PIE layers without modifying layer signatures. S1-declared optional `PipelineOptions.bieEnabled?` is the ONLY input flag used.
  - **Touch 2** `BrainRepository` interface widening: `getRelevantMemory` params + `RequestContextOverride` nested options slot (dual-path threading route so future callers can pack BIE flags either way).
  - **Touch 3** `memoryRetrieval` repo-call: Single-line pass-through `bieEnabled: ctx.options.bieEnabled` from retrieval layer → repo guard.
  - **Touch 4** Concrete `RoomBrainRepository` signature mirror: Additive `bieEnabled?` optional field so concrete impl matches freshly-widened interface (0 behavioral change — pure TS align).
- 🛡️ **S6 hook TOP-OF-TRY guard (1 5-line insertion, 0 existing S6 lines touched):**
  `bieEnabled===false` (dual-path: top-level params OR nested requestContext.options) → returns `legacy` DIRECTLY before S5 module instantiation. Output array byte-identical Pre-Phase-4 keyword-only 3-factor ranking (zero `.semanticScore`/`.tagMatchScore`/`.graphScore` mutation on disabled path).

### Changed (strictly P4-8 widening only)

- ➕ `PipelineContext.options` field widened to include resolved `bieEnabled: boolean` (populated by `createEmptyContext()`; spread-transitive so zero call-site changes).
- ➕ `BrainRepository.getRelevantMemory` params widened with optional `bieEnabled?`; nested options slot added to `RequestContextOverride`.
- ➕ `memoryRetrieval.ts`: 1 additive line threads the flag.

### Verified

- ✅ Build (Exit 0) · ✅ Lint / Type Check (tsc --noEmit Exit 0)
- ✅ P4-8 Signature Compliance: aiService 7 public facade functions byte-for-byte UNTOUCHED (verified 0 lines modified); no removals/narrowing.
- ✅ Guard Location Correctness: Guard is first statement inside S6 try block; S5 constructors (`settings`, providers, `createDefaultSemanticService`, `new VectorIndex`) appear AFTER the early-return — zero instantiation on disabled path.
- ✅ Default (bieEnabled unset = undefined) behavior = S6 unchanged: condition `false===false` is false, so S6 hook runs identically.
- ✅ 7 aiService features · Brain Tree CRUD · Legacy fallback threshold=5 · Prompt 9 Roles = untouched 100% (no UX change, no S1-S5 file modification).

### Backward Compat Invariants

- `bieEnabled=undefined` (99% current callers): S6 byte-identical behavior (rows enriched + legacy sort order preserved)
- `bieEnabled=true`: identical to undefined path (opt-out model = default-on)
- `bieEnabled=false`: Pre-Phase-4 keyword-only ranking (zero embeddings, zero vector search, zero field mutations)

---

## [Phase 4A — S6] — Wire Hooks into PIE Layers (Preserve Signatures)
**Status**: ✅ Complete (2026-08-01)

> Infrastructure-First Step 6 of 9. First consumer of S1–S5.
> PRE-EXISTING LEGACY 3-factor keyword retrieval path inside `RoomBrainRepository.getRelevantMemory()`
> PRESERVED 100% intact → produces SAME row array as always; BIE hook wraps with post-processing enrichment
> filling S1 optional fields `.semanticScore?` / `.tagMatchScore?` / `.graphScore=0` on EXISTING element refs.
> SAME sort order preserved (no re-sort by hybridScore in S6 — deferred to S8).
> Global try/catch: ANY BIE failure (no providers / network / quota / LocalBM25 degenerate / throws) → silent `console.warn` + fall-through to UNMODIFIED legacy result.
> Backward guarantee: `bieEnabled=false` OR any BIE throw → pipeline byte-for-byte identical to Pre-Phase-4.

### Added

- 🔌 **BIE enrichment hook in RoomBrainRepository.getRelevantMemory()** (single modified file per hard constraint):
  - Imports (zero dead code): `createDefaultSemanticService`, `VectorIndex`, `hybridRankItems`/types, `cosineSimilarity`, `EmbeddingRecord`.
  - Guard + Failure envelope: Global try/catch → fallback `legacy` untouched.
  - **DI + shared-repo consistency pattern (P4-9 interface-DI + single-repo cache read-after-write):** `settings = this.getSettings()` → providers → semanticService = `createDefaultSemanticService(providers)`. Extracts same concrete `bieRepo` instance used internally by semanticService → passes into `new VectorIndex(sharedBieRepo, semanticService)` so embedding cache written in batchEmbed is readable immediately by vectorIndex.
  - Candidate batching (index 1:1 preservation invariant): Loop over legacy[] once → build parallel `allTexts` + `scorableItems` arrays with kind→confidence weights exactly mirroring `contextRanking.ts` values (brain_tree_tag=0.95, journal=0.90, brain_card_legacy=0.85, else 0.5 + tag.priority*0.1 clamp 1.0).
  - S5 embed pipeline (Option Y — 1× query embed + direct per-candidate cosine): Step 1 `batchEmbedTexts(allTexts)` cache-first; Step 2 `embedText(queryText=keywords.join(' '))` → queryVec; Step 3 per slot `cosineSimilarity(queryVec, candidateVec)` clamp [0,1] → `Map<embeddingId,cosineScore>` matches hybridScorer's `ctx.semanticScores` contract.
  - Dimension filter flag: filterDimension = single-dim case → enables DIM_WEIGHT factor in hybridScorer; multi/no-dim → neutral 0.5.
  - S5 hybridRankItems + PRESERVED LEGACY SORT ORDER BASELINE: Returns rows DESC sorted by hybridScore but S6 DISCARDS this sorted order; copies ONLY per-row `.semanticScore` and `.tagMatchScore` values onto the SAME LEGACY ARRAY INDICES (sort order identical to pre-S6 3-factor keyword-only pipeline; hybrid-sort enablement deferred to S8).
  - Additive score assignments (P4-8 strictly additive, zero existing field overwrite): For each legacy[i] write `semanticScore=clamp01(ranked[i]?.semanticScore ?? 0)`, `tagMatchScore=clamp01(ranked[i]?.tagMatchScore ?? 0)`, `graphScore=0` (4B placeholder).
- 🔌 **Unavoidable async plumbing (3 minimal signature touch-points — JS cannot sync-wait Promise):**
  - `BrainRepository` Interface return type WIDENED from `RetrievalSource[]` → union `Promise<RetrievalSource[]> | RetrievalSource[]` (widening, not narrowing; older sync impls continue to satisfy the interface).
  - `memoryRetrieval.ts`: `retrieveMemory` → `async` (added `instanceof Promise ? await : unwrap`); `runMemoryRetrieval` → `async Promise<PipelineContext>` (all body logic preserved, only the extra await localized).
  - `pipeline.ts`: 0 lines changed (runStage already has `instanceof Promise → .then(finalize)` branch from Phase 1). `aiService.ts`: 0 lines changed (all 7 facade functions were `async` Phase 1 already).

### Verified

- ✅ Build (0 errors) · ✅ Lint / tsc --noEmit (0 errors) · ✅ Signature Compliance (aiService 7 facade functions UNTOUCHED byte-for-byte S5 state)
- ✅ PipelineOptions Compatibility (only S1 `bieEnabled?` flag used; no new options declared)
- ✅ Backward Grace: Global catch → any throw → legacy untouched. Early-return on `legacy.length===0` (zero-overhead skip before S5 instantiation)
- ✅ 7 aiService features 100% transparent: `aiService` already `await runPipeline()` since Phase 1; `pipeline.ts` already Promise-aware.
- ✅ No S5 file body modification (semanticService/vectorIndex/hybridScorer imported AS-IS; zero monkey-patches).
- ✅ No S1 type re-declaration; `.semanticScore`/`.tagMatchScore`/`.graphScore` assigned via optional fields declared in S1 (pie/types.ts L50/52/54). Zero new types.
- ✅ Preserved Legacy Sort Order (S6 baseline). Output = same `legacy` reference same element order same element refs; `ranked` sorted order DISCARDED for output (sorting by hybrid deferred to S8).
- ✅ HITL invariant: Only write via `semanticService.batchEmbedTexts` → `saveEmbedding` cache fill (explicitly allowed value-neutral embedding cache write). No appendPendingBieItem, no graph/identity/insight/timeline writes, no BrainTree. `applied` not referenced.

---

## [Phase 3] — Clean Architecture & Documentation
**Status**: ✅ Complete (2026-07-30)

> 🧹 Clean Architecture Gate: แยก BrainRepository เป็น Single Source of Truth, ลบ Duplicate Logic ออกจาก memoryRetrieval, แปลง aiService ให้เป็น Facade ล้วน (ลบ MODE_PROMPTS ซ้ำ). สร้างเอกสาร 4 ไฟล์หลัก (AI_ARCHITECTURE, ROADMAP, CHANGELOG, DECISIONS, KNOWN_ISSUES) + 9 Native Roles จัดระเบียบ Persona/Prompt.

### Added

- 🏗️ `BrainRepository: RequestContextOverride` interface — backward compatibility when Views pass own brainCards/recentJournals (UX unchanged 100%).
- 📄 **AI_ARCHITECTURE.md** — Full AI architecture doc: Arch Diagram + Dependency Rule, PIE 7 Layers Deep Dive, HITL Flow, BrainRepository Pattern, 9 Native Roles Table, Brain Tree V1 Model/Growth, Folder Structure, Chat Data Flow Step-by-step, 6 Hard Constraints.
- 🗺️ **ROADMAP.md** — Phase 1 → 5: Objective / Completed / Remaining / Next Phase per phase + Summary Table (Phase, Name, Status, Deliverable).
- 📋 **CHANGELOG.md** — Changelog (ไฟล์นี้; Keep-a-Changelog format).
- 🆕 aiService exports: `getRoleForLegacyMode(mode): AIRoleId` helper, `LEGACY_MODE_CONFIG` (mode → {roleId, customSystemPrompt?}).

### Changed

- 🔧 **Critical Syntax Fix**: `contextRanking.ts` L141 — `rankContext()` function body missing closing brace → added before `runContextRanking()` export (single dead-block preventing build).
- ♻️ **BrainRepository = SSOT DRY**: `getRelevantMemory()` + `getJournals()` signature refinement; concrete RoomBrainRepository adds overrideCards/overrideJournals params for Data Source override (via requestContext) before DB fallback; adds internal `JournalLike` alias.
- ♻️ **Memory Retrieval Repository-only (DRY cleanup)**: `memoryRetrieval.ts` 272 → 67 lines. Removed: 6 duplicate helper functions (`keywordMatches`/`dimensionAllowed`/`brainTypeAllowed` + 3 `convert*ToSources` + legacy self-convert fallback path). Added: `extractRequestContext()` for extraContext brainCards/recentJournals extraction. **ALWAYS** resolves via single `resolveRepository(options).getRelevantMemory()`.
- 🧹 **aiService Facade cleanup (removed MODE_PROMPTS duplicated 7 legacy prompts)**: Replaced with `LEGACY_MODE_CONFIG` — Coach/Therapist/Decision/Reflection/Chat → Native Role Persona directly; Future Self → coach id + inline customSystemPrompt (5y viewpoint UX variant unique); Secretary → planner id + inline customSystemPrompt (task/checklist UX variant unique). `sendAIChatRequest` reads from LEGACY_MODE_CONFIG instead of MODE_PROMPTS + MODE_TO_ROLE. MODE_TO_ROLE still exported for backward compat; now computes from LEGACY_MODE_CONFIG not hardcoded duplicate.

### Removed

- ❌ Dead code in memoryRetrieval: 3 convert*ToSources duplicates, 3 duplicate helpers, legacy self-convert fallback path (outside-Repo DIY path).
- ❌ MODE_PROMPTS Record: 7 legacy prompt strings duplicated with Native 9 Role Persona → fully superseded by LEGACY_MODE_CONFIG (uses Role Persona + per-viewpoint customSystemPrompt for UX variants only).
- ❌ aiRouter.ts: Zero consumers (removed prior audit in Phase 2).

### Fixed

- 🐛 Critical Syntax: contextRanking.ts rankContext() missing closing brace — fixed so tsc build passes.

---

### 💡 สำหรับ 4A S5, S4, S3, S2, S1, Pre-4A Setup, Phase 2 → ดู `/doc/CHANGELOG_ARCHIVE.md`
