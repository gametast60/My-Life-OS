# CHANGELOG_ARCHIVE.md — Archived Changelog Entries

> ⚠️ DATA GAP NOTICE (2026-08-01):
> ไฟล์นี้เดิมควรเก็บ Changelog แบบละเอียดของ Phase 4A S1-S5 และ Phase 2
> แต่เนื้อหาถูกวางผิดเป็นสำเนาซ้ำของ ROADMAP_ARCHIVE.md มาก่อนหน้านี้
> ผลคือ Changelog ระดับ step ของ Phase 4A S1-S5 และ Phase 2 สูญหายถาวร
> (ไม่ได้กู้คืนจาก Git — เป็นการตัดสินใจยอมรับ trade-off)
>
> หากต้องการ context ย้อนหลังของ step เหล่านั้น ให้ใช้แทน:
> - AI_ARCHITECTURE_ARCHIVE.md (มี summary ระดับไฟล์/component ของ S1-S7)
> - DECISIONS_ARCHIVE.md (มี ADR rationale เชิงลึกของ S4, S6)
> - ROADMAP_ARCHIVE.md (มี milestone-level Objective/Delivered/Remaining ของ Phase 2 และ Phase 4B/4C/4D)
>
> ตั้งแต่บรรทัดนี้เป็นต้นไป ไฟล์นี้ใช้เก็บ Changelog entries ที่ย้ายมาจาก CHANGELOG.md ตามกฎ SI-3 (เริ่มเก็บใหม่จาก Phase 4A/4B/4C ที่ย้ายมาในงานนี้ — ดู entries ด้านล่าง)

---

## Compressed Summary Index

- [Phase 4A — S9] Regression & Docs Gate — DELIVERED 2026-08-01. Verified: build/lint 0 errors, bieEnabled=false/true static traces confirmed, HYBRID_WEIGHT_SUM guard verified. รายละเอียดเต็มอยู่ด้านล่างไฟล์นี้.
- [Phase 4A — S8] Tuning & Weight Calibration — DELIVERED 2026-08-01. Added named hybrid weights, synonym dictionary guards, and additive hybrid sort path. รายละเอียดเต็มอยู่ด้านล่างไฟล์นี้.
- [Phase 4A — S7] Disable Switch Integration — DELIVERED 2026-08-01. Added bieEnabled threading guard preserving Pre-Phase-4 retrieval baseline on explicit false. รายละเอียดเต็มอยู่ด้านล่างไฟล์นี้.
- [Phase 4A — S6] Wire Hooks into PIE Layers — DELIVERED 2026-08-01. Added BIE enrichment hooks with graceful fallback and preserved legacy sort order. รายละเอียดเต็มอยู่ด้านล่างไฟล์นี้.
- [Phase 4B — S16] Phase 4B Closeout & Regression Gate — DELIVERED 2026-08-01. Knowledge Graph + Relationship Engine delivered across S10-S16 with HITL invariants verified. รายละเอียดเต็มอยู่ด้านล่างไฟล์นี้.
- [Phase 4B — S15] Graph Context Enrichment & Inference Engine — DELIVERED 2026-08-01. Added transitive inference and graph-aware retrieval context formatting. รายละเอียดเต็มอยู่ด้านล่างไฟล์นี้.
- [Phase 4B — S14] Relationship Extraction Engine — DELIVERED 2026-08-01. Added relationship extraction and pending proposal routing. รายละเอียดเต็มอยู่ด้านล่างไฟล์นี้.
- [Phase 4B — S13] Graph Query & Neighbourhood Traversal — DELIVERED 2026-08-01. Added read-only graph traversal helpers. รายละเอียดเต็มอยู่ด้านล่างไฟล์นี้.
- [Phase 4B — S12] Graph Persistence & Repository Write Layer — DELIVERED 2026-08-01. Added real graph storage and confirm-safe write layer. รายละเอียดเต็มอยู่ด้านล่างไฟล์นี้.
- [Phase 4B — S11] Entity Resolution & Duplicate Tag Matcher — DELIVERED 2026-08-01. Added duplicate candidate detection and merge dry-run report support. รายละเอียดเต็มอยู่ด้านล่างไฟล์นี้.
- [Phase 4B — S10] Knowledge Graph + Relationship Engine Kickoff — DELIVERED 2026-08-01. Added graph type contracts and pending-queue proposal scaffolding. รายละเอียดเต็มอยู่ด้านล่างไฟล์นี้.
- [Phase 4C — S22] Phase 4C Closeout & Regression Gate — DELIVERED 2026-08-01. Reflection phase closed out with full regression and HITL invariant checks. รายละเอียดเต็มอยู่ด้านล่างไฟล์นี้.
- [Phase 4C — S21] Background Reflect Job Runner — DELIVERED 2026-08-01. Added non-blocking reflection orchestrator with four-stage cycle. รายละเอียดเต็มอยู่ด้านล่างไฟล์นี้.
- [Phase 4C — S20] Brain Tree Decay Calculation Engine — DELIVERED 2026-08-01. Added decay engine and batch calculation helpers. รายละเอียดเต็มอยู่ด้านล่างไฟล์นี้.
- [Phase 4C — S19] Contradiction & Conflict Detector — DELIVERED 2026-08-01. Added conflict detection and pending-queue routing. รายละเอียดเต็มอยู่ด้านล่างไฟล์นี้.
- [Phase 4C — S18] Evidence Consolidation Engine — DELIVERED 2026-08-01. Added evidence consolidation and dangling-reference cleanup paths. รายละเอียดเต็มอยู่ด้านล่างไฟล์นี้.
- [Phase 4C — S17] Reflection Type & Provider Contracts Kickoff — DELIVERED 2026-08-01. Added reflection contracts and module stubs. รายละเอียดเต็มอยู่ด้านล่างไฟล์นี้.

