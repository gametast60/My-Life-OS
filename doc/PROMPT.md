# PROMPT.md — Current Step Work Order

> **PHASE 4D — S24: Identity Engine (Singleton Row)**
> **My Life OS — Brain Intelligence Engine (BIE)**

---

## 📌 สิ่งแรกที่ต้องทำ

1. อ่าน `/doc/STATE.md` (current step = S24, constraints, allowed files)
2. ปฏิบัติตาม `/doc/STANDING_INSTRUCTIONS.md` (ทุก workflow rule)

---

## 🎯 PRIMARY DELIVERABLE (S24 = Identity Engine — Singleton Row)

- `IdentityEngine` provider interface + `DefaultIdentityEngine` concrete class
- Scan Brain Tree + Journal evidence → build 8-category `IdentityProfile`
- Temporal similarity compare (cosine: current vs prior snapshot)
- Additive wiring to `BrainIntelligenceRepository` + `RoomBrainIntelligenceRepository` for `bie_identity` storage
- All identity_update proposals: `applied: false` (P4-12 HITL invariant)

---

## ⚙️ WORK ORDER — EXECUTE IN ORDER

### S24 Step 1 of 4 — Read-only exploration:
- Read `/doc/STATE.md` & `/doc/ROADMAP.md` → confirm S23 = ✅ Complete, S24 = THIS STEP
- Read `/src/pie/bie/identity/types.ts` → understand IdentityProfile, InsightItem, TimelineEntry contracts
- Read `/src/pie/bie/BrainIntelligenceRepository.ts` → understand existing repository interface

### S24 Step 2 of 4 — Implement IdentityEngine:

Create `/src/pie/bie/identity/identityEngine.ts` with:
- `IdentityEngine` interface: `buildProfile(context): Promise<IdentityProfile>`, `compareProfiles(a, b): number` (cosine similarity 0-1)
- `DefaultIdentityEngine` class: scan evidence → bucket into 8 IdentityCategory → score by frequency + recency + confidence
- Temporal compare: embed 8-category label sets → cosine similarity between two IdentityProfile snapshots
- All generated profiles: `applied: false` (readonly literal, P4-12)

Update `/src/pie/bie/identity/index.ts` to re-export identityEngine.

### S24 Step 3 of 4 — Wire Repository:
- Add `getIdentityProfile(): Promise<IdentityRow | undefined>` to `BrainIntelligenceRepository.ts`
- Add `saveIdentityProfile(profile: IdentityRow): Promise<void>` to `BrainIntelligenceRepository.ts`
- Implement both methods in `RoomBrainIntelligenceRepository.ts` (additive only; `bie_identity` store = singleton key "singleton")

### S24 Step 4 of 4 — Verification & Doc Closeout:
- `npm run lint` & `npm run build` → must exit 0
- `CHANGELOG.md`: append S24 closeout section at TOP (≤15 lines per SI-2)
- `ROADMAP.md`: update Phase 4D row → In Progress S24 ✅ (2/7)
- `STATE.md`: update Current Step → Phase 4D S25 (Insight Generator)
- `PROMPT.md`: overwrite with S25 handoff

---

> **END OF S24 HANDOFF PROMPT.**
