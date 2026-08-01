// ─────────────────────────────────────────────────────────────────────
// BIE — Conflict Detector Implementation
// Phase 4C S19 — Contradiction & Conflict Detector
// ─────────────────────────────────────────────────────────────────────

import type { BrainEvidence } from "../../../types";
import type { BrainIntelligenceRepository } from "../BrainIntelligenceRepository";
import type { PendingLearning } from "../types";
import type { ConflictDetector, ConflictItem, ConflictSeverity } from "./types";

/** Seed item defining opposing concept pairs for evidence analysis. */
export interface OpposingPair {
  keywordA: string;
  keywordB: string;
  category: string;
  severity: ConflictSeverity;
  resolutionTemplate: string;
}

/** Pre-defined seed dictionary of common life / behavior contradictions. */
export const KNOWN_OPPOSING_PAIRS: OpposingPair[] = [
  {
    keywordA: "introvert",
    keywordB: "extrovert",
    category: "personality",
    severity: "medium",
    resolutionTemplate:
      "พบข้อมูลระบุทั้งความชอบความเป็นส่วนตัว (Introvert) และการชอบเข้าสังคม (Extrovert) โปรดตรวจสอบสไตล์ที่คุณรู้สึกสอดคล้องมากที่สุด",
  },
  {
    keywordA: "ตื่นเช้า",
    keywordB: "นอนดึก",
    category: "lifestyle",
    severity: "low",
    resolutionTemplate:
      "พบพฤติกรรมการนอนขัดแย้งกัน (ชอบตื่นเช้า vs ชอบนอนดึก) โปรดเลือกรูปแบบหลักที่คุณตั้งใจรักษาไว้",
  },
  {
    keywordA: "ประหยัด",
    keywordB: "ฟุ่มเฟือย",
    category: "finance",
    severity: "high",
    resolutionTemplate:
      "พบค่านิยมทางการเงินที่ตรงข้ามกัน (การออมประหยัด vs การใช้จ่ายฟุ่มเฟือย) โปรดตรวจสอบทิศทางการเงินเป้าหมาย",
  },
  {
    keywordA: "ทำงานคนเดียว",
    keywordB: "ชอบทำงานเป็นทีม",
    category: "work",
    severity: "medium",
    resolutionTemplate:
      "พบความชอบในสไตล์การทำงานที่แตกต่างกัน (ทำงานเดี่ยว vs ทำงานทีม) โปรดเลือกรูปแบบที่ตรงกับถนัดในปัจจุบัน",
  },
  {
    keywordA: "สายชิล",
    keywordB: "เข้มงวดมีวินัย",
    category: "mindset",
    severity: "low",
    resolutionTemplate:
      "พบรูปแบบความคิดขัดแย้งระหว่างการปล่อยผ่อนตามสบายกับความเข้มงวดในวินัย",
  },
];

export class DefaultConflictDetector implements ConflictDetector {
  private customOpposingPairs: OpposingPair[];

  constructor(customPairs: OpposingPair[] = []) {
    this.customOpposingPairs = customPairs;
  }

  /**
   * Scan evidence rows and identify conflicting statements / opposing tags.
   * Returns list of ConflictItem objects enforcing applied: false HITL invariant.
   */
  detectConflicts(evidences: BrainEvidence[] = []): ConflictItem[] {
    if (!Array.isArray(evidences) || evidences.length === 0) {
      return [];
    }

    const allPairs = [...KNOWN_OPPOSING_PAIRS, ...this.customOpposingPairs];
    const conflicts: ConflictItem[] = [];

    for (const pair of allPairs) {
      const kwA = pair.keywordA.toLowerCase();
      const kwB = pair.keywordB.toLowerCase();

      const evidenceIdsA: string[] = [];
      const evidenceIdsB: string[] = [];

      for (const ev of evidences) {
        if (!ev || !ev.preview) continue;
        const text = (ev.preview + " " + (ev.brainTreeTagIds || []).join(" ")).toLowerCase();

        if (text.includes(kwA)) {
          evidenceIdsA.push(ev.id);
        }
        if (text.includes(kwB)) {
          evidenceIdsB.push(ev.id);
        }
      }

      // Conflict exists when evidence supports BOTH side A and side B
      if (evidenceIdsA.length > 0 && evidenceIdsB.length > 0) {
        conflicts.push({
          id: `conflict-${pair.category}-${kwA}-${kwB}`,
          statementA: `ข้อความระบุ "${pair.keywordA}" (${evidenceIdsA.length} รายการ)`,
          statementB: `ข้อความระบุ "${pair.keywordB}" (${evidenceIdsB.length} รายการ)`,
          evidenceIdsA,
          evidenceIdsB,
          severity: pair.severity,
          suggestedResolution: pair.resolutionTemplate,
          applied: false, // 🔒 HITL structural invariant
          createdAt: Date.now(),
        });
      }
    }

    return conflicts;
  }
}

/** Standalone helper to create a PendingLearning queue item from a ConflictItem proposal. */
export function createPendingConflictItem(conflict: ConflictItem): PendingLearning {
  return {
    id: `pending-${conflict.id}`,
    kind: "reflection_conflict",
    payload: {
      conflictId: conflict.id,
      statementA: conflict.statementA,
      statementB: conflict.statementB,
      evidenceIdsA: conflict.evidenceIdsA,
      evidenceIdsB: conflict.evidenceIdsB,
      severity: conflict.severity,
      suggestedResolution: conflict.suggestedResolution,
      applied: false,
    },
    reason: `ตรวจพบความขัดแย้งของข้อมูล: ${conflict.statementA} vs ${conflict.statementB}`,
    confidence: conflict.severity === "high" ? 0.9 : conflict.severity === "medium" ? 0.75 : 0.6,
    createdAt: conflict.createdAt || Date.now(),
  };
}

/** Standalone helper to scan evidences and route conflict proposals to the repository pending queue. */
export function routeConflictsToPendingQueue(
  conflicts: ConflictItem[],
  bieRepo?: BrainIntelligenceRepository
): PendingLearning[] {
  const pendingItems = conflicts.map(createPendingConflictItem);
  if (bieRepo && typeof bieRepo.appendPendingBieItem === "function") {
    for (const item of pendingItems) {
      bieRepo.appendPendingBieItem(item);
    }
  }
  return pendingItems;
}

/** Standalone helper function for detecting conflicts directly. */
export function detectConflicts(evidences: BrainEvidence[] = []): ConflictItem[] {
  const detector = new DefaultConflictDetector();
  return detector.detectConflicts(evidences);
}
