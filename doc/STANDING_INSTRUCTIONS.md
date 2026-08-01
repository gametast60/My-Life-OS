# STANDING_INSTRUCTIONS.md — Global Workflow Rules

> กฎที่ใช้กับทุก Step / ทุก Phase — ห้าม paste เนื้อหานี้ซ้ำในไฟล์ handoff อื่นๆ
> ในไฟล์อื่นๆ ให้อ้างอิงแค่: "ปฏิบัติตาม `/doc/STANDING_INSTRUCTIONS.md`"

---

## SI-0: Pre-Start Mandate (ทุก Step ต้องทำก่อนเขียนโค้ด)

1. อ่าน **`/doc/STATE.md` ทุกครั้งก่อนเริ่มงาน** (ไฟล์เดียวที่อ่านทุก step — สำหรับ current step, constraints, allowed files)
2. LS `/doc/` folder — ต้องมีไฟล์เหล่านี้อยู่:
   - `STATE.md`, `STANDING_INSTRUCTIONS.md` (ไฟล์นี้)
   - `AI_ARCHITECTURE.md`, `ROADMAP.md`, `CHANGELOG.md`, `DECISIONS.md`, `KNOWN_ISSUES.md`
   - `PROMPT.md` (per-step work order)
   - ไฟล์ Archive: `<NAME>_ARCHIVE.md` (4 คู่: AI_ARCHITECTURE, CHANGELOG, DECISIONS, KNOWN_ISSUES)
   ถ้าหาย: กู้คืนจาก Git หรือไฟล์ Archive ก่อน — **ห้ามเริ่มเขียนโค้ดก่อนได้**
3. **SI-0.3: Archive File Read Discipline (กันโทเค็นบวม)**
   - ไฟล์ที่ลงท้าย `_ARCHIVE.md` ทุกไฟล์ (AI_ARCHITECTURE_ARCHIVE, CHANGELOG_ARCHIVE, DECISIONS_ARCHIVE, KNOWN_ISSUES_ARCHIVE, ROADMAP_ARCHIVE) **ห้ามอ่านแบบ routine ทุก step** — อ่านเฉพาะเมื่องานปัจจุบันต้องการ historical context จริงๆ เช่น:
     - Debug bug ที่อาจเกี่ยวกับ decision/implementation เก่า
     - ต้องอ้าง ADR เก่าเพื่อเข้าใจ trade-off ของ constraint ปัจจุบัน
     - ต้องยืนยันรายละเอียด step ที่ปิดไปนานแล้วเพื่อไม่ให้ทำซ้ำ
   - ถ้าแค่ต้อง "ยืนยันว่า entry ถูกย้ายไปแล้วหรือยัง" ให้ใช้ grep/search แทนการ อ่านทั้งไฟล์ (ใช้ view พร้อม view_range หรือ search text แทน full read)
   - ไฟล์หลัก (ไม่ใช่ archive) เช่น CHANGELOG.md, ROADMAP.md ก็ให้อ่านเท่าที่จำเป็น ต่องาน — เช่น CHANGELOG.md ปกติเช็คแค่ entry บนสุด ไม่ต้องอ่านทั้งไฟล์ เว้นแต่งานนั้นต้องการ full history จริงๆ

---

## SI-1: Code Handoff / PROMPT.md Handoff Format (หลัง Step เสร็จ)

เมื่อ Step N เสร็จ แล้วต้องเตรียม Handoff ให้ Step N+1:
1. Update `/doc/STATE.md` — Toggle: step ปัจจุบัน → ✅, step ถัดไป → ⏳ + update deliverable/constraints/allowed-files สำหรับ step ถัดไป
2. Overwrite `/doc/PROMPT.md` ด้วย **รูปแบบ minimal ใหม่** (ห้าม copy STANDING INSTRUCTIONS 83 บรรทัดซ้ำ):
   ```markdown
   # PROMPT.md — Current Step Work Order

   > **PHASE 4B — S<next>: <Short Title>**
   > **My Life OS — Brain Intelligence Engine (BIE)**

   ---

   ## 📌 สิ่งแรกที่ต้องทำ

   1. อ่าน /doc/STATE.md (current step, constraints, allowed files)
   2. ปฏิบัติตาม /doc/STANDING_INSTRUCTIONS.md (ทุก workflow rule)

   ## 🎯 PRIMARY DELIVERABLE (S<NEXT>):
   - Item 1
   - Item 2
   - Item 3

   ## ⚙️ WORK ORDER — EXECUTE IN ORDER:
   S<next> Step 1 of 5 — Read-only exploration: ...
   S<next> Step 2 of 5 — ...
   ...

   END OF HANDOFF PROMPT.
   ```
