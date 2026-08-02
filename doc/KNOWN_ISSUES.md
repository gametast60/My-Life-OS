# Known Issues — My Life OS

> รายการ Technical Debt, การขาดแคลน, Known Limitations และสิ่งที่ตั้งใจยังไม่แก้
> 
> จุดประสงค์: เพื่อไม่ให้ AI รุ่นใหม่หรือโปรแกรมเมอร์คนใหม่ **เสียเวลาวิเคราะห์ปัญหาเดิมซ้ำอีก**
> 
> Severity: 🔴 Critical | 🟡 Medium | 🟢 Low

---

## 🔴 Critical — ต้องแก้ก่อน Phase 4 จบ

### KI-001: Human-in-the-loop Learning ไม่มี Closed Loop UI
- **Issue:** Learning Engine เขียน Pending Learning ไปที่ `localStorage: mylifeos_pie_pending_learning_v1` แต่ **ไม่มี UI ให้ User Confirm / Reject**
- **Impact:** AI Learning never gets applied → Brain Tree ไม่เติบโตจาก AI Suggestions เลย
- **Current Workaround:** มี `BrainRepository.getPendingLearning()` + `savePendingLearning()` อยู่แล้ว — แค่ไม่มี UI
- **Planned Fix:** Phase 4C หรือ 4D (Reflection Engine สร้าง Insights + Confirmation Modal)
- **Since:** Phase 2

### KI-002: aiService.ts Line Count ยัง ~550 บรรทัด
- **Issue:** ถ้าหากเป็น Thin Facade ควรจะ 200-300 บรรทัด; ตอนนี้ยังมี Response Adapter Logic (JSON Parsing, Journal Block Building, Error Message Tailoring) เยอะเกินไป
- **Impact:** Maintainability ต่ำ; เกิด Duplicate Logic กับ PIE Prompt Builder ได้ง่าย
- **Current Workaround:** `tsc --noEmit` + `vite build` ผ่าน 100%; ไม่พบ Bug ตอนนี้
- **Planned Fix:** Phase 4A-4B ไล่ย้าย Adapter Logic ไปเป็น PIE Context Builders แยก
- **Since:** Phase 3

### KI-003: Legacy BrainCards Fallback ยังเป็น Threshold = 5
- **Issue:** Retrieval Hierarchy ยังคง Fallback ถ้า Primary < 5 Sources (`RoomBrainRepository.getRelevantMemory()` L141)
- **Impact:** Legacy ความรู้แบบเก่าจะไม่หายไป — ควรจะ Decommission เมื่อ Brain Tree มี Evidence พอสมควร
- **Current Workaround:** User สามารถสร้าง Brain Tree เองได้; AI ก็ยังอ่าน Legacy ได้
- **Planned Fix:** Phase 4D ส่วนท้าย — set threshold = 0
- **Since:** Phase 2

---

## 🟡 Medium — Phase 4 จะแก้ไปเรื่อยๆ

### KI-101: Semantic Retrieval ยังไม่มี User-visible Hybrid Sort (Keyword-only 100% sort order preserved)
- **Issue:** Intent Engine + Retrieval ใช้ Keyword Matching + Thai Word Extraction (RegEx `[\u0E00-\u0E7F]{2,}`) เท่านั้น ไม่มี Synonym/Context/Semantic
- **Impact:** พูด "วิกฤติเศรษฐกิจ" จะไม่เจอ Tag "การเงิน" (ไม่มีคำตรงกัน) ใน UX ผลลัพธ์เรียงลำดับยังคงเป็น keyword-hits DESC เหมือนเดิม
- **Progress Note (Phase 4A S6, 2026-08-01):** S6 delivered baseline wire hook — Semantic Embeddings + 6-factor Hybrid Scoring ARE computed and attached to every `RetrievalSource` row as S1-declared optional fields (`.semanticScore`, `.tagMatchScore`, `.graphScore=0`). Pipeline now has the semantic signal end-to-end. SORT ORDER IS INTENTIONALLY PRESERVED as legacy keyword-hits DESC in S6 per DECISIONS.md trade-off — user-visible hybrid re-sorting is conditionally enabled in **S8 Tuning** sub-phase via `enableHybridSort` flag. `bieEnabled=false` disable switch (for keyword-only 100% behavior) is threaded through all layers in **S7** sub-phase. KI-101 will be fully closed when S7 + S8 deliver both (a) user toggle for BIE, and (b) default hybrid re-sort on ≡ keyword hits tiebreak scenario with semantic fallback.
- **Planned Fix:** **Phase 4A S7 (Disable Switch Threading) + S8 (Weight Calibration + Conditional Hybrid Sort Enablement)** — full resolution targeted 4A S9 Regression Gate
- **Since:** Phase 1

