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