3. **ห้าม paste STANDING INSTRUCTIONS ลงใน PROMPT.md อีกต่อไป** — ใช้แค่ pointer ไป STATE.md + STANDING_INSTRUCTIONS.md เท่านั้น

---

## SI-2: Documentation Update Rules (Update ONLY What Changed)

### 🔹 CHANGELOG.md — อัปเดตทุก Step เสมอ (แต่สั้น)
- Append section ใหม่ที่ TOP ของไฟล์ (ตาม Keep a Changelog)
- **ขนาดสูงสุด ~15 บรรทัดต่อ step**: Added/Changed/Verified (ห้ามเขียน 70+ บรรทัดต่อ step)
- หาก step มี detail มาก → 1-3 บรรทัดสั้นๆ ใน CHANGELOG แล้วใส่ "รายละเอียด implementation rationale ดู `CHANGELOG_ARCHIVE.md` section [Phase 4A-S<N>]"
- Rule เก็บขนาดไฟล์หลัก: **ไฟล์หลักเก็บเฉพาะ phase ปัจจุบัน + ก่อนหน้า 1 phase เท่านั้น** (ที่เกินย้ายเข้า CHANGELOG_ARCHIVE.md ดู SI-3)

### 🔹 ROADMAP.md — อัปเดตทุก Step แต่ TARGETED LINE EDIT ONLY
- **เปลี่ยนเฉพาะ status cell ของ step นั้นๆ ใน Work Order Table**: `⏳/❌ → ✅ Complete`
- เปลี่ยนเฉพาะ progress count: Summary Table → 4A progress `<N>/9`
- เปลี่ยนเฉพาะ Phase 4 Banner ASCII row: `"S<prev> ✅"`
- **ห้าม regenerate ทั้ง ASCII diagram / Phase 1-3 section / 4B-5 Planned detail ทุก step** — พวกนั้นไม่เปลี่ยนแปลงสาระ

### 🔹 AI_ARCHITECTURE.md — อัปเดตเฉพาะเมื่อ Architecture เปลี่ยนจริง
- ✅ อัปเดตเมื่อ: Diagram, Data Flow, Dependency Rule, Layer signature, Folder Structure เปลี่ยน
- ❌ **SKIP ได้ (ห้ามอัปเดต)** เมื่อ: Tuning weight/threshold, Refactor helper รายย่อย, Synonym pair expansion, Naming refactor ภายใน function ไม่กระทบ external contract
- ถ้า skip: ต้องระบุเหตุผล 1 บรรทัดใน CHANGELOG.md Verified section เช่น `[Doc Skip] AI_ARCHITECTURE.md — step นี้ tuning weight only, no arch change`
- Rule เก็บขนาดไฟล์หลัก: **ไฟล์หลักเก็บเฉพาะ Current Architecture State**; step-by-step rationale / implementation diagrams ของ step ที่ปิดจบแล้วย้ายเข้า `AI_ARCHITECTURE_ARCHIVE.md` (ดู SI-3)

### 🔹 DECISIONS.md — อัปเดตเฉพาะเมื่อมี Trade-off / ADR ใหม่จริง
- กฎเดิมคงสภาพ: เพิ่มเฉพาะเมื่อมีการตัดสินใจระหว่าง 2+ valid path ที่มี Permanent Impact
- Rule เก็บขนาดไฟล์หลัก: **ไฟล์หลักเก็บเฉพาะ ADR ที่ยังคง constrain การตัดสินใจปัจจุบัน**; ADR ของ phase ที่ปิดสนิทแล้ว (เช่น S4 placeholder strategy, S6 async plumbing) ย้ายเข้า `DECISIONS_ARCHIVE.md` (ดู SI-3)

### 🔹 KNOWN_ISSUES.md — อัปเดตเฉพาะเมื่อมี Issue / Debt ใหม่หรือแก้ resolved
- กฎเดิมคงสภาพ: เพิ่มเฉพาะเมื่อมี Limitation ใหม่
- เมื่อ Issue fully resolved:
  1. Compact entry เดิมเหลือ 1-3 บรรทัด + ระบุ "RESOLVED in [Phase 4X-S<Y>]" + Pointer "รายละเอียดเดิมดู CHANGELOG_ARCHIVE.md section [Phase 4X-S<Y>]"
  2. **ย้ายเข้า KNOWN_ISSUES_ARCHIVE.md** (ไม่ลบทิ้ง)
