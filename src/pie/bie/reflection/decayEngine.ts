// ─────────────────────────────────────────────────────────────────────
// BIE — Decay Engine Implementation
// Phase 4C S20 — Brain Tree Decay Calculation Engine
// ─────────────────────────────────────────────────────────────────────

import type { DecayEngine, DecayScore } from "./types";

/** Configuration parameters for exponential decay calculations. */
export interface DecayConfig {
  /** Half-life in days (default: 30 days). Score halves after this many idle days beyond grace period. */
  halfLifeDays: number;
  /** Grace period in days before decay starts applying (default: 7 days). */
  gracePeriodDays: number;
  /** Minimum score floor below which a score will not decay (default: 0). */
  minimumScoreFloor: number;
}

/** Default decay configuration rules. */
export const DEFAULT_DECAY_CONFIG: DecayConfig = {
  halfLifeDays: 30,
  gracePeriodDays: 7,
  minimumScoreFloor: 0,
};

/** Input item shape for batch tag decay processing. */
export interface TagDecayInput {
  tagId: string;
  lastEvidenceAt: number;
  currentScore: number;
}

export class DefaultDecayEngine implements DecayEngine {
  private config: DecayConfig;

  constructor(config: Partial<DecayConfig> = {}) {
    this.config = { ...DEFAULT_DECAY_CONFIG, ...config };
  }

  /**
   * Calculate decayed growth score based on time elapsed since last evidence.
   * Uses exponential decay formula: N(t) = N0 * e^(-lambda * t_effective)
   */
  calculateTagDecay(
    tagId: string,
    lastEvidenceAt: number,
    currentScore: number,
    now: number = Date.now()
  ): DecayScore {
    if (currentScore <= 0 || lastEvidenceAt <= 0) {
      return {
        tagId,
        lastEvidenceAt,
        daysIdle: 0,
        originalScore: currentScore,
        decayedScore: Math.max(0, currentScore),
        decayPercent: 0,
      };
    }

    const daysIdle = Math.max(0, (now - lastEvidenceAt) / (1000 * 60 * 60 * 24));
    const effectiveIdle = Math.max(0, daysIdle - this.config.gracePeriodDays);

    if (effectiveIdle <= 0) {
      return {
        tagId,
        lastEvidenceAt,
        daysIdle: Math.round(daysIdle * 10) / 10,
        originalScore: currentScore,
        decayedScore: currentScore,
        decayPercent: 0,
      };
    }

    // Exponential decay constant lambda = ln(2) / T_1/2
    const lambda = Math.LN2 / Math.max(1, this.config.halfLifeDays);
    const rawDecayed = currentScore * Math.exp(-lambda * effectiveIdle);
    const decayedScore = Math.max(
      this.config.minimumScoreFloor,
      Math.round(rawDecayed * 100) / 100
    );

    const decayAmount = Math.max(0, currentScore - decayedScore);
    const decayPercent = Math.round((decayAmount / currentScore) * 10000) / 100;

    return {
      tagId,
      lastEvidenceAt,
      daysIdle: Math.round(daysIdle * 10) / 10,
      originalScore: currentScore,
      decayedScore,
      decayPercent,
    };
  }

  /**
   * Calculate decay metrics across a batch of tags.
   */
  calculateBatchDecay(
    tags: TagDecayInput[],
    now: number = Date.now()
  ): DecayScore[] {
    if (!Array.isArray(tags)) return [];
    return tags.map((t) =>
      this.calculateTagDecay(t.tagId, t.lastEvidenceAt, t.currentScore, now)
    );
  }
}

/** Standalone helper for calculating tag decay with optional custom config. */
export function calculateTagDecay(
  tagId: string,
  lastEvidenceAt: number,
  currentScore: number,
  now?: number,
  config?: Partial<DecayConfig>
): DecayScore {
  const engine = new DefaultDecayEngine(config);
  return engine.calculateTagDecay(tagId, lastEvidenceAt, currentScore, now);
}

/** Standalone helper for calculating batch tag decay with optional custom config. */
export function calculateBatchDecay(
  tags: TagDecayInput[],
  now?: number,
  config?: Partial<DecayConfig>
): DecayScore[] {
  const engine = new DefaultDecayEngine(config);
  return engine.calculateBatchDecay(tags, now);
}
