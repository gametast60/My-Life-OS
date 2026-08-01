# PHASE 5 DESIGN DRAFT

## Scope Note
This document is a design workshop artifact only. It is based on the actual repository implementation and roadmap context as of 2026-08-01. No roadmap state was modified.

---

## A. Phase 4 Capability Audit (Code Reality vs Roadmap Claims)

| Layer | Roadmap claim | Code reality | Gap / Stub / Risk |
|---|---|---|---|
| bie_embeddings + Semantic Search | ✅ Complete | Real implementation exists in SemanticService, VectorIndex, and RoomBrainIntelligenceRepository. Embedding cache is persisted in bie_embeddings and used for semantic lookup. | The feature is real, but it is not yet wired as a first-class user-facing experience; it is mostly an internal retrieval enrichment hook. |
| Knowledge Graph (Nodes/Edges) | ✅ Complete | Repository has graph storage methods and graph-related types, but the graph engine modules are mostly scaffolded or partial. | The graph layer is not yet a fully functioning product capability; many graph modules are placeholders or thin helpers rather than proven end-to-end behavior. |
| Reflection Engine (Merge/Conflict/Decay) | ✅ Complete | Reflection-related modules and types exist, including conflict detection, evidence consolidation, decay, and a reflector runner. | These modules are present as engine scaffolding; there is no evidence here of a fully proven, user-visible reflection loop with regression coverage. |
| Identity Singleton | ✅ Complete | Repository has bie_identity persistence and an identity engine plus profile compare logic. | The capability exists, but it is still an engine-only foundation. It is not yet proven as a stable user-controlled workflow. |
| Insight Generator (6 Types) | ✅ Complete | Insight generator and persistence exist, with six insight types implemented heuristically. | The implementation is real but heuristic-driven and still needs user confirmation flow and productization. |
| Life Timeline (M/Q/Y) | ✅ Complete | Timeline builder and repository persistence exist for month/quarter/year buckets. | It is implemented as a cache builder and not yet demonstrated as a full product UI/workflow. |

### Notable Stub / TODO / Partial Areas
- The semantic retrieval path is real and used by RoomBrainRepository, but it is still an additive enrichment hook rather than a standalone BIE product surface.
- Graph capability is partially represented in storage and helper modules, but the roadmap’s “complete” wording is stronger than what is evidenced by the code alone.
- Reflection and identity/insight/timeline modules are present, but the workshop should treat them as foundation engines rather than fully integrated user workflows.

---

## B. Phase 4 Integration Reality Map

### Reality Map (Code-based)

```text
4A Semantic Retrieval
       ↓
RoomBrainRepository (legacy memory retrieval + BIE hybrid hook)
       ↓
MemoryRetrieval layer (PIE retrieval enrichment)
       ↓
PipelineContext
       ↓
RoomBrainIntelligenceRepository (BIE SSOT + pending queue)
       ↓
UI / User Confirmation (planned, not yet fully productized)
```

### Dependency Status by Layer

- 4A Semantic Retrieval
  - ✅ Real integration into RoomBrainRepository retrieval path
  - ⚠️ Partial integration into the broader user-facing PIE flow; still mostly additive and not fully surfaced

- 4B Knowledge Graph
  - ⚠️ Partial integration via repository methods and graph module scaffolding
  - 🟡 Some pieces exist, but end-to-end workflow is not demonstrated here

- 4C Reflection
  - 🟡 Present as engine modules and repository-side storage hooks
  - ⚠️ The reflection run loop is not clearly proven as a user-observable workflow in this workspace

- 4D Identity / Insight / Timeline
  - ✅ Real engine + persistence exists
  - ⚠️ Integration into app UI and confirmation experience is still incomplete

### Reality Map Interpretation
The code shows a graph-like architecture rather than a strict linear chain. The strongest real dependencies are:
- semantic retrieval → repository-based memory retrieval → PIE context enrichment
- identity/insight/timeline → repository persistence → later use by memory retrieval enrichment
- pending queue → confirm workflow concept exists, but the product UI is not yet clearly completed in the codebase

