# ROADMAP — My Life OS (Status Hot File)

> ไฟล์นี้เก็บเฉพาะ Status Sections ที่แก้บ่อยเท่านั้น (สำหรับ Toggle Status ทุก Step / Phase Progress)
>
> - Past Delivered Phases Full Detail (Phase 1/2/3 Objective/Completed/Remaining Text เต็ม) → `/doc/ROADMAP_ARCHIVE.md`
> - Future Planned Phases Full Detail (Phase 4B/4C/4D + Phase 5 Full Scope/Deliverables เต็ม) → `/doc/ROADMAP_ARCHIVE.md`
> - ไฟล์หลักนี้ = Status Only (100% targeted line edit ทุก step ไม่ต้อง regenerate ทั้งไฟล์)

---

## 🎯 My Life OS — Project Overview
| ด้าน | รายละเอียด |
|------|-----------|
| **ภาษา** | React + TypeScript + Vite + Tailwind CSS |
| **Storage** | IndexedDB (`idb` lib) 14 Tables (RoomDatabase) |
| **สถาปัตยกรรม AI** | PIE = Personal Intelligence Engine — 9 Layers + `PipelineContext` Unified Context |
| **Brain Knowledge** | 4-Chain Hierarchy: `BrainTreeType` → `Dimension` → `Tag` → `Evidence` (RPG Growth Exponential Level) |
| **Philosophy** | AI มีหน้าที่เสนอ — ผู้ใช้มีหน้าที่ตัดสินใจ (HITL applied=false 100% จน Confirm UI) |
| **ถัดไป** | **Phase 4C** (Phase 4B = ✅ Complete 100%; Handoff to 4C — Memory Intelligence & Reflection) |

---

## 🚀 Phase 4 — Brain Intelligence Engine (BIE)

### 📍 CURRENT PHASE STATUS BANNER (Toggle Status Per Step — targeted edit):

```
═══════════════════════════════════════════════════════════
  PHASE 4C:  MEMORY INTELLIGENCE + REFLECTION ENGINE
  ENGINEERING STYLE:  INFRASTRUCTURE-FIRST
  CONSTRAINTS:   P4-2 UX No Change   P4-8 Backward Compat
                 P4-12 HITL          P4-11 Async Reflect
  PROGRESS:  █████████████████████████ 6/6 Steps S17–S22 (✅ PHASE 4C COMPLETE)
  NEXT:      → Phase 4D: Identity + Insight + Life Timeline
═══════════════════════════════════════════════════════════
```

---

### ⚙️ PHASE 4A WORK ORDER (Toggle Status per cell — targeted line edit ห้าม regenerate)

| Sub-step | ชื่องาน | Scope สั้น | Status |
|----------|---------|------------|--------|
| S1 | Type + Interface Contracts | 3 new files; types.ts + db.ts additive | ✅ Complete 2026-07-30 |
| S2 | Core Utilities Pure Functions | contentHash, normalize, cosine, levenshtein, bm25Tokenize, synonyms.ts | ✅ Complete 2026-07-30 |
| S3 | Default Provider Implementations | Gemini HTTP (768-dim) + Local BM25 Offline (384-dim) Provider classes | ✅ Complete 2026-07-31 |
| S4 | Repository + DB Schema Extensions | RoomBrainIntelligenceRepository implements 28 methods + RoomDatabase bie_* get/save | ✅ Complete 2026-07-31 |
| S5 | Indexing + Scoring Logic | SemanticService cache-first orchestrator + VectorIndex linear cosine + HybridScorer 6-factor Σ=1.0 | ✅ Complete 2026-08-01 |
| S6 | Wire Hooks into PIE Layers + Graceful Skip | Promise wrap retrieval/ranking async; Option Y query-cosine semantic lookup; Preserve legacy keyword sort order | ✅ Complete 2026-08-01 |
| S7 | bieEnabled=false Pre-Phase-4 Integrity Baseline Thread | 7 features zero impact; Arrays byte-for-byte identical | ✅ Complete 2026-08-02 |
| **S8** | **Tuning + Weight Calibration** | 6-factor weights [0.2-0.3-0.15-0.1-0.1-0.15] Σ=1 Sweep, Synonym Seed Bootstrap Expansion, Optional hybrid sort enable path, Keyword BM25 Precision/Recall Threshold, Lint/Build/L7 Regressions | ✅ Complete 2026-08-01 |
| S9 | Phase 4A Closeout Banner + Doc + Regressions | Banner + Doc Tidy + 7 features × (bieEnabled T/F) + Lint/Build 0 errors | ✅ Complete 2026-08-01 |

**Blocking Chain Note:** 4A → 4B (Knowledge Graph Build) → 4C (Memory Intelligence) → 4D (Identity/Insight/Timeline) → Phase 5 (Full Integration)

---

### 🔒 PHASE 4A ACTIVE SCOPE (สำหรับอ้างอิง Constraints):

Focus = Semantic Retrieval + Hybrid Search เท่านั้น (NOTHING OUTSIDE THIS LIST):
1. 🧠 Hybrid Embedding: Gemini HTTP API Primary + Local BM25+Synonyms Fallback (Provider Interface DI)
2. 🗄️ Embedding Storage: `bie_embeddings` RoomDatabase Table; Pending Queue `bie_pending_queue` for auto-proposals
3. 🔎 Vector Index: Linear Scan Cosine Similarity (no FAISS/HNSW — Phase 4B/4D scale-up)
4. 🧮 6-Factor Hybrid Rank: Keyword 20 / Semantic 30 / Tag 15 / Dimension 10 / Recency 10 / Confidence 15 = Σ=100
5. 🪝 Hook Integration: BIE Semantic Layer → Memory Retrieval + Ranking Stage → PIE Pipeline (Preserve signature)
6. 🚫 Disable Switch: `bieEnabled?: boolean` PipelineOptions (default true; explicit false = Pre-4A Keyword-Only 100%)
7. 🧪 Regression Gate: Build + Lint + 7 AI Features + PIE Stage Integrity (PASS before move S8→S9)

