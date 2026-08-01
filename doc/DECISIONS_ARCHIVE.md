# DECISIONS_ARCHIVE.md — Archived ADRs (fait accompli, ไม่ได้ constrain step ปัจจุบันอีกต่อไป)

> ไฟล์นี้เก็บ ADR ที่ fait accompli แล้ว = Decision ทำเสร็จ ถูก implementation เรียบร้อย ไม่ได้ constrain การพัฒนา step ปัจจุบันอีกต่อไป
>
> อ่านเพื่อ Context ประวัติว่าทำไมถึงตัดสินใจแบบนั้นในอดีตเท่านั้น
>
> **สำหรับ Active ADR (ยังคง constrain step ปัจจุบัน) → ดู `/doc/DECISIONS.md`**

---

## 2026-07-31 (Runtime during S4 impl) — S4 Placeholder Strategy: Type-safe empty returns vs throw vs undefined

**Context:** S4 implementation of `RoomBrainIntelligenceRepository` implements 7 areas × 28 total methods from S1 BrainIntelligenceRepository interface. 4A scope = REAL storage today for Embeddings cache + Pending Queue ONLY. Remaining 5 areas (Graph Nodes/Edges, Identity, Insights, Timeline) have NO RoomDatabase storage tables/accessors in 4A (they ship 4B/4D). S4 has 3 valid choices:
- **Option A — Empty Return (Type-Safe Zeros):** Query methods return `[]` for arrays, `undefined` for single-row lookups. Write/upsert methods = NO-OP void return. Strictly typed: array return arity matches interface return type → no caller-null-check boilerplate, caller never throws even if it processes.
- **Option B — Throw "Not Implemented":** Every non-real method throws `new Error("Area Graph/Identity/Insights/Timeline not implemented until Phase 4B/4D")`. Fail-fast loud: no accidental silent "no data" where code expects data; no missed feature gaps.
- **Option C — undefined return + throw on writes:** Queries return undefined/null (type-optional, callers null-check). Writes throw (fail-fast only mutations). Mix of A + B.
4A Infrastructure-First S8 later will enable 4B/4D; 4A step is "hookup baseline" (P4-14 says pre-phase-4 behavior when disabled = keyword). Baseline behavior = pre-phase-4 is keyword 100% — 4A when enabled must coexist with that; empty-return = closest match to "no semantic/graph knowledge yet exists in a new brain" semantic.

**✅ Decision: Option A — Empty Return / Type-Safe Zeros. Uniform for ALL 5 placeholder areas (Graph/Identity/Insights/Timeline queries + writes)**

**Rationale:**
- Build time safety: 28 methods fully implemented at compile time → TypeScript --strict 100% (no "unimplemented" stubs, no any return, no ts-ignore). Interface is 100% satisfied per S1 signature.
- Caller code does not fail mid-pipeline: If S5/S6 accidentally triggers graph.getNodesByKind/identity.getSummary query during 4A baseline hookup → empty [] instead of throw → entire aiService feature stack passes regression (Option B/C would kill features 4/7 if S6 accidentally calls an unimplemented area during hybrid scoring context expansion).
- Pre-phase-4 match: P4-14 says "bieEnabled=false → pre-phase-4 behavior unchanged 100% keyword". If 4A enabled but graph empty → behavior same as no graph → equals pre-phase-4. Correctly represents "empty semantic knowledge" at S4 baseline.
- S8 can enable areas piecemeal: Swap each area one-by-one at S8 (when ready for 4B graph data) from empty-return → real RoomDatabase read/write. Zero arch refactor.
- Human-readable JSDoc placeholder comment per method clearly labels "4B / 4D implementation area" + 3-line TODO. No mysterious stubs.
- Trade-off vs throw: "Silent" data gaps are acceptable at 4A baseline because NO downstream feature actually *consumes* graph/identity/insights/timeline yet. 4B is where consumers land; 4A hookup = no consumers. Throwing here = premature failure for no benefit.

**Trade-offs:**
- Silent bug potential if graph consumers accidentally land pre-4B without real impl. Mitigation: EACH placeholder method carries JSDoc label "NOT IMPLEMENTED IN 4A — ship 4B.placeholder" + 2 console.info logs on write methods ONLY (reads are silent) so dev console shows "write to disabled area" when testing.
- 28 methods = 20 placeholders in a single file = larger file for 4A. 4B refactor = delete 20 empty placeholder impls and replace with real logic. File shrinks significantly per area.
- Empty arrays look like "valid result" = misleading in unit tests if tests assert results. For 4A unit tests assert `toEqual([])` explicitly with comment "placeholder; expect populated results in 4B".

---

## 2026-08-01 (Runtime during S6 impl — interface asymmetry) — S6 Unavoidable Sync→Async Plumbing: Promise-wrap + graceful skip on throw