This means Phase 5 should not be framed as “just add UI around a finished engine”; it should focus on productizing the existing BIE foundations into user-visible, controllable flows.

---

## C. Gap Analysis vs Vision

### What can be pulled into Phase 5 immediately
These are foundation-ready because Phase 4 already has some implementation behind them:
- BIE-based memory enrichment in the PIE retrieval layer
- Identity profile generation and persistence
- Insight generation and persistence
- Timeline generation and persistence
- HITL-safe pending queue architecture for structural suggestions

### What is still not ready for Phase 5 as a full product capability
These remain too immature to treat as completed capabilities from the code alone:
- Full end-user graph exploration and graph editing workflows
- Fully reliable reflection-driven merge/conflict workflows
- Fully integrated “second brain” UX with strong confirmation and undoability
- Cross-device sync / MCP / service worker as core product requirements; these are still architectural possibilities rather than proven repo foundations

### Phase 5 Scope Guidance
The old archive content about BIE UI Suite, MCP, service worker, and sync should be treated only as a preliminary landscape, not as a mandatory checklist. The code evidence suggests the highest-value Phase 5 work is to connect the existing BIE foundations to actual human-controlled flows.

---

## D. Phase 5 Goal Definition

### Proposed Phase 5 Name
BIE Productization + Human-in-the-Loop + Learning Loop Closure

### Goal Statement
1. Make the existing BIE intelligence visible and usable to the user through product-facing surfaces.
2. Make user review, confirmation, rejection, and editing of AI-proposed knowledge an explicit and safe part of the experience.
3. Close the feedback and learning loop so that user confirmation, rejection, and edits feed back into BIE state and future retrieval context.

### Core Learning Loop
```text
AI Observes
    ↓
AI Learns
    ↓
AI Proposes
    ↓
USER REVIEWS
    ↓
USER CONFIRMS / REJECTS / EDITS
    ↓
Persist
    ↓
Future Retrieval Improves
```

### Learning Loop Closure as Core Acceptance Criteria
Phase 5 is not complete unless the team can demonstrate an end-to-end flow:
```text
AI Proposal
    ↓
Pending
    ↓
User Review
    ↓
Confirm
    ↓
applied=true
    ↓
Persist
    ↓
Future Retrieval
    ↓
Improved Context
```

Reject and Edit must also have explicit behavior in the design and validation plan:
- Reject: remove or dismiss the proposal without applying structural change.
- Edit: allow the user to modify proposed content before persistence.

### Undo / Safe Rollback Requirement
HITL safety must include undo / safe rollback as an architecture requirement. This applies to operations affecting:
- Tag merge
- Identity update
- Insight confirmation
- Relationship update
- Timeline-related changes

The design must not assume that a confirmed action is irreversible without a recovery strategy.

---

## E. Architecture Map for Phase 5

```text
User Interaction Layer
  └─ Confirm / Review / Disable / Explore UIs
         │
         ▼
Phase 5 Product Layer
  ├─ Semantic Search / Discovery UI
  ├─ Identity Review UI
  ├─ Insight Center UI
  ├─ Timeline Explorer UI
  └─ Pending Queue / Confirm Flow
         │
         ▼
PIE 9 Layers + PipelineContext
  └─ Memory Retrieval / Ranking enrichment
         │
         ▼
RoomBrainIntelligenceRepository (BIE SSOT)
  ├─ bie_embeddings
  ├─ bie_graph_nodes / bie_graph_edges
  ├─ bie_identity
  ├─ bie_insights
  ├─ bie_timeline
  └─ bie_pending_queue
         │
         ▼
Existing BIE Engines
  ├─ SemanticService / VectorIndex / HybridScorer
  ├─ Graph modules (partial)
  ├─ Reflection modules (partial)
  ├─ Identity / Insight / Timeline engines
```