---

## Full Details

### [Phase 4A — S9] Regression & Docs Gate
**Status**: ✅ Complete (2026-08-01)

### Verified
- ✅ `npm run build` Exit 0 (vite + esbuild; 2149 modules transformed, no TS errors).
- ✅ `npm run lint` (tsc --noEmit) Exit 0.
- ✅ Static trace bieEnabled=false: S7 guard fires first and returns legacy before any S8/BIE code; zero semanticService/VectorIndex instantiation confirmed.
- ✅ Static trace bieEnabled=true: `hybridRankItems()` runs and returns hybrid-sorted legacy results.
- ✅ `hybridScorer.ts` `HYBRID_WEIGHT_SUM` guard verified.
- ✅ `synonyms.ts` `validateSynonymDictionary()` exported; 50+ synonym pairs confirmed.
- ✅ All 7 aiService facade methods UNTOUCHED (P4-8 compliant).

### [Phase 4A — S8] Tuning & Weight Calibration
**Status**: ✅ Complete (2026-08-01)

### Added
- 📦 `hybridScorer.ts`: named exported weights and `HYBRID_WEIGHT_SUM` guard.
- 📚 `synonyms.ts`: synonym dictionary bootstrap and optional expansion helpers.
- 🔀 `RoomBrainRepository.ts`: conditional hybrid sort enable path while preserving pre-4 behavior when disabled.

### Verified
- ✅ Build Exit 0 · Lint/tsc Exit 0 post-S8.
- ✅ bieEnabled=false trace remains byte-identical to pre-Phase-4 baseline.
- ✅ P4-8 additive-only compliance preserved.

### [Phase 4A — S7] Disable Switch Integration (bieEnabled Threading Layer)
**Status**: ✅ Complete (2026-08-01)

### Added
- 🔌 Threaded `bieEnabled` through `PipelineContext`, repository signatures, and memory retrieval path.
- 🛡️ Early-return guard before BIE module instantiation when `bieEnabled === false`.

### Verified
- ✅ Build and lint exit 0.
- ✅ Guard location ensures zero BIE constructor calls and zero embedding HTTP calls on disabled path.
- ✅ Backward compatibility preserved for default/undefined and enabled modes.

### [Phase 4A — S6] Wire Hooks into PIE Layers (Preserve Signatures)
**Status**: ✅ Complete (2026-08-01)

### Added
- 🔌 BIE enrichment hook in `RoomBrainRepository.getRelevantMemory()` with graceful fallback.
- 🧩 Additive score assignments onto existing legacy result objects while preserving legacy sort order.

### Verified
- ✅ Build and lint exit 0.
- ✅ Any BIE throw falls back to the unmodified legacy result.
- ✅ HITL invariant remains intact; no structural writes occur in this step.