- Rule เก็บขนาดไฟล์หลัก: **ไฟล์หลักเก็บเฉพาะ Active / Unresolved entries**

---

## SI-3: Archive Maintenance Rules (ไฟล์ <NAME>_ARCHIVE.md)

เกณฑ์การย้ายเข้า Archive:
- **CHANGELOG_ARCHIVE.md**: ย้ายทุก section ที่เก่ากว่า "phase ปัจจุบัน - 1" (เช่น phase ปัจจุบัน 4A → เก็บ 4A + Phase 3 ในไฟล์หลัก; Phase 2, 1, Pre-4A, 4A S1-S5 ย้าย archive)
  - Compress entry: 1 บรรทัดหัวข้อ + 1-2 บรรทัด Summary สิ่งที่เพิ่ม/เปลี่ยน (ห้าย้ายเข้า archive โดยตรงทั้งดุ้น 70+ บรรทัด)
  - Format: `[Phase 4A — S5] Indexing & Scoring Logic — DELIVERED 2026-08-01. Added: semanticService cache-first orchestrator, vectorIndex linear-scan cosine, hybridScorer 6-factor Σ=1.0 formula. Zero wiring until S6 → zero runtime impact. รายละเอียด flow diagram / matrix อยู่ในไฟล์นี้ section ด้านล่าง.`
- **DECISIONS_ARCHIVE.md**: ย้ายเฉพาะ ADR ที่ "fait accompli แล้ว + ไม่ได้ constrain step ปัจจุบันอีกต่อไป" (เช่น S4 Placeholder Strategy, S6 Sync→Async Plumbing)
  - ย้ายทั้ง entry ไป archive (ไม่ต้อง compress เพราะ ADR มี rationale ที่ควรคงรูปแบบ) แต่เติมบรรทัดบนสุด: `[ARCHIVED] ไม่ได้ constrain step ปัจจุบัน. อ่านเพื่อ context ประวัติเท่านั้น.`
- **AI_ARCHITECTURE_ARCHIVE.md**: ย้ายทุก "Phase 4X S<N> Implementation Detail Section" (rationale / flow diagram ของ step ที่ปิดจบแล้ว)
  - ไฟล์หลัก AI_ARCHITECTURE.md เหลือเฉพาะ Current State + Banner ว่า "Implementation rationale per step ดู AI_ARCHITECTURE_ARCHIVE.md"
- **KNOWN_ISSUES_ARCHIVE.md**: ย้ายเฉพาะ entry ที่ Fully Resolved (มี CHANGELOG ยืนยัน)
  - Compress 1-3 บรรทัดต่อ entry + Pointer

ทุกการย้าย: **ห้ามลบเนื้อหาที่ยัง Active / Unresolved** — Archive เป็นการย้าย ไม่ใช่การลบ.

---

## SI-4: TARGETED EDIT ONLY — ห้าม Regenerate ทั้งไฟล์

### ⚠️ กฎบังคับทุกไฟล์ใน `/doc/`
เมื่อต้องอัปเดตไฟล์เอกสารใดๆ ใน `/doc/` ให้ใช้ **การแก้ไขแบบ TARGETED** เท่านั้น:
- แทรกเฉพาะบรรทัดใหม่ที่ต้องการ (append)
- เปลี่ยนเฉพาะบางคำในบรรทัดเดียว (เช่น `⏳ → ✅` ใน ROADMAP table cell)
- เปลี่ยนเฉพาะส่วนเดียวของไฟล์ที่มีการเปลี่ยนแปลงจริง

### ❌ ห้ามทำอย่างแน่นอน:
- ❌ อ่านทั้งไฟล์ → Paste เนื้อหาทั้งไฟล์กลับมาใหม่ทุกครั้ง (full-file regeneration)
- ❌ Rewrite ASCII diagram ทั้งหมดเมื่อแค่ต้องเปลี่ยน status 1 ตัวอักษรใน 1 row
- ❌ Rewrite ทั้ง CHANGELOG / AI_ARCHITECTURE / DECISIONS ทุก step เมื่อแค่ต้อง append 1 section ใหม่บนสุด

