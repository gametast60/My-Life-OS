# PROMPT.md — Current Step Work Order

> **PHASE 4D — S27: Proposal Queue Integration**
> **My Life OS — Brain Intelligence Engine (BIE)**

---

## 📌 สิ่งแรกที่ต้องทำ

1. อ่าน `/doc/STATE.md` (current step = S27, constraints, allowed files)
2. ปฏิบัติตาม `/doc/STANDING_INSTRUCTIONS.md` (ทุก workflow rule)

---

## 🎯 PRIMARY DELIVERABLE (S27 = Proposal Queue Integration)

- Wire Identity and Insight proposals to the pending queue as `identity_update` and `insight_proposal` kinds
- Update `applyPendingBieItem(id)` in `RoomBrainIntelligenceRepository` to handle side effects:
  - If `kind === "identity_update"`, save the profile payload to `bie_identity` with `applied: true` and clear item from queue.
  - If `kind === "insight_proposal"`, save the insight payload to `bie_insights` with `applied: true` and clear item from queue.
- Maintain P4-12 HITL invariant (all queue items must start as `applied: false`)

---

## ⚙️ WORK ORDER — EXECUTE IN ORDER

### S27 Step 1 of 4 — Read-only exploration:
- Read `/doc/STATE.md` & `/doc/ROADMAP.md` → confirm S26 = ✅ Complete, S27 = THIS STEP
- Read `/src/pie/bie/RoomBrainIntelligenceRepository.ts` → locate `applyPendingBieItem` and `appendPendingBieItem` methods

### S27 Step 2 of 4 — Implement Side Effects in applyPendingBieItem:
- Update `applyPendingBieItem` to read the pending item by id.
- Inspect the item's `kind`:
  - If `"identity_update"`: extract the `IdentityProfile` payload, save it to `bie_identity` using `saveIdentityProfile()` with `applied: true`.
  - If `"insight_proposal"`: extract the `InsightItem` payload, save it to `bie_insights` using `appendInsight()` with `applied: true`.
- Remove the pending item from `bie_pending_queue`.

### S27 Step 3 of 4 — Verify Queue Routing logic:
- Ensure the types and properties map correctly from payload properties to target DB structures.

### S27 Step 4 of 4 — Verification & Doc Closeout:
- `npm run lint` & `npm run build` → must exit 0
- `CHANGELOG.md`: append S27 closeout section at TOP (≤15 lines per SI-2)
- `ROADMAP.md`: update Phase 4D row → In Progress S27 ✅ (5/7)
- `STATE.md`: update Current Step → Phase 4D S28 (PIE Memory Context Final Wiring)
- `PROMPT.md`: overwrite with S28 handoff

---

> **END OF S27 HANDOFF PROMPT.**
