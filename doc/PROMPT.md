# PROMPT.md — Current Step Work Order

> **PHASE 4D — S23: Identity Layer Kickoff — Type & Interface Contracts**
> **My Life OS — Brain Intelligence Engine (BIE)**

---

## 📌 สิ่งแรกที่ต้องทำ

1. อ่าน `/doc/STATE.md` (current step = S23, constraints, allowed files)
2. ปฏิบัติตาม `/doc/STANDING_INSTRUCTIONS.md` (ทุก workflow rule)

---

## 🎯 PRIMARY DELIVERABLE (S23 = Identity Layer Type & Interface Contracts)

New files (src/pie/bie/identity/):
- `types.ts` — Identity singleton, InsightItem (6-type), TimelineEntry, + DB row shapes
- `index.ts` — barrel export

Widening (src/pie/bie/types.ts — additive only):
- Re-export all identity types
- Widen `BiePendingKind` union: add `"identity_update"` | `"insight_proposal"`

---

## ⚙️ WORK ORDER — EXECUTE IN ORDER

### S23 Step 1 of 4 — Read-only exploration:
- Read `/doc/STATE.md` & `/doc/ROADMAP.md` → confirm Phase 4C = ✅ Complete, Phase 4D S23 = THIS STEP
- Read `/doc/ROADMAP_ARCHIVE.md` → review Phase 4D deliverable scope

### S23 Step 2 of 4 — Create type contracts:

Create `/src/pie/bie/identity/types.ts` with:

```ts
// Identity singleton types
export interface IdentityProfile { ... }
export interface IdentityRow { ... }  // IndexedDB storage row

// Insight types
export type InsightType = "reflection" | "pattern" | "milestone" | "gap" | "conflict" | "prediction";
export interface InsightItem { ... readonly applied: false }  // P4-12
export interface InsightRow { ... }  // IndexedDB storage row

// Timeline types
export type TimelineGranularity = "month" | "quarter" | "year";
export interface TimelineEntry { ... }
export interface TimelineRow { ... }  // IndexedDB storage row
```

Create `/src/pie/bie/identity/index.ts` (barrel export).

### S23 Step 3 of 4 — Widen types.ts:
- Add re-exports for identity types
- Widen `BiePendingKind`: `| "identity_update" | "insight_proposal"`

### S23 Step 4 of 4 — Verification & Doc Closeout:
- `npm run lint` & `npm run build` → must exit 0
- `CHANGELOG.md`: append S23 closeout section at TOP (≤15 lines per SI-2)
- `ROADMAP.md`: update Phase 4D row → In Progress S23 ✅
- `STATE.md`: update Current Step → Phase 4D S24 Implementation
- `PROMPT.md`: overwrite with S24 handoff

---

> **END OF S23 HANDOFF PROMPT.**