### Integration Principles
- Reuse the existing PIE pipeline and PipelineContext.
- Reuse RoomBrainIntelligenceRepository as the single source of truth for BIE state.
- Keep the disable-switch pattern consistent with bieEnabled?: boolean so that the system can fall back to legacy retrieval when disabled.
- Preserve HITL semantics: structural suggestions should remain pending until confirmed.

---

## F. Confirmed Decomposition (Post-S29 Audit — Updated S30)

Following S29 Master Closeout (✅ 2026-08-01), the Phase 4 code audit confirms the sub-phase grouping below. The foundation engines are real but require productization — not from scratch but not trivially wrapping existing engines either.

Confirmed grouping (S30 audit-verified):
- 5A (S31): BIE Discovery & Review Surface — semantic search and pending-review surfaces; maps to SemanticService + bie_pending_queue
- 5B (S32): Identity + Insight Productization — identity review, insight center, and confirmation flow; maps to IdentityEngine + InsightGenerator + bie_identity + bie_insights
- 5C (S33): Timeline + Memory Context UX — timeline explorer and BIE context integration in retrieval experience; maps to TimelineBuilder + enrichWithBieContext
- 5D (S34): Closeout & Hardening — full regression, undo validation, disable-switch safety, handoff

Surface → Engine/Repository mapping (post-S29 audit):
| Phase 5 Surface | Engine/Service | Repository Method | Table |
|---|---|---|---|
| BIE Discovery / Semantic Search | SemanticService / HybridScorer | getSemanticMatches / hybridSearch | bie_embeddings |
| Pending Queue Review Screen | — (queue reader) | getPendingBieItems | bie_pending_queue |
| Identity Review UI | IdentityEngine | getBieIdentity / applyPendingBieItem | bie_identity |
| Insight Center UI | InsightGenerator | getBieInsights / applyPendingBieItem | bie_insights |
| Timeline Explorer UI (read-only) | TimelineBuilder | getBieTimeline | bie_timeline |

Starting sequence: S31 (5A) can start immediately after S30 design gate approval.

---

## G. S-step Decomposition (Post-S29 Audit — S30 Active)

The following S-steps are confirmed after S29 PASS and S30 audit. S30 is the current active step (⏳ 2026-08-02). S31 is next and begins immediately after S30 design gate approval. S32–S34 follow sequentially per dependency chain.

### S30 — Define Phase 5 Product Surface and Confirm UX Contract

หน้าที่:
- Define the minimum user-visible BIE surfaces that Phase 5 will expose.
- Map each surface to an existing engine or repository capability.
- Establish the confirm-review contract for pending BIE items.

Input:
- Existing BIE engines and repository methods
- Current PIE memory retrieval integration
- Current pending queue pattern

Output:
- A concrete Phase 5 product map and UX contract
- Clear list of which BIE changes are user-visible vs engine-only

Dependencies:
- Existing semantic retrieval, identity, insight, timeline, and pending queue foundations

Acceptance Criteria:
- The Phase 5 UI scope is explicit and grounded in current implementation
- The HITL confirm contract is clearly defined

ไม่ทำ (Out of Scope):
- New backend services or external cloud integrations
- Non-essential feature expansion beyond the confirmed product surface

Footprint: Task / UI / AI / Testing

### S31 — Build BIE Discovery & Review Surface

หน้าที่:
- Create a user-visible discovery surface for semantic and memory-context exploration.
- Expose pending BIE suggestions in a review-friendly way.
- Connect the surface to existing semantic retrieval and pending-queue concepts.

Input:
- SemanticService / VectorIndex / HybridScorer outputs
- RoomBrainIntelligenceRepository pending queue

Output:
- Discovery UI and review list for BIE suggestions
- User-visible entry points for semantic context review

Dependencies:
- S30

Acceptance Criteria:
- Users can see and review BIE-generated suggestions without breaking the existing app flow
- The system remains functional when bieEnabled is false

ไม่ทำ (Out of Scope):
- Full graph editing workflow
- Autonomous actions without confirmation

