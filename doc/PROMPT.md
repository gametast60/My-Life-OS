# PROMPT.md — Current Step Work Order

> **PHASE 5 — S30: Define Phase 5 Product Surface & Confirm UX Contract**
> **My Life OS — Brain Intelligence Engine (BIE) Productization**

---

## 📌 สิ่งแรกที่ต้องทำ

1. อ่าน `/doc/STATE.md` (current step = S30, constraints, allowed files)
2. ปฏิบัติตาม `/doc/STANDING_INSTRUCTIONS.md` (ทุก workflow rule)
3. เปิด `/doc/PHASE5_TASK_BREAKDOWN_TEMPLATE.md` section S30 (sub-task S30.1–S30.4) เพื่อใช้เป็น reference สำหรับการวาง scope และ handoff

---

## 🎯 PRIMARY DELIVERABLE (S30 = Phase 5 Product Surface Definition)

- อ่านและ audit `/doc/PHASE5_DESIGN_DRAFT.md` sections A–G ทั้งหมด (post-S29 reality check)
- กำหนด minimum user-visible BIE surfaces Phase 5 จะ expose พร้อม map ไปยัง existing engine/repo capability
- กำหนด HITL confirm-review contract (confirm / reject / edit / undo behavior)
- อัปเดต `/doc/PHASE5_DESIGN_DRAFT.md` section F & G ให้ตรงกับ post-S29 code reality

---

## ⚙️ WORK ORDER — EXECUTE IN ORDER

### S30 Step 1 of 4 — Read-only audit:
- Read `/doc/STATE.md` + `/doc/ROADMAP.md` → confirm Phase 4D ✅ Complete; S30 = THIS STEP
- Read `/doc/PHASE5_DESIGN_DRAFT.md` sections A–G fully → understand current code reality vs design vision
- Identify any gaps between design draft and actual Phase 4 code state after S29 gate

### S30 Step 2 of 4 — Product surface definition:
- Define explicit list of Phase 5 user-visible surfaces:
  1. BIE Discovery & Semantic Search UI
  2. Pending Queue Review Screen (confirm / reject / edit)
  3. Identity Review UI (`bie_identity` → user confirm → `applied: true`)
  4. Insight Center UI (`bie_insights` → user confirm → `applied: true`)
  5. Timeline Explorer UI (`bie_timeline` → read-only view)
- Map each surface → existing engine/repo method that produces its data
- Confirm which surfaces can start in S31 vs later sub-steps

### S30 Step 3 of 4 — UX Contract definition:
- Define HITL confirm-review contract explicitly:
  - Confirm: calls `applyPendingBieItem(id)` → `applied: true`, persists structural change
  - Reject: removes item from pending queue, no structural change
  - Edit: modifies proposed content in-place before calling confirm
  - Undo: define rollback strategy for each surface (identity, insight, tag merge, relationship)
- Verify P5-1 and P5-2 constraints are satisfied by the contract

### S30 Step 4 of 4 — Doc closeout + S31 handoff:
- Update `/doc/PHASE5_DESIGN_DRAFT.md` sections F & G with corrected S-step decomposition
- `CHANGELOG.md`: append S30 closeout section at TOP (≤15 lines per SI-2)
- `ROADMAP.md`: add Phase 5 sub-step table if not present; update S30 → ✅ Complete
- `STATE.md`: update Current Step → Phase 5 S31
- `PROMPT.md`: overwrite with S31 handoff (BIE Discovery & Review Surface) และอ้างอิง `/doc/PHASE5_TASK_BREAKDOWN_TEMPLATE.md` section S31 (sub-task S31.1–S31.4); pattern เดียวกันควรสืบทอดต่อใน S32/S33/S34 ตามลำดับ

---

> **END OF S30 HANDOFF PROMPT.**
