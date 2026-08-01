# PROMPT.md — Current Step Work Order

> **PHASE 4D — S28: PIE Memory Context Final Wiring**
> **My Life OS — Brain Intelligence Engine (BIE)**

---

## 📌 สิ่งแรกที่ต้องทำ

1. อ่าน `/doc/STATE.md` (current step = S28, constraints, allowed files)
2. ปฏิบัติตาม `/doc/STANDING_INSTRUCTIONS.md` (ทุก workflow rule)

---

## 🎯 PRIMARY DELIVERABLE (S28 = PIE Memory Context Final Wiring)

- Enrich PIE retrieval context (`PipelineContext`) with Identity Profile summary & Timeline Insights
- Only user-confirmed (`applied: true`) identity & insight data are injected into the prompt context (P4-12 HITL invariant)
- Preserve `bieEnabled === false` zero-impact fallback path

---

## ⚙️ WORK ORDER — EXECUTE IN ORDER

### S28 Step 1 of 4 — Read-only exploration:
- Read `/doc/STATE.md` & `/doc/ROADMAP.md` → confirm S27 = ✅ Complete, S28 = THIS STEP
- Inspect PIE memory retrieval layer (`src/pie/layers/memoryRetrieval.ts`) to understand context enrichment hooks

### S28 Step 2 of 4 — Implement Memory Context Enrichment:
- Retrieve applied `IdentityProfile` summary from repository if available.
- Retrieve applied `Insight` items or timeline breakdown if available.
- Inject formatted identity/timeline context into `PipelineContext.retrievedMemories` or persona system prompt context safely.

### S28 Step 3 of 4 — Verification & Tests:
- Verify that `bieEnabled: false` bypasses identity enrichment cleanly.

### S28 Step 4 of 4 — Verification & Doc Closeout:
- `npm run lint` & `npm run build` → must exit 0
- `CHANGELOG.md`: append S28 closeout section at TOP (≤15 lines per SI-2)
- `ROADMAP.md`: update Phase 4D row → In Progress S28 ✅ (6/7)
- `STATE.md`: update Current Step → Phase 4D S29 (Phase 4 Master Closeout & Gate)
- `PROMPT.md`: overwrite with S29 handoff

---

> **END OF S28 HANDOFF PROMPT.**