### [Phase 4B — S16] Phase 4B Closeout & Regression Gate
**Status**: ✅ Complete (2026-08-01)

### Added
- 🏆 Phase 4B delivered end-to-end across S10-S16.
- 🧪 Full regression audit: lint/build exit 0.
- 🔒 HITL invariants verified across graph modules and pending-queue routing.

### [Phase 4B — S15] Graph Context Enrichment & Inference Engine
**Status**: ✅ Complete (2026-08-01)

### Added
- 🧠 Added transitive inference and graph-aware context enrichment for retrieval.
- 📦 Exposed new graph inference exports through the BIE graph barrel.

### Verified
- ✅ Build and lint exit 0.
- ✅ Read-only inference path preserves HITL invariants.

### [Phase 4B — S14] Relationship Extraction Engine
**Status**: ✅ Complete (2026-08-01)

### Added
- 🔍 Added relationship extraction and pending-queue routing helpers.
- 🔒 Candidate edges are always proposed as `applied: false` HITL items.

### Verified
- ✅ Build and lint exit 0.
- ✅ Zero auto-applied writes to graph DB.

### [Phase 4B — S13] Graph Query & Neighbourhood Traversal
**Status**: ✅ Complete (2026-08-01)

### Added
- 🔍 Added read-only graph traversal methods for neighbourhood and shortest path queries.
- 🔀 Added additive repository query methods for graph nodes/edges.

### Verified
- ✅ Build and lint exit 0.
- ✅ Zero DB write side effects.

### [Phase 4B — S12] Graph Persistence & Repository Write Layer
**Status**: ✅ Complete (2026-08-01)

### Added
- 🗄️ Added persistent graph node/edge storage and repository write implementations.
- 🔒 Added confirm-safe graph edge application path with HITL invariant preserved.

### Verified
- ✅ Build and lint exit 0.
- ✅ Graph writes require explicit confirm path rather than direct apply.

### [Phase 4B — S11] Entity Resolution & Duplicate Tag Matcher
**Status**: ✅ Complete (2026-08-01)

### Added
- 🔍 Added duplicate candidate detection, merge report generation, and entity normalization helpers.

### Verified
- ✅ Build and lint exit 0.
- ✅ Merge operations remain read-only until confirmed.

### [Phase 4B — S10] Knowledge Graph + Relationship Engine Kickoff
**Status**: ✅ Complete (2026-08-01)

### Added
- 📦 Added graph type contracts, repository stubs, and pending-queue proposal types.
- 🔀 Added additive widening for knowledge graph contracts and repository signatures.

### Verified
- ✅ Build and lint exit 0.
- ✅ HITL-friendly proposal types enforce `applied: false`.

### [Phase 4C — S22] Phase 4C Closeout & Regression Gate
**Status**: ✅ Complete (2026-08-01)

### Verified
- ✅ `npm run lint` and `npm run build` exit 0.
- ✅ Reflection proposals carry `applied: false` invariants across the full stack.
- ✅ Phase 4C closed out successfully and handed off to Phase 4D.

### [Phase 4C — S21] Background Reflect Job Runner (P4-11)
**Status**: ✅ Complete (2026-08-01)

### Added
- 🔄 Added a non-blocking reflection cycle orchestrator with four-stage execution.
- 🔒 Reflection proposals route into the pending queue with `applied: false` semantics.

### [Phase 4C — S20] Brain Tree Decay Calculation Engine
**Status**: ✅ Complete (2026-08-01)

### Added
- 📉 Added decay configuration rules and batch/standalone calculation helpers.

### [Phase 4C — S19] Contradiction & Conflict Detector
**Status**: ✅ Complete (2026-08-01)

### Added
- ⚡ Added conflict detection with pending-queue routing helpers.
- 🔒 Generated conflict proposals enforce HITL-safe `applied: false` state.

### [Phase 4C — S18] Evidence Consolidation Engine
**Status**: ✅ Complete (2026-08-01)

### Added
- 🧹 Added evidence consolidation helpers for tag reassignment and dangling-reference cleanup.

### [Phase 4C — S17] Reflection Type & Provider Contracts Kickoff
**Status**: ✅ Complete (2026-08-01)

### Added
- 📦 Added reflection type contracts, provider stubs, and module entry points.
- 🔀 Added additive widening for reflection-related BIE pending kinds.