### KI-102: Knowledge Graph Tag-to-Tag Relationship ยังไม่มี
- **Issue:** Brain Tree มีแค่ Hierarchical Link (Type→Dim→Tag) ไม่มี Semantic Link: supports/conflicts/derivedFrom
- **Impact:** ระบบไม่สามารถตอบคำถามเชิงสาเหตุผลได้ เช่น "ทำไมนิสัยนี้ขัดแย้งกับเป้าหมายนี้?"
- **Planned Fix:** **Phase 4B Knowledge Graph + Relationship Engine**
- **Since:** Phase 1

### KI-103: Evidence Scoring Fields (importance/lastUsed/lastConfirmed) ยังไม่มี
- **Issue:** `BrainTreeTag` มีแค่ `growthScore, level, progressPct, priority, updatedAt` — ไม่มี Part C.6 5 Fields ที่ต้องการ
- **Impact:** Memory Decay V2 + Evidence Scoring ไม่สามารถทำได้ถูกต้อง
- **Planned Fix:** **Phase 4C Memory Intelligence** — เพิ่ม fields (Optional; backward compat)
- **Since:** Phase 1

### KI-104: BrainConfiguration.decay มี Key แต่ Implementation ไม่มี
- **Issue:** `types.ts` L127 กำหนดคีย์ `decay: {enabled, daysUntilStart, perDayPctDrop}` ไว้แล้ว แต่ไม่มีไหน call `applyDecay()` เลย
- **Planned Fix:** Phase 4C Memory Decay
- **Since:** Phase 1

### KI-105: AICoachView UI ยังแสดง 6 Legacy Modes — ไม่มี 9 Native Roles UI
- **Issue:** Role Persona มี 9 คนเต็มแล้ว (coach, therapist, psychologist, planner, language_tutor, trading_mentor, teacher, nutrition, custom) แต่ UI AICoachView ยัง hardcode แสดงแค่ Coach, Therapist, Decision, Future Self, Secretary, Reflection, Chat (7 Legacy Modes)
- **Impact:** 3 ใหม่ (psychologist, language_tutor, teacher, nutrition, trading_mentor — 5/9 ไม่สามารถเข้าถึงจาก UI ได้)
- **Current Workaround:** aiService มี LEGACY_MODE_CONFIG อยู่; จะเรียกผ่านถ้ามี roleId param ใน PipelineRequest
- **Planned Fix:** Phase 4D ส่วนท้าย (UI เป็น Feature ไม่ใช่ Core BIE; จะทำเมื่อ Core เสร็จ)
- **Hard Constraint:** Phase 4 ห้ามเปลี่ยน UX/UI — **KEEP LEGACY UI ตลอด Phase 4**
- **Since:** Phase 3

### KI-106: Views ยังส่ง extraContext.brainCards / recentJournals เอง
- **Issue:** `AICoachView`, `JournalView` ฯลฯ ยัง Load BrainCards, Journals จาก DB เอง แล้วส่งทาง `extraContext` เพิ่อให้ aiService ใช้
- **Impact:** Duplicate DB Query; ทำให้ `RequestContextOverride` interface ต้องอยู่ตลอด (Leaky Abstraction)
- **Planned Fix:** Phase 4D (ตอน Decommission Legacy BrainCards) — ให้ Repository เป็นคนโหลดทั้งหมด
- **Since:** Phase 2

---

## 🟢 Low — Nice to Have / Future Phase

### KI-207: BIE Trigger Gap (RESOLVED in Phase 5 Hotfix 2026-08-02)
- **Issue:** BIE engines (Identity, Insight, Timeline, Relationship, Reflection) were fully implemented but **never triggered** — no manual button, no auto-trigger after check-in/journal.
- **Resolution:** Phase 5 Hotfix (Design Gate approved 2026-08-02):
  - Added `src/pie/bie/bieOrchestrator.ts` with `runBieAnalysisOrchestrator()` — single entry point running all 5 engines.
  - Added "วิเคราะห์ตอนนี้" button in `BieDiscoveryModal.tsx` (Trigger Point A).
  - Added auto-trigger in `App.tsx handleSaveCheckin` with 6-hour throttle (Trigger Point B).
  - All proposals carry `applied: false` (P4-12 HITL); non-fatal try/catch (P4-11).
- **Verified:** `npm run lint` ✅, `npm run build` ✅, manual button works, auto-trigger fires after check-in.
- **Reference:** CHANGELOG.md [Phase 5 — Hotfix] section.

### KI-208: Identity confidence calibration fixed (RESOLVED)
- **Issue:** `identityEngine.ts` could assign full confidence to entries based on a single evidence item because confidence normalization did not consider evidence count.
- **Resolution:** Converted `buildEntries()` to apply a sufficiency factor using `MIN_EVIDENCE_FOR_FULL_CONFIDENCE = 5`, so entries need multiple supporting evidences before reaching 1.0 confidence.
- **Status:** RESOLVED.