Footprint: Task / UI / AI / Testing

### S32 — Productize Identity + Insight Flow

หน้าที่:
- Surface identity profiles and generated insights in a reviewable UX.
- Connect identity and insight generation to the pending queue and confirm flow.
- Ensure the user can accept or reject generated suggestions.

Input:
- Identity engine and insight generator outputs
- Repository persistence and pending queue behavior

Output:
- Identity review experience
- Insight review experience
- Confirmation handling for applied vs pending state

Dependencies:
- S31

Acceptance Criteria:
- Identity and insight changes are not silently applied
- The user can review and decide before persistence

ไม่ทำ (Out of Scope):
- Advanced long-term identity modeling beyond the current engine capability

Footprint: Task / UI / AI / Testing

### S33 — Productize Timeline + BIE Context in Retrieval Experience

หน้าที่:
- Make timeline output visible as a meaningful part of the app experience.
- Ensure BIE-enriched memory context appears in retrieval flow with clear behavior.
- Keep the experience backward compatible when BIE is disabled.

Input:
- MemoryRetrieval enrichment logic
- Timeline builder output
- Existing PIE context pipeline

Output:
- Timeline view and BIE context integration in the retrieval experience
- Clear fallback behavior when disabled

Dependencies:
- S32

Acceptance Criteria:
- Timeline and BIE context are available in a readable form
- Legacy behavior remains intact when the switch is disabled

ไม่ทำ (Out of Scope):
- Full autonomous proactive behavior beyond the current retrieval context

Footprint: Task / UI / AI / Testing

### S34 — Closeout, Regression, and Handoff

หน้าที่:
- Validate Phase 5 behavior against the current architecture.
- Ensure disable behavior remains safe and backward compatible.
- Document handoff and remaining future work.

Input:
- All Phase 5 surfaces and flows
- Regression checks and build/lint status

Output:
- Final Phase 5 design/implementation handoff package
- Explicit list of what remains for later phases

Dependencies:
- S33

Acceptance Criteria:
- Phase 5 is stable and consistent with the project philosophy
- The remaining gap areas are clearly documented for later phases

ไม่ทำ (Out of Scope):
- Rewriting the roadmap or claiming completion of later intelligence phases

Footprint: Task / UI / AI / Testing

---

## H. Phase 5 Execution Model

```text
S29 PASS
    ↓
PHASE 5 KICKOFF
    ↓
Agent audits final Phase 4 state
    ↓
Agent produces Phase 5 Execution Plan
    ↓
Architect Design Gate
    ↓
Implementation
    ↓
Integration Validation
    ↓
UX / HITL Validation
    ↓
Re-plan if required
    ↓
Phase 5 Closeout
```

The Agent may propose new sub-phase grouping, S-step order, dependencies, implementation order, and testing strategy after the final Phase 4 state is audited. However, implementation must not start until the Architect Design Gate is approved.

---

## I. Design Gate

```text
Phase 5 Kickoff
      ↓
Repository / Architecture Audit
      ↓
Agent proposes execution plan
      ↓
ARCHITECT DESIGN GATE
      ↓
Approved?
 ┌────┴────┐
 NO        YES
 ↓          ↓
Revise    Implement
```

The Design Gate must review at least:
- Architecture impact
- Data model impact
- PIE impact
- BIE impact
- HITL impact
- UI/UX impact
- Scope impact
- Backward compatibility
- bieEnabled=false behavior
- Regression strategy

---

## J. Phase 5 Priority Model

### P0 — Mandatory
These are core Phase 5 requirements:
- BIE user-facing surfaces
- Semantic discovery / memory context
- Identity review
- Insight review
- Timeline experience
- Pending proposal review
- Confirm
- Reject
- Edit
- Undo / safe rollback
- Learning loop closure
- bieEnabled=false fallback
- Regression
- Build
- Lint

### P1 — Optional
- Graph explorer
- Service worker
- MCP / external tools

