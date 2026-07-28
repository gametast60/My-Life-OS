import type { BrainConfiguration, TreeGrowthStatus } from "../../types";

export interface GrowthSnapshot {
  growthScore: number;
  level: number;
  /** 0-100 progress within current level. */
  progressPct: number;
  requiredForLevel: number;
  requiredForNext: number;
}

/**
 * Exponential RPG-style growth.
 *
 * Total score required to reach level n (complete it):
 *   S_n = constant * n^2
 *
 * Progress within the level for a given raw score:
 *   score_in_level = score - S_{level-1}
 *   required_in_level = S_level - S_{level-1}
 */
export function computeGrowth(score: number, constant: number): GrowthSnapshot {
  const s = Math.max(0, score);
  if (constant <= 0) {
    return {
      growthScore: s,
      level: 0,
      progressPct: 0,
      requiredForLevel: 0,
      requiredForNext: 0,
    };
  }
  // S_n = constant * n^2. Find highest integer level where constant*level^2 <= s.
  let level = Math.floor(Math.sqrt(s / constant));
  // guard rounding edge case
  while (constant * (level + 1) * (level + 1) <= s) level++;
  while (level > 0 && constant * level * level > s) level--;

  const requiredForLevel = constant * level * level; // score already earned to BEGIN this level
  const requiredForNext = constant * (level + 1) * (level + 1);
  const span = requiredForNext - requiredForLevel;
  const within = span > 0 ? Math.min(1, Math.max(0, (s - requiredForLevel) / span)) : 0;
  const progressPct = Math.round(within * 100);

  return {
    growthScore: s,
    level,
    progressPct,
    requiredForLevel,
    requiredForNext,
  };
}

/**
 * Map a tag/dim/type's progress% to its Growth Status band.
 * Thresholds record stores the UPPER bound (%) of each band.
 * e.g., { seedling: 20, growing: 50, strong: 80, mastery: 100 }
 *   0-20  → seedling
 *   21-50 → growing
 *   51-80 → strong
 *   81-100 → mastery
 */
export function progressToStatus(
  progressPct: number,
  thresholds: BrainConfiguration["statusThresholds"]
): TreeGrowthStatus {
  const pct = Math.max(0, Math.min(100, progressPct));
  if (pct <= thresholds.seedling) return "seedling";
  if (pct <= thresholds.growing) return "growing";
  if (pct <= thresholds.strong) return "strong";
  return "mastery";
}

export const STATUS_META: Record<TreeGrowthStatus, { emoji: string; label: string; color: string }> = {
  seedling: { emoji: "🌱", label: "Seedling",  color: "#B8860B" },
  growing:  { emoji: "🌿", label: "Growing",  color: "#6B9361" },
  strong:   { emoji: "🌳", label: "Strong",   color: "#4E7345" },
  mastery:  { emoji: "🌟", label: "Mastery",  color: "#D4AF37" },
};