### ✅ ยกเว้นเมื่อ:
- ไฟล์นั้นเสียหาย / Corrupted (เช่น เนื้อหาหายไปครึ่งหนึ่ง, ลำดับ section ผิดพลาดร้ายแรง)
- มีคำสั่งชัดเจนจาก User ให้ Rewrite ทั้งไฟล์ (เช่น Task นี้ Restructure Documentation System)

---

## SI-5: Universal Handoff & State Transition Governance Rules

### 1. Universal Step Transition Sequence
เมื่อ Agent ได้รับ Work Order ในทุกๆ Session:
1. อ่าน `PROMPT.md` (Current Mission / Work Order)
2. อ่าน `STATE.md` (Current Project State, Constraints, Handoff)
3. อ่านเฉพาะเอกสารและไฟล์ที่ Work Order อ้างถึง
4. ตรวจ Codebase Reality
5. ทำเฉพาะ Current Work Order ที่ระบุไว้ใน PROMPT.md
6. Run required validation (`npm run lint`, `npm run build`, tests)
7. เมื่อเสร็จ ให้ update `STATE.md`
8. Update `PROMPT.md` ให้สะท้อน Next Work Order เฉพาะเมื่อเหมาะสม
9. **ห้าม mark งานอนาคตเป็น Complete**
10. **ห้ามข้าม Gate**

### 2. State Transition Invariant
- `CURRENT STEP → COMPLETE`
- `NEXT STEP → NEXT / PENDING`
- ตัวอย่าง: S32 Complete → S33 Next → S34 Next → Phase 5 Complete → Phase 6 Next / Pending
- **ห้ามเด็ดขาด**: Phase 5 Complete → Phase 6 Complete (Phase 6 ต้อง Complete ต่อเมื่อ Phase 6 Master Gate ผ่านจริงเท่านั้น)

### 3. Phase Completion Rule
Phase N เป็น **COMPLETE** ได้ต่อเมื่อ:
- ทุก required Step ของ Phase N complete 100%
- Phase N Master Gate passed (lint + build + regressions)
- Required validation passed
- Handoff completed
การที่ Phase N complete **ไม่ได้หมายความว่า Phase N+1 complete**

### 4. Current Mission Rule
- `PROMPT.md` ต้องทำหน้าที่เป็น **CURRENT MISSION / CURRENT WORK ORDER** เท่านั้น
- Agent ต้องถือ Current Mission เป็น Source สำหรับงานที่ต้องทำใน Session ปัจจุบัน
- **ห้ามตีความ** "Project Summary" หรือ "Completed History" เป็น Work Order ใหม่

### 5. Phase Transition Rule
เมื่อ Master Gate ของ Phase ปัจจุบันผ่าน:
- **ห้ามเริ่ม Phase ถัดไปโดยอัตโนมัติ**
- ให้เปลี่ยนสถานะเป็น: `CURRENT PHASE = Complete`, `NEXT PHASE = Pending / Planned`, `Implementation = NOT STARTED`
- จากนั้นรอ Phase Transition / Kickoff Instruction ใหม่จาก User

---

## SI-6: Context Loading & Token Efficiency Governance

### 1. REQUIRED CONTEXT — ต้องอ่านทุก Step
ทุกครั้งที่เริ่ม Work Order ใหม่ ให้ Agent อ่าน:
1. `/doc/PROMPT.md` — Current Mission / Current Work Order
2. `/doc/STATE.md` — Current Project State / Current Step / Next Gate
3. `/doc/STANDING_INSTRUCTIONS.md` — Universal Governance Rules

สามไฟล์นี้คือ BASE CONTEXT

### 2. CONDITIONAL CONTEXT — อ่านเฉพาะเมื่อจำเป็น
#### `/doc/ROADMAP.md`
อ่านเมื่อ:
- ต้องตรวจ Phase / Step status
- ต้องตรวจ dependency
- ต้องตรวจ next phase / future phase
- Current Work Order อ้างถึง Roadmap

ไม่ต้องอ่านทุก Step หาก PROMPT.md + STATE.md มีข้อมูลเพียงพอสำหรับการทำงาน

#### PHASE5_DESIGN_DRAFT.md
อ่านเฉพาะเมื่อ:
- Current Work Order อยู่ใน Phase 5
- ต้องตรวจ Phase 5 architecture / constraint / design intent
- Current Work Order อ้างถึง Design Draft