### P2 — Deferred
- Cross-device sync
- Large-scale proactive automation
- Features belonging to Phase 6+

### Priority Adjustment for MCP / Service Worker / Sync
MCP is Optional / P1.
Service Worker is Optional / P1.
Cross-device sync is Deferred / P2.

Phase 5 core mission remains:
> Productize existing BIE intelligence and close the Human Feedback Loop.

---

## K. Phase 5 Constraints (P5-x) Discovered from Existing Principles

### P5-0 — Phase 5 UI/UX Unlock
Phase 4 UI/UX Freeze ends when S29 Master Closeout passes.

From Phase 5 onward, UI/UX modification is explicitly allowed and expected when required to productize BIE capabilities.

However, UI/UX modification must:
- not break existing workflows
- not bypass PIE
- not bypass the BIE Repository SSOT
- not bypass HITL
- not silently modify user data

```text
PHASE 4
Infrastructure / Intelligence
        ↓
UI/UX Freeze
        ↓
S29 Master Closeout
        ↓
PHASE 5
        ↓
UI/UX Productization Allowed
```

This is a Phase-level constraint change only. It does not allow implementation without a design gate.

### P5-1 — HITL remains mandatory for structural changes
Reason: The repository contract and BIE modules explicitly preserve the pattern that structural changes must stay pending until confirmed.

### P5-2 — Disable switch remains mandatory
Reason: The code already supports bieEnabled?: boolean and the memory retrieval layer explicitly preserves legacy behavior when disabled.

### P5-3 — No silent replacement of legacy behavior
Reason: The semantic enrichment path is additive and fallback-safe; Phase 5 must preserve the existing retrieval baseline.

### P5-4 — Productization must follow existing architecture and not bypass PIE
Reason: The current integration points are through PipelineContext and RoomBrainIntelligenceRepository; Phase 5 should extend those rather than create isolated parallel systems.

### P5-5 — User control must be explicit
Reason: The current design uses pending queue and applied flags; the user-facing experience should make that visible and understandable.

---

## L. Graph Explorer and Graph Intelligence Positioning

Full graph explorer / full graph editing is not treated as a mandatory core of Phase 5.

Graph intelligence should be understood as:
```text
Graph Intelligence Infrastructure
        ↓
Context Enrichment
        ↓
Useful Relationship Presentation
```

rather than a large standalone editing product. The graph engine remains relevant where it supports PIE/BIE context enrichment and meaningful relationship presentation.

---

## M. Phase 5 Non-Goals

Phase 5 must not become:
- a new intelligence-engine rewrite
- a replacement of PIE
- a replacement of the BIE Repository SSOT
- autonomous AI that silently modifies personal knowledge
- an MCP-first project
- a cloud-sync project
- a complete implementation of Phase 6–8 intelligence

---

## N. Definition of Done

Phase 5 is done when the system demonstrates the following sequence:
```text
BIE Intelligence
      ↓
Visible to User
      ↓
Reviewable
      ↓
Editable
      ↓
Confirmable
      ↓
Reversible
      ↓
Persisted Safely
      ↓
Feeds Future Retrieval
      ↓
AI Context Improves
```

The system must also remain safe and functional when BIE is disabled.

### Undo / Safe Rollback Validation Criterion
Undo is not merely a UI action. The design must validate that when a user undoes a previously confirmed and persisted proposal:
```text
AI Proposal
    ↓
User Confirm
    ↓
applied=true
    ↓
Persist
    ↓
Future Retrieval sees new knowledge
    ↓
User Undo
    ↓
Previous state restored
    ↓
Future Retrieval no longer uses reverted state
```

Architecture Requirement: Undo / Safe Rollback must restore the underlying intelligence state, not merely hide the item from the UI.

This requirement is expressed as an architecture requirement and validation criterion only; it does not prescribe implementation details such as schema changes, transaction strategy, versioning, API shape, or specific UI components.

---

## O. Final Phase Definition

> Phase 4 makes My Life OS “have a brain”.