---

## 📊 Overall Progress Summary Table

| Phase | ชื่อ | วัตถุประสงค์สั้นๆ | Start | Status | % |
|-------|------|-------------------|-------|--------|---|
| 1 | Foundation + 9 AI Features | โครงสร้างฐานระบบ, Storage, Basic AI 9 จุด, Brain Tree V1, Persona 9 | 2026-06 | ✅ Complete | 100% |
| 2 | Core PIE Arch + Memory Retrieval | PIE 9 Layers, 7 AI 100% PIE, Keyword 3-Factor Ranking, Learning applied=false Queue | 2026-07 | ✅ Complete | 100% |
| 3 | Clean Arch: SSOT Repository + Legacy Cleanup | RoomBrainRepository SSOT, Memory Retrieval 75% Delete, MODE_PROMPTS→9 Roles, aiService 630→550, 100% Regression | 2026-07 | ✅ Complete | 100% |
| **4A** | **Semantic Retrieval + Hybrid Search** | **Embedding Hybrid (Gemini+Local), Vector Index, 6-Factor Scoring, BIE Hook PIE, Disable Switch** | **2026-07** | **✅ Complete** | **100%** |
| **4B** | **Knowledge Graph + Relationship** | **Graph Nodes/Edges 7 kinds + 6 edge types, Merge Duplicates, Entity Resolution, Edge Proposals (applied=false)** | **2026-08** | **✅ Complete** | **100%** |
| **4C** | **Memory Intelligence + Reflection** | **Merge/Conflict/Decay/Evidence Consolidation Background Async Reflect Jobs (P4-11)** | **2026-08** | **✅ Complete** | **100%** |
| 4D | Identity + Insight + Life Timeline | Identity 1-row singleton, 6-type Insight Generator, Timeline(M/Q/Y), Temporal Compare | Pre-requisite: 4C ✅ | ⏳ In Progress — S23 ✅ (1/7) | 14% |
| 5 | Full Intel Platform + UI Close | BIE UI Suite, HITL Confirm Screens, Service Worker (KI-302), Learning Loop Close + Optional MCP Integrations | Pre-requisite: 4A→4D ✅ | ⏳ Planned (Archived Detail) | 0% |
| 6 | Personal Evolution Engine | Daily Self Interview, Knowledge Gap Detector, Curiosity Engine, Identity Model, Confidence Score, Adaptive Question Engine | Pre-requisite: 5 ✅ | ⏳ Planned (Archived Detail) | 0% |
| 7 | Life Pattern Intelligence | Pattern Discovery Engine, Cause & Effect Engine, Personal Prediction, Blind Spot Detection, Monthly Growth Report | Pre-requisite: 6 ✅ | ⏳ Planned (Archived Detail) | 0% |
| 8 | Second Brain | Identity Engine, Life Timeline (M/Q/Y), Personal Insight Engine, Proactive AI | Pre-requisite: 7 ✅ | ⏳ Planned (Archived Detail) | 0% |

> หมายเหตุ: Mobile + Cross Platform (เดิม Phase 6) ถูกนำออกจาก Roadmap ชั่วคราวตามคำขอ ยังไม่กำหนด Phase ใหม่ — จะเพิ่มกลับเข้ามาเมื่อมีความชัดเจน

---

## 🧭 Post-Phase-5 Direction: "Feature" → "Intelligence Evolution"

หลัง Phase 5 (BIE Fully Integrated) ทิศทางของโปรเจกต์เปลี่ยนจากการเพิ่ม **ฟีเจอร์** ไปเป็นการพัฒนา **สติปัญญา (Intelligence)** ของ AI เอง — full detail ของ Phase 6-8 อยู่ที่ `/doc/ROADMAP_ARCHIVE.md`

```
Phase 6                    Phase 7                     Phase 8
Personal Evolution   →     Life Pattern            →   Second Brain
Engine                     Intelligence
──────────────             ──────────────               ──────────────
AI ถาม → AI เรียนรู้        AI เห็น Pattern ชีวิต         AI เข้าใจ "ตัวคุณ"
Knowledge Gap Detector     Pattern Discovery Engine     Identity Engine
Curiosity Engine           Cause-Effect Engine          Life Timeline
Identity Model             Personal Prediction          Personal Insight Engine
Confidence Score           Blind Spot Detection         Proactive AI
Adaptive Question Engine   Monthly Growth Report
```

> **Vision ปลายทาง (ยังไม่ Scope):** Phase 9 — Living Companion AI ถูกบันทึกไว้ใน `/doc/ROADMAP_ARCHIVE.md` เป็น Vision Declaration เท่านั้น (ยังไม่แตก Deliverables จนกว่า Phase 8 จะใกล้เสร็จ)

**หลักการยึดเดิมทุก Phase:** AI มีหน้าที่เรียนรู้และเสนอข้อมูลพร้อมหลักฐาน (Evidence) — การตัดสินใจและยืนยันความรู้ยังเป็นของผู้ใช้เสมอ (HITL applied=false จนกว่าจะ Confirm)
