# PHASE 5 — TASK BREAKDOWN TEMPLATE (S30–S34)

## Scope Note
เอกสารนี้เป็น **template สำหรับลงรายละเอียดงาน** ต่อยอดจาก `PHASE5_DESIGN_DRAFT.md` เพื่อแตกแต่ละ S-step ให้ถึงระดับที่สั่งงาน dev ได้จริง ยังเป็น draft สำหรับ workshop เท่านั้น — ไม่ใช่ roadmap อย่างเป็นทางการ และ implementation ยังต้องรอ S29 PASS + Design Gate อนุมัติก่อนเสมอ

---

## วิธีใช้ Template นี้

แต่ละ S-step จะถูกแตกเป็น **sub-task (S3x.1, S3x.2, ...)** โดยแต่ละ sub-task ต้องระบุ 7 หัวข้อ:

| หัวข้อ | ความหมาย |
|---|---|
| Touch points | ไฟล์ / module / repository method ที่ถูกแก้หรือสร้างใหม่ |
| Data contract | shape ของ request/response, schema ที่เกี่ยวข้อง |
| State transitions | สถานะข้อมูลเปลี่ยนอย่างไร (pending → confirmed → applied → undo ฯลฯ) |
| Edge cases | เคสที่ต้องคิดล่วงหน้า (bieEnabled=false, concurrent edit, undo after retrieval used it) |
| Test plan | unit / regression / manual QA ที่ต้องมี |
| Rollback path | ถ้าทำผิดพลาดหรือ user undo จะ revert อย่างไร |
| Dependency | ต้องรอ sub-task ไหนเสร็จก่อน |

ปิดท้ายแต่ละ S-step ด้วย **Design Gate Checklist** (อ้างจาก draft section I) เพื่อเช็คทีละ S-step แทนที่จะเช็ครวมทั้ง phase ทีเดียว

---

## S30 — Define Phase 5 Product Surface and Confirm UX Contract

### Sub-tasks

**S30.1 — Audit BIE surfaces ที่มีอยู่จริงใน repository**
- Touch points: `RoomBrainIntelligenceRepository`, `SemanticService`, identity/insight/timeline engines (read-only audit)
- Data contract: จับ schema ปัจจุบันของ `bie_embeddings`, `bie_identity`, `bie_insights`, `bie_timeline`, `bie_pending_queue`
- State transitions: ไม่มี (audit only)
- Edge cases: engine ที่ scaffold ไว้แต่ยังไม่สมบูรณ์ ต้องแยกให้ชัดว่าใช้ได้จริงกับใช้ไม่ได้
- Test plan: -
- Rollback path: -
- Dependency: ไม่มี (จุดเริ่มต้น)

**S30.2 — นิยาม UX Contract สำหรับ pending → confirm/reject/edit**
- Touch points: design doc / wireframe (ยังไม่แตะ code)
- Data contract: นิยาม field ที่ UI ต้องเห็น เช่น `status`, `applied`, `proposedAt`, `confirmedAt`, `editedContent`
- State transitions: `pending → confirmed | rejected | edited-then-confirmed`
- Edge cases: item ที่ผู้ใช้ไม่ตอบสนองนาน ๆ ควรมี state เพิ่ม (เช่น stale) หรือไม่
- Test plan: review กับทีมว่า contract ครอบคลุมทุก BIE type (identity/insight/timeline/semantic)
- Rollback path: -
- Dependency: S30.1

**S30.3 — จับคู่ surface ↔ engine/repository ที่รองรับ**
- Touch points: mapping table (ใน design doc)
- Data contract: ตาราง surface → repository method → engine
- State transitions: -
- Edge cases: surface ที่ยังไม่มี engine รองรับ (เช่น graph explorer) ต้อง mark เป็น P1/P2 ไม่ใช่ P0
- Test plan: cross-check กับ section C ของ draft (foundation-ready vs not ready)
- Rollback path: -
- Dependency: S30.1, S30.2

**S30.4 — สรุปเป็น Phase 5 Product Map + ส่ง Design Gate**
- Touch points: final design doc
- Data contract: -
- State transitions: -
- Edge cases: -
- Test plan: Design Gate review (ดู checklist ด้านล่าง)
- Rollback path: revise แล้วส่งใหม่ถ้า gate ไม่ผ่าน
- Dependency: S30.1–S30.3