**Context:** Memory Retrieval + Ranking Stage = today SYNC (S1 interface): `runMemoryRetrieval(ctx): PipelineContext` + `rankContext(ctx): PipelineContext` (pure sync transforms on context, no IO). BUT `SemanticService.embedText` / `batchEmbedTexts` = ASYNC (network API for Gemini, LocalBM25 sync but Promise-wrapped per interface, cache lookup = RoomDatabase Promise async). **Asymmetry.**
6 valid strategies, 3 ruled out:
- **Option A — Break backward compat:** Promisify `runMemoryRetrieval` / `rankContext` return types. **REJECTED P4-8 prohibits.**
- **Option B — Move BIE to new async PIE stage AFTER rankContext:** Run as side-effect Background Promise (P4-11 pattern). Populate semanticScore fields after return via mutable PipelineContext. **REJECTED:** `rankItems` ranks before sem scores attached = zero contribution. Hybrid scorer + rank = INTEGRATED into rank, not post-pass.
- **Option C — RoomBrainRepository Promise.makeSynchronous:** Block on `RoomDatabase.*` local reads. Build sync index. **REJECTED:** RoomDatabase = Promise API; no sync getters in PIE 7-layer contract 1-3. Would require add sync accessors on RoomDatabase = P4-8 signature breaking.
3 remaining valid strategies ranked:
- **Option D — Convert retrieval + ranking to async, PRESERVE caller signature via type narrowing:** Keep return type annotation `PipelineContext` (TypeScript allows — then await internally) — NO THIS IS WRONG. Actually: Make retrieval + ranking `async` functions → return `Promise<PipelineContext>` → update `runPipeline` to `await` stage5+stage6 internally. **Stage7 Response Generator already wrapped in async pattern.** Update PIPELINE_STAGES type signature for stages but (a) Existing stage signatures = functional style `ctx in → ctx out`. Additivity: allow `PipelineStageFunc = (ctx: PipelineContext) => PipelineContext | Promise<PipelineContext>`. runPipeline already has `ctx = await Promise.resolve(stageFunc(ctx))` for Response Generator Stage. **Zero signature change outward** (runPipeline async as today). Zero caller code change. P4-8 compliant = existing consumer behavior same before S6. This is our candidate.
- **Option E — Inline async IIFE wrapper inside rankContext:** `rankContext = (ctx) => { (async () => { enrich ctx.memory.rankedSources here with semanticScores ...})(); return ctx; }`. Background pattern P4-11 BUT scores populated *after* Stage7 Response Generator reads rankedSources = race condition. Rejected.
- **Option F — Lazy loading first-call async promise store first N queries, sync read for subsequent:** Preload top 50 brain tree embeddings at app start. 1st call = race. Rejected for Step 6 hookup correctness.

**✅ Decision: Option D — Internal conversion of memoryRetrieval + rankContext stages to async with Promise.resolve awaiter in runPipeline; zero outward signature change**

### Concrete Plumbing:

**Step1: PIPELINE_STAGES type update (NO value changes)**
- Type: `PIPELINE_STAGES: readonly string[]` unchanged. Value constant = 9 elements identical to today.
- Functional stage dispatch: rename type `PipelineStage` to accept `ctx → ctx | Promise<ctx>`. No type change for existing stages; this is covariance (widening return type = safe).

**Step2: runPipeline executor await**
- Replace dispatch for stage5 (retrieval) + stage6 (ranking): `ctx = stage(ctx)` → `ctx = await Promise.resolve(stage(ctx))`. Other stages keep sync fast path.
- Response stage 7 `responseGenerator = await Promise.resolve(...)` — pattern already exists; extend to 2 earlier stages.

**Step3: 2 call sites change only**
- `runMemoryRetrieval.ts`: signature → async. Body only change: wrap `...hybridRankItems(...)` block → `semanticScores = await buildSemanticScoreMapFromCandidates(...)` inside.
- `rankContext.ts`: signature → async (wait for stage5 result Promise). OR combine into single async retrieval+ranking.

**Rationale:**
- P4-8 Zero breaking: aiService public signature + PipelineContext + 9 stages constant = unchanged externally. Existing callers compile identically pre-S6. No signature changes, no import changes.
- Minimal code change surface: 2 files internal signature marked async; 1 runPipeline stage executor adds 2 Promise.resolve lines. Nothing else in codebase touched.
- Eliminates race conditions (Options E/F both have races): async stage dispatch = ordering enforced; Stage7 Blocked until Stage5+Stage6 fully settle.
- Future safe: Stage 8 Knowledge Graph / Identity queries during retrieval (Phase 4B) = async operations too; same plumbing already there, no new infrastructure needed.
- Simple fallback on failure: try/catch around buildSemanticScoreMap inside stage → `ctx.semanticScores = new Map()` (empty) → rankContext runs keyword scorer fallback = pre-phase-4 100% identical behavior (P4-14 disabled switch).

**Trade-offs:**
- Extra Promise await overhead per call: 2 extra microtask resolutions / async frame pushes. At personal scale N<50 queries/day → literally immeasurable. Overhead = ~0.1ms/call; negligible against network API (200ms+).
- runPipeline executor now has "which stages are async" knowledge = slight tight coupling to stage characteristics. Acceptable: documentation in runPipeline clearly labels "stages 5-6 are async because they do BIE embedding DB lookups + cache + optional API calls".
- Type covariance widening `PipelineStageFunc return type`: no actual harm but TypeScript strict noImplicitAny users must type the stage correctly. We declare types so no issue.
- Harder sync unit testing: Jest/Vitest `await runPipeline(...)` already required today for stage7 async; still just one await per pipeline call, not per stage. No extra test burden.
- Potential subtle bugs: If any sync downstream code depends on order of execution between stage5-6 being sync (e.g. pipeline logger stage duration timestamps for 5 vs 6) — logger updated to handle start/end times around `await` block (already does stage7 so pattern exists).
