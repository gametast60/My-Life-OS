// ─────────────────────────────────────────────────────────────────────
// BIE — Decay Engine Stub Implementation
// Phase 4C S17 — Reflection Type & Provider Contracts Kickoff
// ─────────────────────────────────────────────────────────────────────

import type { DecayEngine, DecayScore } from "./types";

export class DefaultDecayEngine implements DecayEngine {
  /**
   * Calculate decayed growth score based on time elapsed since last evidence.
   * Stub implementation returning baseline score calculation.
   */
  calculateTagDecay(
    tagId: string,
    lastEvidenceAt: number,
    currentScore: number,
    now: number = Date.now()
  ): DecayScore {
    const daysIdle = Math.max(0, (now - lastEvidenceAt) / (1000 * 60 * 60 * 24));
    return {
      tagId,
      lastEvidenceAt,
      daysIdle,
      originalScore: currentScore,
      decayedScore: currentScore,
      decayPercent: 0,
    };
  }
}
