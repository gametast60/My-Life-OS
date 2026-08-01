// ─────────────────────────────────────────────────────────────────────
// BIE — Evidence Consolidator Implementation
// Phase 4C S18 — Evidence Consolidation Engine
// ─────────────────────────────────────────────────────────────────────

import type { BrainEvidence } from "../../../types";
import type { EvidenceConsolidator, EvidenceConsolidationReport } from "./types";

/** Extended result pair containing both summary report and updated evidences array. */
export interface EvidenceConsolidationResult {
  report: EvidenceConsolidationReport;
  consolidatedEvidences: BrainEvidence[];
}

export class DefaultEvidenceConsolidator implements EvidenceConsolidator {
  /**
   * Consolidate evidence references from sourceTagId to targetTagId.
   * Cleans up dangling references and reassigns source tag evidence IDs to target tag ID.
   */
  consolidateTagReferences(
    sourceTagId: string,
    targetTagId: string,
    evidences: BrainEvidence[] = []
  ): EvidenceConsolidationReport {
    const { report } = this.consolidateEvidences(sourceTagId, targetTagId, evidences);
    return report;
  }

  /**
   * Consolidate evidence references, returning both the updated evidence list
   * and the structured report summary.
   */
  consolidateEvidences(
    sourceTagId: string,
    targetTagId: string,
    evidences: BrainEvidence[] = []
  ): EvidenceConsolidationResult {
    let reassignedEvidenceCount = 0;
    let danglingReferencesRemoved = 0;

    const cleanSource = typeof sourceTagId === "string" ? sourceTagId.trim() : "";
    const cleanTarget = typeof targetTagId === "string" ? targetTagId.trim() : "";

    const consolidatedEvidences: BrainEvidence[] = evidences.map((evidence) => {
      if (!evidence || !Array.isArray(evidence.brainTreeTagIds)) {
        return evidence;
      }

      let tagsChanged = false;
      const originalTags = evidence.brainTreeTagIds;

      // Filter out empty or non-string tag references
      const validTags = originalTags.filter((tagId) => {
        const isValid = typeof tagId === "string" && tagId.trim().length > 0;
        if (!isValid) {
          danglingReferencesRemoved++;
          tagsChanged = true;
        }
        return isValid;
      });

      let newTags = [...validTags];
      const hasSource = cleanSource ? newTags.includes(cleanSource) : false;

      if (hasSource) {
        // Remove sourceTagId reference
        newTags = newTags.filter((tagId) => tagId !== cleanSource);

        // Add targetTagId if valid and not already present
        if (cleanTarget && cleanTarget !== cleanSource) {
          if (!newTags.includes(cleanTarget)) {
            newTags.push(cleanTarget);
          }
        }
        reassignedEvidenceCount++;
        tagsChanged = true;
      }

      // Deduplicate tags while preserving order
      const uniqueTags: string[] = [];
      for (const tagId of newTags) {
        if (!uniqueTags.includes(tagId)) {
          uniqueTags.push(tagId);
        } else {
          danglingReferencesRemoved++;
          tagsChanged = true;
        }
      }

      if (!tagsChanged) {
        return evidence;
      }

      return {
        ...evidence,
        brainTreeTagIds: uniqueTags,
        updatedAt: Date.now(),
      };
    });

    const report: EvidenceConsolidationReport = {
      sourceTagId: cleanSource,
      targetTagId: cleanTarget,
      reassignedEvidenceCount,
      danglingReferencesRemoved,
      updatedAt: Date.now(),
    };

    return {
      report,
      consolidatedEvidences,
    };
  }
}

/** Standalone helper for direct evidence consolidation without instantiating class. */
export function consolidateTagReferences(
  sourceTagId: string,
  targetTagId: string,
  evidences: BrainEvidence[] = []
): EvidenceConsolidationReport {
  const consolidator = new DefaultEvidenceConsolidator();
  return consolidator.consolidateTagReferences(sourceTagId, targetTagId, evidences);
}

/** Standalone helper returning both report and updated evidence list. */
export function consolidateEvidences(
  sourceTagId: string,
  targetTagId: string,
  evidences: BrainEvidence[] = []
): EvidenceConsolidationResult {
  const consolidator = new DefaultEvidenceConsolidator();
  return consolidator.consolidateEvidences(sourceTagId, targetTagId, evidences);
}