### Design Gate Checklist (S30)
Architecture impact ✅ / Data model impact ✅ / PIE impact ⬜ / BIE impact ✅ / HITL impact ✅ / UI-UX impact ✅ / Scope impact ✅ / Backward compat ⬜ / bieEnabled=false ⬜ / Regression strategy ⬜
*(S30 เป็น design-only ดังนั้นบาง item เช่น regression/backward-compat จะยังไม่ apply เต็มที่ — mark ตามจริงตอน review)*

---

## S31 — Build BIE Discovery & Review Surface

### Sub-tasks

**S31.1 — ออกแบบ query/API layer สำหรับดึง pending queue + semantic results**
- Touch points: `RoomBrainIntelligenceRepository` (เพิ่ม read method), ชั้น API/service ใหม่ (read-only)
- Data contract: response shape เช่น `{ items: [{id, type, content, status, score}], hasMore }`
- State transitions: ไม่มี (read only)
- Edge cases: bieEnabled=false → ต้อง return empty/fallback ไม่ error
- Test plan: unit test สำหรับ query filter, pagination
- Rollback path: -
- Dependency: S30.4

**S31.2 — สร้าง UI: Discovery list + Review card**
- Touch points: component ใหม่ (list, filter, card), ต่อกับ S31.1 API
- Data contract: ใช้ contract จาก S30.2
- State transitions: UI แสดงตาม `status` field
- Edge cases: list ว่าง, loading, error state
- Test plan: manual QA + snapshot/UI test
- Rollback path: feature flag ปิด UI ได้ถ้ามีปัญหา
- Dependency: S31.1

**S31.3 — ต่อ Confirm / Reject action**
- Touch points: repository write method ใหม่, event handler ใน UI
- Data contract: `PATCH pending item { status: confirmed|rejected, editedContent? }`
- State transitions: `pending → confirmed (applied=true)` หรือ `pending → rejected (applied=false, removed)`
- Edge cases: double-submit, concurrent confirm จากหลาย session, item ถูกลบไปแล้วระหว่าง review
- Test plan: integration test ครบ 3 path (confirm/reject/edit), regression บน retrieval หลัง confirm
- Rollback path: ต้องมี undo endpoint ที่ revert `applied` state กลับ (เชื่อมกับ S34 undo requirement)
- Dependency: S31.1, S31.2

**S31.4 — Fallback & disable-switch validation**
- Touch points: `bieEnabled` check ใน retrieval + UI
- Data contract: -
- State transitions: -
- Edge cases: toggle bieEnabled ระหว่างมี pending items ค้างอยู่
- Test plan: regression suite เดิม (legacy retrieval) ต้องผ่านเมื่อ disabled
- Rollback path: -
- Dependency: S31.1–S31.3

### Design Gate Checklist (S31)
ครบทั้ง 10 ข้อจาก section I ต้อง review ก่อน implement จริง โดยเฉพาะ **HITL impact** (ต้อง pending จนกว่าจะ confirm) และ **bieEnabled=false behavior**

---

## S32 — Productize Identity + Insight Flow

### Sub-tasks

**S32.1 — Identity Review UI + confirm flow**
- Touch points: identity engine output → repository → UI (reuse pattern จาก S31)
- Data contract: `{ profileField, proposedValue, currentValue, status }`
- State transitions: `pending → confirmed → applied` (เหมือน S31.3 pattern)
- Edge cases: field ที่ conflict กับค่าที่ user เคย confirm ไปแล้ว
- Test plan: unit + manual review
- Rollback path: undo ต้อง revert `bie_identity` record กลับค่าก่อนหน้า ไม่ใช่แค่ลบจาก UI
- Dependency: S31 (reuse pending-queue pattern), S30.4

**S32.2 — Insight Center UI (6 types) + confirm flow**
- Touch points: insight generator output → repository → UI
- Data contract: `{ insightType, content, evidenceRefs, status }`
- State transitions: เหมือน S32.1
- Edge cases: insight ที่ evidence เปลี่ยนไปหลัง generate (stale insight)
- Test plan: ต้องเทสครบทั้ง 6 insight type แยกกัน
- Rollback path: revert `bie_insights.applied` + คืนค่า context ที่เคย inject ไป retrieval
- Dependency: S32.1

**S32.3 — เชื่อม applied state เข้ากับ future retrieval context**
- Touch points: `PipelineContext` / memory retrieval enrichment layer
- Data contract: ensure only `applied=true` records ถูกใช้ใน retrieval
- State transitions: `applied=true → ใช้ใน retrieval` / `undo → ไม่ถูกใช้อีก`
- Edge cases: cache ที่ retrieval เก็บไว้ต้อง invalidate หลัง undo
- Test plan: end-to-end test ตาม Learning Loop Closure criteria (section D ของ draft)
- Rollback path: cache invalidation + revert record
- Dependency: S32.1, S32.2