ไม่ต้องอ่านหลัง Phase 5 จบ เว้นแต่ต้องตรวจ historical design decision

#### PHASE5_TASK_BREAKDOWN_TEMPLATE.md
อ่านเฉพาะเมื่อ:
- Current Work Order อยู่ใน S30–S34
- ต้องตรวจ acceptance criteria / dependency / sub-task ของ S นั้น

ไม่ต้องอ่านทั้งไฟล์หาก Current Work Order ระบุ section ที่เกี่ยวข้อง ให้เปิดเฉพาะส่วนของ Current S เมื่อทำได้

#### ROADMAP_ARCHIVE.md / *_ARCHIVE.md
DEFAULT = DO NOT READ

ให้อ่านเฉพาะเมื่อ:
- Current Work Order ต้องการ historical decision
- ต้องตรวจเหตุผลของ architecture ที่ไม่มีอยู่ใน Active Docs
- ต้อง resolve ambiguity ที่ Active Docs ไม่สามารถตอบได้

Archive ไม่ใช่ Current State และไม่ใช่ Current Work Order

### 3. CODEBASE CONTEXT — อ่านเฉพาะ Touch Points
หลังอ่าน Base Context แล้ว:
- อย่า scan repository ทั้งหมดโดย default
- ให้เริ่มจากไฟล์ที่ Current Work Order ระบุ
- ตรวจ components / services / repositories ที่เป็น Touch Points
- ตรวจ direct dependencies ที่จำเป็นต่อการเปลี่ยนแปลง
- ตรวจ tests ที่เกี่ยวข้อง

ค่อยขยาย scope เมื่อพบ dependency จริง

ห้ามอ่าน source files จำนวนมากเพียงเพื่อ "ทำความเข้าใจทั้งโปรเจกต์" ถ้างานปัจจุบันไม่จำเป็น

### 4. CURRENT MISSION IS THE SCOPE BOUNDARY
PROMPT.md = Current Mission

Agent ต้องทำเฉพาะ Current Work Order

ห้าม:
- ทำงานของ S ถัดไป
- เริ่ม Phase ถัดไป
- refactor ที่ไม่เกี่ยวข้อง
- polish ที่ไม่เกี่ยวข้อง
- แก้ documentation ที่ไม่จำเป็น
- เพิ่ม feature นอก scope

หากพบงานที่ควรทำในอนาคต: ให้รายงานเป็น Follow-up / Technical Debt และไม่ implement

### 5. VALIDATION POLICY
อย่าบังคับ `npm run lint` และ `npm run build` แบบไม่มีเงื่อนไขในทุกงาน

ให้เลือก Validation ตามประเภทของ Work Order

#### A. Source Code / UI / Config / Architecture-impacting Change
อย่างน้อยต้อง run:
- `npm run lint`
- `npm run build`
- tests ที่เกี่ยวข้องกับ touch points

หาก Current Work Order ระบุ test suite เพิ่มเติม ต้องทำตามนั้นด้วย

#### B. Logic / Data / Repository / AI / Retrieval Change
ต้อง run:
- `npm run lint`
- `npm run build`
- tests / regression ที่เกี่ยวข้อง

ถ้ามี data contract หรือ state transition ต้อง validate behavior ที่เกี่ยวข้องด้วย

#### C. UI-only Change
ต้อง run:
- `npm run lint`
- `npm run build`
- relevant UI / integration tests ถ้ามี

#### D. Documentation-only / Planning / Audit
ไม่ต้องบังคับ:
- `npm run lint`
- `npm run build`

ให้ตรวจ:
- consistency
- correctness
- state transition
- references
- scope compliance

#### E. Phase / Master Gate / Closeout
ต้องทำ Full Required Validation ตาม Acceptance Criteria ของ Phase / Master Gate

หาก Gate กำหนด:
- Regression
- Build
- Lint
- E2E
- Disable switch
- HITL
- Rollback

ต้องทำครบตาม Gate

### 6. VALIDATION IS NOT TOKEN OPTIMIZATION
ห้ามข้าม validation ที่จำเป็นเพียงเพื่อลด Token

เป้าหมายคือ:
- ลดการอ่าน Context ที่ไม่จำเป็น

ไม่ใช่:
- ลดการตรวจสอบความถูกต้อง

### 7. DOCUMENT UPDATE POLICY
หลังงานเสร็จ:

