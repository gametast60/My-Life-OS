# PROMPT.md — Current Step Work Order

> **PHASE 4D — S29: Phase 4 Master Closeout & Gate**
> **My Life OS — Brain Intelligence Engine (BIE)**

---

## 📌 สิ่งแรกที่ต้องทำ

1. อ่าน `/doc/STATE.md` (current step = S29, constraints, allowed files)
2. ปฏิบัติตาม `/doc/STANDING_INSTRUCTIONS.md` (ทุก workflow rule)

---

## 🎯 PRIMARY DELIVERABLE (S29 = Phase 4 Master Closeout & Gate)

- Run master BIE regression gate: 7 AI features × (`bieEnabled: true` / `bieEnabled: false`) integrity baseline
- Confirm full Phase 4A–4D lint/build exit 0; mark Phase 4D ✅ Complete in ROADMAP
- Handoff to Phase 5 (Full Intelligence Platform + UI) via STATE.md + PROMPT.md

---

## ⚙️ WORK ORDER — EXECUTE IN ORDER

### S29 Step 1 of 5 — Read-only exploration:
- Read `/doc/STATE.md` & `/doc/ROADMAP.md` → confirm S28 = ✅ Complete, S29 = THIS STEP
- Review Phase 4A–4D CHANGELOG entries for regression scope checklist

### S29 Step 2 of 5 — Master Regression Gate:
- Verify 7 AI features with `bieEnabled: false` → Pre-Phase-4 keyword-only baseline unchanged
- Verify 7 AI features with `bieEnabled: true` → BIE hooks active (semantic, graph, identity context)
- Confirm P4-12 HITL: unconfirmed identity/insights never appear in `retrievedMemory.bieEnrichment`

### S29 Step 3 of 5 — Build & Lint Gate:
- `npm run lint` & `npm run build` → must exit 0
- Fix only minimal regressions if found (stay within S29 allowed scope)

### S29 Step 4 of 5 — Phase 4 Doc Closeout:
- `CHANGELOG.md`: append S29 closeout section at TOP (≤15 lines per SI-2)
- `ROADMAP.md`: Phase 4D row → ✅ Complete (7/7); update progress summary
- `AI_ARCHITECTURE.md`: Phase 4 master closeout banner if architecture state warrants update

### S29 Step 5 of 5 — Phase 5 Handoff:
- `STATE.md`: update Current Step → Phase 5 kickoff
- `PROMPT.md`: overwrite with Phase 5 S1 handoff (Full Intel Platform + UI)

---

> **END OF S29 HANDOFF PROMPT.**