### KI-209: Hardcoded confidence values remain in `insightGenerator.ts`
- **Issue:** `insightGenerator.ts` still uses hardcoded confidence thresholds for some insight kinds, which may require future calibration alongside the identity engine fix.
- **Impact:** Insight confidence scoring is not yet fully tunable and may misrepresent certainty.
- **Status:** Active.

### KI-201: Embedding ยังไม่มี Local Offline Model
- **Issue:** Phase 4A จะใช้ Hybrid Embedding Strategy — ถ้าออนไลน์เรียก Provider; ถ้าออฟไลน์ใช้ TF-IDF/BM25 local — ซึ่ง Semantic Quality ต่ำกว่า
- **Planned Fix:** Phase 5 อาจจะลอง WebAssembly / ONNX runtime สำหรับ Universal Sentence Encoder Multilingual
- **Since:** Phase 4A Proposed

### KI-202: Knowledge Graph ยังไม่มี Multi-hop Reasoning
- **Issue:** Phase 4B จะสร้าง GraphNodes + GraphEdges (1-hop queries เท่านั้น)
- **Limitation:** ไม่สามารถตอบ "A → B → C ทำไมถึงสัมพันธ์?" ได้ — ต้อง Graph Traversal
- **Planned Fix:** Phase 4D Insight Generator หรือ Phase 5 Proactive Agent
- **Since:** Phase 4B Proposed

### KI-203: Vector Search เป็น Linear Scan ไม่มี ANN Index
- **Issue:** Phase 4A Storage เป็น localStorage key `bie_embeddings_v1` → Cosine Similarity ทุก node ตอน query (Linear Scan O(N))
- **Impact:** ถ้า N ≥ 5,000 nodes อาจช้าเกิน 500ms; ตอนนี้ User ส่วนตัว N<1000 ยังไม่เป็นปัญหา
- **Planned Fix:** Phase 5 อาจจะย้ายไป `@saeloun/blindindex` หรือ `hnswlib-node` WASM (หรือ IndexedDB + Approximate NN)
- **Since:** Phase 4A Proposed

### KI-204: UserSettings legacy `aiApiKey`/`aiModel` ยังคงอยู่
- **Issue:** Pipeline มี `getProvidersFromSettings()` ที่ยังรองรับ legacy `settings.aiApiKey` (single key) ควรจะ force ใช้ `settings.apiProviders[]` หลายตัว
- **Impact:** Code path มี 2 ทาง — อาจจะมี User ที่ migration ไม่ครบ
- **Planned Fix:** Phase 4D สุดท้าย — Migration Script ที่ convert `aiApiKey` → `apiProviders[0]`
- **Since:** Phase 2

### KI-205: PipelineLogger maxLogs=200 ไม่มี Persistence
- **Issue:** Logger เก็บแค่ Memory FIFO 200 รายการ — Refresh หน้าแล้วหาย
- **Impact:** Debugging ยาก; ไม่มี Analytics
- **Planned Fix:** Phase 4D — บางทีอาจจะ write ไป localStorage 100 รายการล่าสุด
- **Since:** Phase 2

### KI-206: Build Output ยังไม่มี Service Worker / Offline-first
- **Issue:** Mobile (Capacitor) หรือ PWA ควรจะมี Service Worker cache App Shell
- **Planned Fix:** Phase 5 (Personal Intelligence) หรือหลัง Phase 4D เสร็จ
- **Since:** Phase 1

---

## ℹ️ Reference: Phase 4 Proposed Scope Gaps (Pre-4A)

จาก Architecture Survey (ก่อนเริ่ม 4A) พบ Gaps ดังนี้ — จะถูกคลี่คลายทีละ Sub-phase:

| Gap | Target Sub-phase |
|-----|-----------------|
| No Semantic/Embedding Layer | **4A** |
| No Hybrid Score (6-factor) | **4A** |
| No Knowledge Graph (Nodes/Edges) | **4B** |
| No Relationship Engine (supports/conflicts/causes/derived) | **4B** |
| No Memory Consolidation (Duplicate/Conflict/Merge) | **4C** |
| Missing Evidence Scoring 5 Fields (importance, evidenceCount, lastConfirmed, lastUsed) | **4C** |
| BrainConfiguration.decay ไม่มี Implementation | **4C** |
| No Reflection Engine (Pattern Detection, Core Values) | **4C/4D** |
| No Conflict Detection Auto | **4C** |
| No Insight Generator (Trend/Anomaly) | **4D** |
| No Identity Engine (Summary 8 Categories) | **4D** |
| No Life Timeline (Month/Quarter/Year Milestones) | **4D** |
| No BrainIntelligenceRepository ไฟล์แยก | **4B** |
