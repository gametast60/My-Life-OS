# STATE.md — Handoff Single Source of Truth

> ไฟล์นี้คือสิ่งแรกที่ AI ต้องอ่านก่อนเริ่มงาน **ทุกครั้ง**
> ควรมีขนาดไม่เกิน ~100 บรรทัดเสมอ — detail ดูไฟล์อื่นตาม pointer

---

## Current Step

**Phase 5 — S30: Define Phase 5 Product Surface & Confirm UX Contract**
Deliverable:
1. Define minimum user-visible BIE surfaces Phase 5 will expose (Semantic Discovery, Identity Review, Insight Center, Timeline Explorer, Pending Queue Confirm flow).
2. Map each surface to existing engine / repository capability (SemanticService, IdentityEngine, InsightGenerator, TimelineBuilder, `bie_pending_queue`).
3. Establish HITL confirm-review contract for pending BIE items (confirm / reject / edit behavior + undo / safe rollback requirement).
4. Produce concrete Phase 5 product map doc (or update PHASE5_DESIGN_DRAFT.md section F/G with post-S29 audit corrections).

Status Before Start:
- ✅ Phase 4A S1–S9 ← **PHASE 4A COMPLETE**
- ✅ Phase 4B S10–S16 ← **PHASE 4B COMPLETE**
- ✅ Phase 4C S17–S22 ← **PHASE 4C COMPLETE**
- ✅ Phase 4D S23–S29 ← **PHASE 4D COMPLETE (Master Gate 2026-08-01)**
- ⏳ Phase 5 S30 — Define Phase 5 Product Surface & UX Contract (THIS STEP)

---

## Active Hard Constraints (Phase 5 scope)

| ID | Constraint |
|----|------------|
| P4-8 | Strict Widening Only: 7 `aiService.ts` facade signatures remain UNTOUCHED unless Phase 5 explicitly widens them. |
| P4-12 | HITL invariant: unconfirmed BIE items (`applied: false`) must never silently enrich context or persist structural changes. |
| P4-14 | `bieEnabled=false` must continue to preserve Pre-Phase-4 keyword-only baseline 100% across all Phase 5 changes. |
| P5-1 | NEW — No autonomous AI actions: every BIE-generated suggestion must enter `bie_pending_queue` first; only user-confirm triggers `applyPendingBieItem`. |
| P5-2 | NEW — Undo/rollback safety: any Phase 5 UI action affecting identity, insight, tag merge, or relationship must be reversible without data corruption. |

---

## Files Allowed / Forbidden (S30)

✅ ALLOWED (S30 = read-only audit + doc only):
- `/doc/PHASE5_DESIGN_DRAFT.md` (update sections F & G with post-S29 audit corrections)
- `/doc/ROADMAP.md` (Phase 5 row + Phase 5 sub-step table when defined)
- `/doc/STATE.md` (update for S31)
- `/doc/PROMPT.md` (overwrite with S31 handoff)
- `/doc/CHANGELOG.md` (append S30 closeout section)

❌ FORBIDDEN (no modification in S30 — product-surface only planning step):
- Any UI View / Settings / Chat / BIE UI component (no coding yet in S30)
- `aiService.ts` 7 facade methods (P4-8)
- Engine logic files unless audit reveals a critical broken dependency
- `RoomBrainIntelligenceRepository` (no schema or method changes until S31+)

---

## Readiness Checklist (before ANY code edit)

- [ ] LS `/doc/` — all core docs exist
- [ ] Read ROADMAP.md → confirm Phase 4D = ✅ Complete; Phase 5 S30 = THIS STEP
- [ ] Read CHANGELOG.md → confirm S29 entry exists at top
- [ ] Read `/doc/PHASE5_DESIGN_DRAFT.md` Sections A–G → understand post-S29 audit reality
- [ ] Understood: S30 = product surface definition + UX contract; no new code yet.
- [ ] After S30 → UPDATE DOCS + PROMPT.md for S31 (BIE Discovery & Review Surface)

---

## 🔴 MUST READ ทุก Step (ก่อนเริ่มงานเสมอ)

| ไฟล์ | เหตุผล |
|------|--------|
| /doc/STANDING_INSTRUCTIONS.md | Standing Workflow Rules |
| /doc/ROADMAP.md | ยืนยัน phase/step status — อ่านเฉพาะ Banner ด้านบนไฟล์ ไม่ต้องอ่าน 4B/4C/4D detail table ยกเว้นเกี่ยวข้องกับ step ปัจจุบันโดยตรง |
| /doc/PROMPT.md | Current Step Work Order |
| /doc/PHASE5_TASK_BREAKDOWN_TEMPLATE.md | อ่านเฉพาะ section ของ step ปัจจุบัน (เช่น S31 อ่านแค่ section S31) |

## 🟢 REFERENCE ONLY — อ่านเฉพาะเมื่อจำเป็นจริง (ไม่ใช่ routine ทุก step)

| ไฟล์ | อ่านเมื่อไหร่ |
|------|--------------|
| /doc/AI_ARCHITECTURE.md | ต้องเช็ค current architecture ก่อนแก้สิ่งที่กระทบ layer/data flow/folder structure |
| /doc/CHANGELOG.md | ต้องยืนยัน step ก่อนหน้าปิดจริง — เช็คแค่ entry บนสุด (ไม่ต้องอ่านทั้งไฟล์) |
| /doc/DECISIONS.md | ต้องเช็ค active ADR ที่ constrain การตัดสินใจปัจจุบัน |
| /doc/KNOWN_ISSUES.md | ต้องเช็ค known limitation ที่เกี่ยวกับงานปัจจุบัน |
| /doc/PHASE5_DESIGN_DRAFT.md | ต้องอ้างอิง design decision ที่ยังไม่ปิด (S30-S34 ระหว่างดำเนินการ) |
| *_ARCHIVE.md ทุกไฟล์ (AI_ARCHITECTURE_ARCHIVE, CHANGELOG_ARCHIVE, DECISIONS_ARCHIVE, KNOWN_ISSUES_ARCHIVE, ROADMAP_ARCHIVE) | เฉพาะตอน debug ประวัติ / สืบสาเหตุ decision เก่า / ต้องหา step-by-step rationale ของ sub-step ที่ปิดไปแล้ว — ไม่ใช่งาน routine |