### Design Gate Checklist (S32)
เน้น **Data model impact** (แก้ schema identity/insight หรือไม่) และ **Regression strategy** (retrieval เดิมต้องไม่พัง)

---

## S33 — Productize Timeline + BIE Context in Retrieval Experience

### Sub-tasks

**S33.1 — Timeline Explorer UI**
- Touch points: timeline builder output → repository → UI
- Data contract: `{ period: M|Q|Y, entries: [...] }`
- State transitions: read-only (timeline เป็น cache builder ไม่ต้อง confirm)
- Edge cases: ช่วงเวลาที่ไม่มีข้อมูล, timezone edge case
- Test plan: manual QA ตรวจความถูกต้องของ bucket M/Q/Y
- Rollback path: -
- Dependency: S30.4

**S33.2 — แสดง BIE context ใน retrieval experience หลัก**
- Touch points: memory retrieval UI / PIE context display layer
- Data contract: annotate ว่า context ไหนมาจาก BIE enrichment
- State transitions: -
- Edge cases: bieEnabled=false ต้อง fallback เป็น legacy context แบบไม่มีรอยต่อ
- Test plan: side-by-side regression (enabled vs disabled)
- Rollback path: feature flag
- Dependency: S33.1, S31.4

### Design Gate Checklist (S33)
เน้น **PIE impact** และ **Backward compatibility** เป็นพิเศษ เพราะแตะ retrieval experience หลักที่ user ใช้ทุกวัน

---

## S34 — Closeout, Regression, and Handoff

### Sub-tasks

**S34.1 — End-to-end Learning Loop validation**
- Touch points: ทุก surface จาก S31–S33
- Data contract: -
- State transitions: ทดสอบ full loop ตาม section D: `AI Proposal → Pending → Confirm → applied=true → Persist → Future Retrieval → Improved Context`
- Edge cases: -
- Test plan: end-to-end test scenario ครบทุก BIE type
- Rollback path: -
- Dependency: S31, S32, S33 เสร็จหมด

**S34.2 — Undo/Rollback validation ตาม section N**
- Touch points: ทุก undo endpoint ที่สร้างใน S31.3, S32.1–S32.3
- Data contract: -
- State transitions: `applied=true → Undo → Previous state restored → Future Retrieval ไม่ใช้ reverted state`
- Edge cases: undo หลัง retrieval ใช้ข้อมูลไปแล้วหลายครั้ง (cache ต้อง invalidate)
- Test plan: **ต้องพิสูจน์ว่า undo revert intelligence state จริง ไม่ใช่แค่ซ่อนจาก UI** (ตาม requirement เดิมใน draft)
- Rollback path: -
- Dependency: S34.1

**S34.3 — Regression + Build + Lint**
- Touch points: full test suite
- Data contract: -
- State transitions: -
- Edge cases: -
- Test plan: regression เดิม (Phase 4) + regression ใหม่ (Phase 5) + build + lint ผ่านทั้งหมด
- Rollback path: -
- Dependency: S34.1, S34.2

**S34.4 — Handoff documentation**
- Touch points: เอกสารสรุป
- Data contract: -
- State transitions: -
- Edge cases: -
- Test plan: -
- Rollback path: -
- Dependency: S34.3

### Design Gate Checklist (S34)
เช็คครบทั้ง 10 ข้อรวดเดียวเป็น final gate ก่อนปิด Phase 5

---

## หมายเหตุการใช้งาน Template

- ลำดับ dependency หลักคือ **S30 → S31 → S32 → S33 → S34** ตาม draft เดิม แต่ sub-task ภายในแต่ละ S-step สามารถขนานกันได้บางส่วน (เช่น S32.1 กับ S32.2 ทำพร้อมกันได้ถ้าทีมพอ)
- ทุก sub-task ที่มี **write operation** (confirm/reject/edit) ต้องมี rollback path ที่ชัดเจนก่อนเริ่ม implement — ตาม P5-1 และ P0 priority ใน draft
- Template นี้เป็นจุดเริ่มต้น ไม่ใช่ fixed plan — ตามที่ draft ระบุไว้ว่า Agent อาจเสนอ sub-phase grouping ใหม่ได้หลัง audit Phase 4 ครั้งสุดท้าย
