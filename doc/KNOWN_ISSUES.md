# Known Issues — My Life OS

> รายการนี้เก็บเฉพาะข้อจำกัดและ technical debt ที่ยังมีผลกับโค้ดปัจจุบัน
> 
> **Last reviewed:** 2026-08-02, หลัง Phase 5 Master Gate และ BIE Trigger hotfix
> 
> สถานะ phase ให้ยึด `STATE.md`; รายละเอียดสิ่งที่ทำเสร็จให้ยึด `CHANGELOG.md` และ `ROADMAP.md`

Severity: 🔴 Critical | 🟡 Medium | 🟢 Low

---

## 🔴 Critical

ไม่มีรายการค้างระดับ critical ณ วันที่ทบทวนนี้

---

## 🟡 Medium

### KI-001: Core PIE pending-learning queue ยังไม่มีหน้าจอ review โดยตรง
- **Issue:** Learning Engine เดิมยังบันทึกข้อเสนอไว้ที่ `mylifeos_pie_pending_learning_v1` ผ่าน `RoomBrainRepository` แต่ BIE Discovery UI จัดการเฉพาะ BIE pending queue
- **Impact:** ข้อเสนอจาก Core PIE อาจค้างอยู่โดยผู้ใช้ไม่เห็นช่องทาง confirm/reject โดยตรง
- **Current State:** BIE proposal flow มีครบแล้ว (review, edit, confirm, reject และ undo) และแยกจาก Core PIE queue ตาม P4-13
- **Next Action:** กำหนดว่าจะรวม Core PIE queue เข้าสู่ review surface หรือ deprecate queue นี้อย่างมี migration ใน Phase 6
- **Since:** Phase 2

### KI-002: `aiService.ts` ยังมีขนาดใหญ่และเป็น legacy facade
- **Issue:** ไฟล์ยังมีประมาณ 621 บรรทัด และเก็บทั้ง compatibility mapping, response adaptation และ facade methods
- **Impact:** การเปลี่ยนพฤติกรรม AI มีจุดต้องระวังมากขึ้น และเสี่ยงซ้ำซ้อนกับ PIE layer
- **Constraint:** ห้ามเปลี่ยน signature ของ facade 7 methods (P4-8 Strict Widening)
- **Next Action:** ค่อย ๆ แยก implementation ภายในโดยคง facade เดิมไว้ เมื่อมี work order ใน Phase 6
- **Since:** Phase 3

### KI-003: Legacy BrainCards ยังถูกใช้เป็น fallback เมื่อแหล่งหลักมีน้อย
- **Issue:** `RoomBrainRepository.getRelevantMemory()` ยังเติม Legacy BrainCards เมื่อ Brain Tree + Journal sources มีน้อยกว่า 5 รายการ
- **Impact:** มี retrieval path สองชุด และ Legacy BrainCards ยังไม่ถูก decommission
- **Current State:** เป็น fallback เพื่อ backward compatibility; BIE เปิด/ปิดไม่ทำลาย baseline เดิม
- **Next Action:** วาง migration/deprecation plan หลังยืนยันว่า Brain Tree coverage เพียงพอสำหรับข้อมูลผู้ใช้เดิม
- **Since:** Phase 2

### KI-004: Native AI roles ยังไม่ถูกเลือกจาก UI โดยตรง
- **Issue:** Registry มี 9 roles แต่ `AICoachView` ยังใช้ legacy modes 7 แบบผ่าน `LEGACY_MODE_CONFIG`
- **Impact:** Roles เช่น psychologist, language tutor, teacher, nutrition และ trading mentor ยังไม่มี entry point โดยตรงใน UI
- **Current State:** role implementations และ mapping มีอยู่แล้ว; ข้อจำกัดเป็น UX/product decision ไม่ใช่ missing core engine
- **Next Action:** ออกแบบ role selector โดยไม่ทำให้ legacy modes หรือ AI facade regress ใน Phase 6
- **Since:** Phase 3

### KI-005: Views ยังส่ง context บางส่วนเข้า AI facade เอง
- **Issue:** บาง view ยังโหลด BrainCards/Journal แล้วส่งผ่าน `extraContext` แทนให้ repository เป็นเจ้าของ retrieval ทั้งหมด
- **Impact:** มี duplicate query และ abstraction ข้ามชั้น
- **Next Action:** รวม retrieval ownership ที่ repository/pipeline เมื่อ decommission Legacy BrainCards
- **Since:** Phase 2

