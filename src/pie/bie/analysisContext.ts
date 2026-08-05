// ─────────────────────────────────────────────────────────────────────
// BIE — Analysis Context Helper (Architect Fix 1, Final)
// ─────────────────────────────────────────────────────────────────────
//
// Problem being closed:
//   journalMemoryResolver.ts could already resolve
//     BrainEvidence.sourceId -> JournalEntry
//   but the resolver was only echoed back at the orchestrator boundary.
//   identityEngine / insightGenerator / timelineBuilder kept reasoning
//   from `BrainEvidence.preview` (140-char truncation) exactly as
//   before, so real Journal Memory never reached the analysis logic.
//
// Fix:
//   This file is the single choke point every BIE reasoning engine now
//   reads through to get the text it classifies/scans for keywords.
//   For evidence of kind "journal", when a resolver is supplied, the
//   full original JournalEntry.content is used. For everything else
//   (or when no resolver is supplied / the journal can't be resolved),
//   it falls back to BrainEvidence.preview exactly as before.
//
// Explicitly preserved:
//   - JournalEntry remains canonical memory; nothing is duplicated or
//     re-stored here (read-through only, same as journalMemoryResolver.ts).
//   - BrainEvidence.preview is untouched and still used for UI-facing
//     short labels/snippets — this helper only changes what the engines
//     "think" from, not what gets displayed in existing short strings.
//   - Non-journal evidence (habit/reminder/goal/daily_checkin) is
//     unaffected — sourceId for those kinds does not resolve against
//     the journal map, so behavior for them is byte-for-byte unchanged.
// ─────────────────────────────────────────────────────────────────────

import type { BrainEvidence } from "../../types";
import type { JournalMemoryResolver } from "./journalMemoryResolver";

/**
 * Resolve the text a BIE reasoning engine should analyze for one piece
 * of evidence: the real Journal content when resolvable, otherwise the
 * existing BrainEvidence.preview.
 *
 * @param evidence            The evidence record being analyzed.
 * @param resolveJournalMemory Optional resolver (BrainEvidence.sourceId -> JournalEntry),
 *                              built fresh per BIE run by bieTrigger.ts.
 * @returns The full Journal content (canonical memory) when available,
 *          else `evidence.preview` (unchanged fallback behavior).
 */
export function resolveEvidenceText(
  evidence: BrainEvidence,
  resolveJournalMemory?: JournalMemoryResolver
): string {
  if (evidence.kind === "journal" && resolveJournalMemory) {
    const journal = resolveJournalMemory(evidence.sourceId);
    if (journal && journal.content && journal.content.trim().length > 0) {
      return journal.content;
    }
  }
  return evidence.preview;
}