#### STATE.md
อัปเดตเฉพาะ:
- Current Step
- Step Status
- Phase Status
- Next Step / Next Gate
- Relevant Handoff Information

ห้าม regenerate STATE.md ทั้งไฟล์โดยไม่จำเป็น

#### PROMPT.md
อัปเดตเฉพาะเมื่อ:
- Current Work Order เปลี่ยน
- Step เสร็จและมี Next Work Order ที่ได้รับอนุมัติแล้ว
- Phase Transition เกิดขึ้น

ห้ามเปลี่ยน PROMPT.md ให้กลายเป็น Project History

#### ROADMAP.md
แก้เฉพาะ targeted status lines / tables

ห้าม regenerate ทั้งไฟล์

#### CHANGELOG.md
เพิ่มเฉพาะเมื่อ Standing Instructions หรือ Current Work Order กำหนดให้บันทึก

### 8. STATE TRANSITION INVARIANT
ใช้กฎ:
- `CURRENT STEP → COMPLETE`
- `NEXT STEP → NEXT / PENDING`

ตัวอย่าง:
- `S32 Complete → S33 Next`
- `S33 Complete → S34 Next`
- `S34 Complete → Phase 5 Complete`
- `Phase 5 Complete → Phase 6 Pending / Next`
- `Phase 6 Implementation → NOT STARTED`

### 9. PHASE COMPLETION RULE
Phase N สามารถเป็น COMPLETE ได้ต่อเมื่อ:
- required steps ของ Phase N complete
- Master Gate ของ Phase N passed
- required validation passed
- handoff completed ถ้ามี

ห้าม mark Phase อนาคตเป็น Complete

### 10. PHASE TRANSITION RULE
เมื่อ Phase ปัจจุบัน Complete:
- `CURRENT PHASE = Complete`
- `NEXT PHASE = Pending / Planned`
- `IMPLEMENTATION = NOT STARTED`

ห้ามเริ่ม Phase ถัดไปโดยอัตโนมัติ

ต้องรอ:
- User / Architect Kickoff
- Architecture Discovery
- Design Gate

ก่อน implementation

### 11. DESIGN GATE RULE
หาก Work Order เป็น:
- Architecture change
- New subsystem
- New Phase
- Major UI/UX change
- New data model
- New intelligence behavior

ต้องหยุดที่ Design / Planning ก่อน implementation หาก Current Work Order กำหนด Design Gate

Agent สามารถ:
- audit
- propose
- analyze
- recommend

แต่ห้ามถือว่า proposal = approval

### 12. TOKEN-EFFICIENT READING ORDER
ใช้ลำดับนี้เสมอ:
1. PROMPT.md
2. STATE.md
3. STANDING_INSTRUCTIONS.md
4. Current Work Order referenced docs
5. Relevant source files
6. Direct dependencies only
7. Tests
8. Archive only if unresolved ambiguity remains

ห้ามเริ่มจาก:
- ROADMAP_ARCHIVE
- อ่าน documentation ทั้ง `/doc/`

### 13. STOP READING RULE
เมื่อมีข้อมูลเพียงพอสำหรับการทำ Current Work Order แล้ว: STOP READING

ไม่ต้องอ่านไฟล์เพิ่มเติมเพื่อ "ให้แน่ใจ" หากไม่มี dependency หรือคำถามที่ยังตอบไม่ได้

หากพบข้อมูลขัดแย้ง: หยุดและรายงาน conflict ก่อนแก้เอง

### 14. FINAL REPORT
เมื่อเสร็จ ให้รายงานสั้น ๆ:

#### Context Used
- Required files ที่อ่าน
- Conditional files ที่อ่าน
- Source areas ที่ตรวจ

#### Validation
- lint: PASS / N/A
- build: PASS / N/A
- tests: PASS / N/A

#### State Transition
- Current Step
- Completed Step
- Next Step / Gate

#### Files Changed
เฉพาะไฟล์ที่แก้จริง

ห้ามรายงาน documentation ทั้งหมด หากไม่ได้อ่านหรือแก้ไข

### FINAL RULE
เป้าหมายของ SI-6 คือ:
- "อ่านให้น้อยที่สุดเท่าที่เพียงพอ แต่ทำงานและตรวจสอบให้ครบเท่าที่จำเป็น"

Correctness > Token Saving

แต่ Unnecessary Context Reading = ห้ามทำ