### KI-006: Insight confidence บางชนิดยังเป็นค่าคงที่
- **Issue:** `insightGenerator.ts` ยังมี hardcoded confidence สำหรับ insight บางชนิด
- **Impact:** ความมั่นใจของ insight ยังไม่สามารถ calibrate จากข้อมูลจริงได้ทั้งหมด
- **Next Action:** ทำ calibration policy และ test data ใน Phase 6
- **Since:** Phase 5 review

---

## 🟢 Low / Future Scale-up

### KI-201: Offline semantic fallback มีคุณภาพต่ำกว่า embedding provider
- **Issue:** ระบบใช้ Local BM25 + synonyms เป็น fallback แบบ offline ไม่ใช่ multilingual embedding model จริง
- **Impact:** ความเข้าใจเชิง semantic ในโหมด offline จำกัดกว่าเมื่อใช้ Gemini embedding
- **Next Action:** ประเมิน ONNX/WASM multilingual model เมื่อต้องการคุณภาพ offline สูงขึ้น

### KI-202: Vector search เป็น linear scan
- **Issue:** `VectorIndex` คำนวณ cosine similarity แบบ linear scan
- **Impact:** เมื่อจำนวน embedding โตมาก (ระดับหลายพันขึ้นไป) อาจกระทบเวลา response
- **Current State:** เหมาะสมกับ personal-scale data ปัจจุบัน
- **Next Action:** ประเมิน ANN index เมื่อมีข้อมูล performance จริง

### KI-203: AI-provider legacy fields ยังรองรับอยู่เพื่อ compatibility
- **Issue:** `aiApiKey` และ `aiModel` ยังอยู่ใน settings/pipeline ถึงแม้จะมี migration ไป `apiProviders[]` แล้ว
- **Impact:** มี compatibility path มากกว่าหนึ่งทาง
- **Current State:** migration v3 ทำการย้ายค่าให้ผู้ใช้เดิมแล้ว
- **Next Action:** ตัด fields และ fallback หลังตั้งนโยบายรองรับข้อมูลเก่าชัดเจน

### KI-204: Pipeline logger ไม่ persist
- **Issue:** `PipelineLogger` เก็บ log ใน memory สูงสุด 200 รายการ
- **Impact:** log หายหลัง refresh และไม่มีข้อมูลสำหรับวิเคราะห์ย้อนหลัง
- **Next Action:** กำหนด retention และ privacy policy ก่อนเพิ่ม persistence

---

## ✅ Resolved / No Longer Active

| เดิม | สถานะปัจจุบัน | หลักฐาน |
|---|---|---|
| KI-101 Semantic retrieval / hybrid scoring | ✅ เสร็จใน Phase 4A; มี semantic provider, hybrid scorer และ `bieEnabled=false` baseline | `ROADMAP.md`, Phase 4A; `CHANGELOG.md` S34 |
| KI-102 Tag-to-tag relationship | ✅ เสร็จใน Phase 4B; มี graph nodes/edges, relationship proposals และ traversal | `src/pie/bie/graph/` |
| KI-103 Evidence scoring fields | ✅ ขอบเขต Phase 4C ถูกส่งมอบแล้ว | `ROADMAP.md`, Phase 4C |
| KI-104 Decay engine ไม่มี implementation | ✅ มี `DefaultDecayEngine` สำหรับคำนวณ tag decay | `src/pie/bie/reflection/decayEngine.ts` |
| KI-202 (เดิม) ไม่มี multi-hop reasoning | ✅ มี N-hop neighbourhood (สูงสุด 5) และ BFS shortest-path query | `src/pie/bie/graph/graphQueryService.ts` |
| KI-206 ไม่มี service worker / offline shell | ✅ มี service-worker registration และ app-shell cache | `src/main.tsx`, `public/sw.js` |
| KI-207 BIE trigger gap | ✅ มี manual trigger และ auto-trigger หลัง daily check-in พร้อม throttle | `CHANGELOG.md`, Phase 5 Hotfix |
| KI-208 Identity confidence จาก evidence เดียว | ✅ มี evidence-sufficiency factor แล้ว | `CHANGELOG.md`, Phase 5 Hotfix |

---

## Historical note

รายการ Phase 4 ที่เคยเขียนว่า “planned fix” ถูกย้ายออกจาก active list เพราะ Phase 4A–4D และ Phase 5 ปิดงานแล้ว ไม่ควรใช้รายการเก่านี้เป็นแผนงานต่อไป. งานถัดไปของโครงการคือ Phase 6: Personal Evolution Engine.