> Phase 5 makes the owner “see that brain, control it, and teach it back”.

> Phase 6+ can then evolve that brain further.

This is an architecture direction rather than marketing language.

---

## P. Design Status (Post-S29 — Updated S30 2026-08-02)

Current Status:
- Phase 4D S28: ✅ Complete (2026-08-01)
- Phase 4D S29: ✅ Complete — Master Closeout PASS (2026-08-01)
- Phase 5 S30: ⏳ In Progress — Product Surface Definition & UX Contract (2026-08-02)
- Phase 5 Implementation (S31+): Not Started — awaiting S30 design gate approval

Next Gate:
- S30 Design Gate → then S31 implementation begins

> Phase 5 implementation (S31+) must not start before S30 Design Gate is approved.

---

## Q. HITL UX Contract (Defined S30 — 2026-08-02)

> This is the explicit confirm/reject/edit/undo contract for all Phase 5 BIE surfaces. All surfaces (S31–S33) must implement this contract.

### Contract Actions

| Action | Trigger | State Transition | Structural Change | Reversible |
|---|---|---|---|---|
| **Confirm** | User taps "Confirm" on a pending BIE item | `pending → confirmed`; calls `applyPendingBieItem(id)` → `applied: true` | Yes — persists to target table (bie_identity / bie_insights / etc.) | Yes — via Undo within session or rollback endpoint |
| **Reject** | User taps "Reject" on a pending BIE item | `pending → rejected`; item removed from pending queue | No — no structural change to knowledge state | N/A (no change to persist) |
| **Edit** | User modifies proposed content before confirming | Content modified in-place in pending item; then user confirms → `applyPendingBieItem(id, editedContent)` | Yes — same as Confirm but with user-modified content | Yes — same undo path as Confirm |
| **Undo** | User undoes a previously confirmed item | `applied: true → applied: false (or deleted)`; reverts target table record to pre-confirm state | Reversed — reverts structural change | Architecture requirement: undo must restore underlying intelligence state, not merely hide from UI |

### Constraint Compliance
- **P5-1 (HITL mandatory)**: Every BIE suggestion enters `bie_pending_queue` first. No suggestion auto-applies.
- **P5-2 (Undo/rollback safety)**: Every Confirm action that affects identity, insight, tag merge, or relationship must support undo without data corruption.
- **P4-12 (HITL invariant)**: Only `applied: true` items may enrich retrieval context. Pending items are invisible to retrieval.
- **P4-14 (bieEnabled=false)**: When disabled, all pending queue UI is hidden/empty; no BIE items appear in retrieval.

### Per-Surface Rollback Strategy
| Surface | Undo Target | Rollback Method |
|---|---|---|
| Identity Review UI | `bie_identity` record | Set `applied: false`; if field was overwritten, restore previous value from pre-confirm snapshot or history field |
| Insight Center UI | `bie_insights` record | Set `applied: false`; retrieval enrichment layer re-filters on next call |
| Tag Merge (if implemented) | Tag table records | Restore pre-merge tag records; invalidate retrieval cache |
| Relationship (if implemented) | bie_graph_edges | Delete or inactivate edge; invalidate graph traversal cache |
| Pending Queue (Reject) | bie_pending_queue | Mark as rejected; no rollback needed (no structural change) |

### Stale Pending Item Policy
Items in `bie_pending_queue` that have not been acted on after a long period should be surfaced as "stale" (not auto-rejected). The exact stale threshold is deferred to S31 implementation detail.

### Fields Required in Pending Queue UI
Minimum fields the UI must display per pending item:
- `id` — unique item identifier
- `type` — BIE type (identity / insight / semantic / timeline)
- `content` — proposed content (user-readable)
- `status` — pending / confirmed / rejected
- `score` — confidence/relevance score (optional but recommended)
- `proposedAt` — timestamp of AI proposal
- `confirmedAt` — timestamp of user confirm (if applicable)
- `editedContent` — user-modified content (if user chose Edit before Confirm)
