import {
  BrainTreeType,
  BrainTreeDimension,
  BrainTreeTag,
  BrainEvidence,
  BrainConfiguration,
  EvidenceKind,
  TreeGrowthStatus,
  JournalEntry,
  HabitItem,
  ReminderItem,
  GoalItem,
} from "../../types";
import { RoomDatabase, DEFAULT_BRAIN_CONFIG } from "../db";
import { computeGrowth, progressToStatus, GrowthSnapshot } from "./growth";

// ─────────────────────────────────────────────────────────────────────
// Hierarchical Tree Types (for UI / Brain Viewer)
// ─────────────────────────────────────────────────────────────────────

export interface TagNode {
  tag: BrainTreeTag;
  evidenceIds: string[];
  evidenceBreakdown: Partial<Record<EvidenceKind, number>>;
  totalEvidence: number;
  rawScore: number;
  growth: GrowthSnapshot;
  status: TreeGrowthStatus;
}

export interface DimensionNode {
  dimension: BrainTreeDimension;
  tags: TagNode[];
  evidenceIds: string[];
  evidenceBreakdown: Partial<Record<EvidenceKind, number>>;
  totalEvidence: number;
  rawScore: number;
  growth: GrowthSnapshot;
  status: TreeGrowthStatus;
}

export interface TypeNode {
  type: BrainTreeType;
  dimensions: DimensionNode[];
  evidenceIds: string[];
  evidenceBreakdown: Partial<Record<EvidenceKind, number>>;
  totalEvidence: number;
  rawScore: number;
  growth: GrowthSnapshot;
  status: TreeGrowthStatus;
}

export interface FullTree {
  types: TypeNode[];
  globalEvidenceCount: number;
  globalRawScore: number;
  config: BrainConfiguration;
}

// ─────────────────────────────────────────────────────────────────────
// Default Brain Tree Template (for new users)
// ─────────────────────────────────────────────────────────────────────

interface DefaultTemplateSeed {
  typeName: string;
  color: string;
  icon: string;
  dimensions: { name: string; tags: string[] }[];
}

const DEFAULT_TEMPLATE: DefaultTemplateSeed[] = [
  {
    typeName: "Goal",
    color: "#4E7345",
    icon: "Target",
    dimensions: [
      { name: "การเงิน", tags: ["Saving", "DCA", "หุ้น", "Trading", "Emergency Fund"] },
      { name: "สุขภาพ", tags: ["Weight", "Muscle", "Sleep", "Nutrition"] },
      { name: "การเรียนรู้", tags: ["Korean", "English", "Flutter", "React", "Psychology"] },
      { name: "การงาน", tags: ["Promotion", "Side Project", "Portfolio"] },
      { name: "ความสัมพันธ์", tags: ["Family", "Friends", "Partner"] },
    ],
  },
  {
    typeName: "Habit",
    color: "#6B9361",
    icon: "Repeat",
    dimensions: [
      { name: "ตอนเช้า", tags: ["Wake up early", "Meditation", "Cold shower", "Plan day"] },
      { name: "ออกกำลังกาย", tags: ["Gym", "Running", "Yoga", "Walking"] },
      { name: "การอ่าน", tags: ["Self-help", "Fiction", "Technical"] },
      { name: "ตอนกลางคืน", tags: ["No phone before bed", "Journal", "Sleep on time"] },
    ],
  },
  {
    typeName: "Knowledge",
    color: "#4682B4",
    icon: "BookOpen",
    dimensions: [
      { name: "การเงิน", tags: ["Value Investing", "Technical Analysis", "Macro"] },
      { name: "จิตวิทยา", tags: ["CBT", "Atomic Habits", "Growth Mindset"] },
      { name: "Technology", tags: ["AI", "Web Dev", "Mobile Dev"] },
    ],
  },
  {
    typeName: "Belief",
    color: "#9370DB",
    icon: "Heart",
    dimensions: [
      { name: "คุณค่าในชีวิต", tags: ["Honesty", "Growth", "Freedom", "Family"] },
      { name: "สิ่งที่เชื่อ", tags: ["Compound Effect", "Deep Work", "Consistency"] },
    ],
  },
  {
    typeName: "Identity",
    color: "#5F9EA0",
    icon: "User",
    dimensions: [
      { name: "ตัวตนที่ต้องการเป็น", tags: ["Disciplined", "Healthy", "Learner", "Provider"] },
    ],
  },
  {
    typeName: "Skill",
    color: "#4E8080",
    icon: "Zap",
    dimensions: [
      { name: "Hard Skills", tags: ["Programming", "Design", "Data Analysis"] },
      { name: "Soft Skills", tags: ["Communication", "Leadership", "Focus"] },
    ],
  },
  {
    typeName: "Memory",
    color: "#CD853F",
    icon: "Calendar",
    dimensions: [
      { name: "สำคัญ", tags: ["Milestone", "Achievement", "Lesson Learned"] },
      { name: "ผู้คน", tags: ["Birthday", "Favorite Moment"] },
    ],
  },
  {
    typeName: "Fear",
    color: "#B07070",
    icon: "AlertTriangle",
    dimensions: [
      { name: "ที่ต้องเผชิญ", tags: ["Failure", "Rejection", "Public Speaking"] },
    ],
  },
  {
    typeName: "Idea",
    color: "#8FBC8F",
    icon: "Lightbulb",
    dimensions: [
      { name: "งานอดิเรก", tags: ["App idea", "Content", "Business"] },
      { name: "Day-to-day", tags: ["Improvement", "Gift idea"] },
    ],
  },
];

/**
 * Seed the DB with a rich default Brain Tree template IF the DB is empty.
 * Safe to call multiple times: won't overwrite existing data.
 */
export function seedDefaultTemplateIfEmpty(): { types: number; dims: number; tags: number } {
  const existingTypes = RoomDatabase.getBrainTreeTypes();
  if (existingTypes.length > 0) {
    return { types: 0, dims: 0, tags: 0 };
  }

  const now = Date.now();
  let typePriority = 1;
  let dimPriority = 1;
  let tagPriority = 1;

  const createdTypes: BrainTreeType[] = [];
  const createdDims: BrainTreeDimension[] = [];
  const createdTags: BrainTreeTag[] = [];

  for (const seedT of DEFAULT_TEMPLATE) {
    const typeId = `bt-type-${seedT.typeName.toLowerCase()}-${now + Math.random()
      .toString(36)
      .slice(2, 5)}`;
    const typeObj: BrainTreeType = {
      id: typeId,
      name: seedT.typeName,
      color: seedT.color,
      icon: seedT.icon,
      priority: typePriority++,
      createdAt: now,
      updatedAt: now,
    };
    createdTypes.push(typeObj);

    dimPriority = 1;
    for (const seedD of seedT.dimensions) {
      const dimId = `bt-dim-${seedD.name.toLowerCase().replace(/\s+/g, "-")}-${now + Math.random()
        .toString(36)
        .slice(2, 5)}`;
      const dimObj: BrainTreeDimension = {
        id: dimId,
        brainTreeTypeId: typeId,
        name: seedD.name,
        priority: dimPriority++,
        createdAt: now,
        updatedAt: now,
      };
      createdDims.push(dimObj);

      tagPriority = 1;
      for (const tagName of seedD.tags) {
        const tagId = `bt-tag-${now + Math.random().toString(36).slice(2, 8)}`;
        const tagObj: BrainTreeTag = {
          id: tagId,
          brainTreeTypeId: typeId,
          brainTreeDimensionId: dimId,
          name: tagName,
          growthScore: 0,
          level: 0,
          progressPct: 0,
          priority: tagPriority++,
          createdAt: now,
          updatedAt: now,
        };
        createdTags.push(tagObj);
      }
    }
  }

  RoomDatabase.saveBrainTreeTypes(createdTypes);
  RoomDatabase.saveBrainTreeDimensions(createdDims);
  RoomDatabase.saveBrainTreeTags(createdTags);

  return {
    types: createdTypes.length,
    dims: createdDims.length,
    tags: createdTags.length,
  };
}

// ─────────────────────────────────────────────────────────────────────
// Evidence Aggregation (bottom-up score)
// ─────────────────────────────────────────────────────────────────────

export interface NodeScore {
  rawScore: number;
  evidenceIds: string[];
  evidenceBreakdown: Partial<Record<EvidenceKind, number>>;
  totalEvidence: number;
}

function emptyScore(): NodeScore {
  return { rawScore: 0, evidenceIds: [], evidenceBreakdown: {}, totalEvidence: 0 };
}

/**
 * Compute a score map: tagId -> NodeScore
 * Raw score = Σ (evidence.weight * weight_from_config)
 * Uses multi-label: one Evidence can contribute to MANY tags.
 */
function aggregateTagScores(
  evidence: BrainEvidence[],
  weights: Record<EvidenceKind, number>,
  decay: BrainConfiguration["decay"]
): Map<string, NodeScore> {
  const out = new Map<string, NodeScore>();
  const now = Date.now();
  const MS_PER_DAY = 86_400_000;

  for (const ev of evidence) {
    const baseWeight = weights[ev.kind] ?? 1;

    let effectiveWeight = baseWeight;
    if (decay.enabled && decay.daysUntilStart > 0 && decay.perDayPctDrop > 0) {
      const daysSinceOccurred = Math.max(0, (now - ev.occurredAt) / MS_PER_DAY);
      if (daysSinceOccurred > decay.daysUntilStart) {
        const daysDecaying = daysSinceOccurred - decay.daysUntilStart;
        const multiplier = Math.max(0.05, 1 - (daysDecaying * decay.perDayPctDrop) / 100);
        effectiveWeight = baseWeight * multiplier;
      }
    }

    if (ev.kind === "goal_progress") {
      // goal_progress weight interpreted as percent multiplier.
      effectiveWeight = baseWeight; // percent handled by evidence.preview? We'll use via attach.
    }

    for (const tagId of ev.brainTreeTagIds) {
      let agg = out.get(tagId);
      if (!agg) {
        agg = emptyScore();
        out.set(tagId, agg);
      }
      agg.rawScore += effectiveWeight;
      agg.evidenceIds.push(ev.id);
      agg.evidenceBreakdown[ev.kind] = (agg.evidenceBreakdown[ev.kind] ?? 0) + 1;
      agg.totalEvidence += 1;
    }
  }
  return out;
}

/**
 * Sum child scores into parent. Evidence ids are unioned.
 * Breakdown keys are summed.
 */
function sumScores(children: NodeScore[]): NodeScore {
  const parent = emptyScore();
  const idSet = new Set<string>();
  for (const c of children) {
    parent.rawScore += c.rawScore;
    for (const [k, v] of Object.entries(c.evidenceBreakdown)) {
      parent.evidenceBreakdown[k as EvidenceKind] =
        (parent.evidenceBreakdown[k as EvidenceKind] ?? 0) + (v as number);
    }
    for (const id of c.evidenceIds) {
      if (!idSet.has(id)) {
        idSet.add(id);
        parent.evidenceIds.push(id);
      }
    }
  }
  parent.totalEvidence = parent.evidenceIds.length;
  return parent;
}

// ─────────────────────────────────────────────────────────────────────
// Full Tree Builder (Hierarchy + Scores + Status)
// ─────────────────────────────────────────────────────────────────────

export function buildFullTree(): FullTree {
  const types = RoomDatabase.getBrainTreeTypes();
  const dims = RoomDatabase.getBrainTreeDimensions();
  const tags = RoomDatabase.getBrainTreeTags();
  const evidence = RoomDatabase.getBrainEvidence();
  const config = RoomDatabase.getBrainConfig();

  const tagScores = aggregateTagScores(evidence, config.evidenceWeights, config.decay);

  const dimMap = new Map<string, DimensionNode>();
  const typeMap = new Map<string, TypeNode>();

  // 1) Build Tag Nodes
  for (const tag of tags) {
    const score = tagScores.get(tag.id) ?? emptyScore();
    const growth = computeGrowth(score.rawScore, config.growthLevelConstant);
    const tagNode: TagNode = {
      tag,
      evidenceIds: score.evidenceIds,
      evidenceBreakdown: score.evidenceBreakdown,
      totalEvidence: score.totalEvidence,
      rawScore: score.rawScore,
      growth,
      status: progressToStatus(growth.progressPct, config.statusThresholds),
    };

    // Find/create parent dim
    let dimNode = dimMap.get(tag.brainTreeDimensionId);
    if (!dimNode) {
      const dim = dims.find((d) => d.id === tag.brainTreeDimensionId);
      if (!dim) continue;
      dimNode = {
        dimension: dim,
        tags: [],
        evidenceIds: [],
        evidenceBreakdown: {},
        totalEvidence: 0,
        rawScore: 0,
        growth: { growthScore: 0, level: 0, progressPct: 0, requiredForLevel: 0, requiredForNext: 0 },
        status: "seedling",
      };
      dimMap.set(dim.id, dimNode);
    }
    dimNode.tags.push(tagNode);
  }

  // 2) Sum tags into dim nodes, sort by priority
  for (const dimNode of dimMap.values()) {
    dimNode.tags.sort((a, b) => a.tag.priority - b.tag.priority || a.tag.name.localeCompare(b.tag.name));
    const agg = sumScores(dimNode.tags);
    dimNode.rawScore = agg.rawScore;
    dimNode.evidenceIds = agg.evidenceIds;
    dimNode.evidenceBreakdown = agg.evidenceBreakdown;
    dimNode.totalEvidence = agg.totalEvidence;
    dimNode.growth = computeGrowth(dimNode.rawScore, config.growthLevelConstant);
    dimNode.status = progressToStatus(dimNode.growth.progressPct, config.statusThresholds);
  }

  // 3) Put dims under types
  for (const t of types) {
    const typeNode: TypeNode = {
      type: t,
      dimensions: [],
      evidenceIds: [],
      evidenceBreakdown: {},
      totalEvidence: 0,
      rawScore: 0,
      growth: { growthScore: 0, level: 0, progressPct: 0, requiredForLevel: 0, requiredForNext: 0 },
      status: "seedling",
    };
    typeMap.set(t.id, typeNode);
  }

  for (const dimNode of dimMap.values()) {
    const tNode = typeMap.get(dimNode.dimension.brainTreeTypeId);
    if (tNode) tNode.dimensions.push(dimNode);
  }

  // 4) Sum dims into types
  let globalScore = 0;
  const globalEvSet = new Set<string>();
  for (const tNode of typeMap.values()) {
    tNode.dimensions.sort((a, b) =>
      a.dimension.priority - b.dimension.priority || a.dimension.name.localeCompare(b.dimension.name)
    );
    const agg = sumScores(tNode.dimensions);
    tNode.rawScore = agg.rawScore;
    tNode.evidenceIds = agg.evidenceIds;
    tNode.evidenceBreakdown = agg.evidenceBreakdown;
    tNode.totalEvidence = agg.totalEvidence;
    tNode.growth = computeGrowth(tNode.rawScore, config.growthLevelConstant);
    tNode.status = progressToStatus(tNode.growth.progressPct, config.statusThresholds);
    globalScore += tNode.rawScore;
    for (const id of agg.evidenceIds) globalEvSet.add(id);
  }

  const typesList = Array.from(typeMap.values()).sort(
    (a, b) => a.type.priority - b.type.priority || a.type.name.localeCompare(b.type.name)
  );

  return {
    types: typesList,
    globalEvidenceCount: globalEvSet.size,
    globalRawScore: globalScore,
    config,
  };
}

// ─────────────────────────────────────────────────────────────────────
// Recalculate & Persist Denormalized Snapshots on Tags
// (called after Evidence changes; UI reads growthScore/level/progressPct)
// ─────────────────────────────────────────────────────────────────────

/**
 * Recompute growthScore/level/progressPct for every tag in DB and save.
 * Call this whenever Evidence (or weights) changes.
 * Also recomputes progress snapshot for dims/types, but those are read-time computed.
 */
export function recalcAndPersistTagGrowth(): void {
  const tags = RoomDatabase.getBrainTreeTags();
  if (tags.length === 0) return;

  const evidence = RoomDatabase.getBrainEvidence();
  const config = RoomDatabase.getBrainConfig();
  const scores = aggregateTagScores(evidence, config.evidenceWeights, config.decay);
  const now = Date.now();

  let dirty = false;
  for (const tag of tags) {
    const s = scores.get(tag.id) ?? emptyScore();
    const g = computeGrowth(s.rawScore, config.growthLevelConstant);
    if (
      Math.abs(tag.growthScore - g.growthScore) > 0.01 ||
      tag.level !== g.level ||
      tag.progressPct !== g.progressPct
    ) {
      tag.growthScore = g.growthScore;
      tag.level = g.level;
      tag.progressPct = g.progressPct;
      tag.updatedAt = now;
      dirty = true;
    }
  }
  if (dirty) RoomDatabase.saveBrainTreeTags(tags);
}

// ─────────────────────────────────────────────────────────────────────
// Move / Reorder Operations
// ─────────────────────────────────────────────────────────────────────

/**
 * Move a Brain Dimension (🌿) to live under a different Brain Type (🌳).
 * Updates dim.brainTreeTypeId + propagates into all child Tags' brainTreeTypeId.
 */
export function moveDimensionToType(dimensionId: string, targetTypeId: string): boolean {
  const dims = RoomDatabase.getBrainTreeDimensions();
  const dim = dims.find((d) => d.id === dimensionId);
  if (!dim) return false;
  const types = RoomDatabase.getBrainTreeTypes();
  if (!types.some((t) => t.id === targetTypeId)) return false;
  if (dim.brainTreeTypeId === targetTypeId) return true;

  dim.brainTreeTypeId = targetTypeId;
  dim.updatedAt = Date.now();
  RoomDatabase.saveBrainTreeDimensions(dims);

  const tags = RoomDatabase.getBrainTreeTags();
  let tagsDirty = false;
  for (const t of tags) {
    if (t.brainTreeDimensionId === dimensionId && t.brainTreeTypeId !== targetTypeId) {
      t.brainTreeTypeId = targetTypeId;
      t.updatedAt = Date.now();
      tagsDirty = true;
    }
  }
  if (tagsDirty) RoomDatabase.saveBrainTreeTags(tags);
  return true;
}

/**
 * Move a Tag (🍃) to live under a different Dimension (🌿).
 * If the target dimension lives under a different Type, also fix tag.brainTreeTypeId.
 */
export function moveTagToDimension(tagId: string, targetDimensionId: string): boolean {
  const tags = RoomDatabase.getBrainTreeTags();
  const tag = tags.find((t) => t.id === tagId);
  if (!tag) return false;
  const dims = RoomDatabase.getBrainTreeDimensions();
  const targetDim = dims.find((d) => d.id === targetDimensionId);
  if (!targetDim) return false;
  if (tag.brainTreeDimensionId === targetDimensionId) return true;

  tag.brainTreeDimensionId = targetDimensionId;
  tag.brainTreeTypeId = targetDim.brainTreeTypeId;
  tag.updatedAt = Date.now();
  RoomDatabase.saveBrainTreeTags(tags);
  return true;
}

function reorder<T extends { priority: number }>(
  items: T[],
  moveId: string,
  newPriority: number
): { list: T[]; changed: boolean } {
  const list = [...items];
  const fromIdx = list.findIndex((x) => (x as unknown as { id: string }).id === moveId);
  if (fromIdx === -1) return { list: items, changed: false };
  const [moved] = list.splice(fromIdx, 1);
  const safe = Math.max(1, Math.min(newPriority, list.length + 1));
  list.splice(safe - 1, 0, moved);
  let changed = false;
  const now = Date.now();
  list.forEach((item, i) => {
    if (item.priority !== i + 1) {
      (item as unknown as { priority: number; updatedAt?: number }).priority = i + 1;
      if ("updatedAt" in item) (item as unknown as { updatedAt: number }).updatedAt = now;
      changed = true;
    }
  });
  return { list, changed };
}

export function reorderBrainType(id: string, newPriority: number): boolean {
  const { list, changed } = reorder(RoomDatabase.getBrainTreeTypes(), id, newPriority);
  if (changed) RoomDatabase.saveBrainTreeTypes(list);
  return changed;
}

export function reorderBrainDimension(id: string, newPriority: number): boolean {
  const dims = RoomDatabase.getBrainTreeDimensions();
  const moving = dims.find((d) => d.id === id);
  if (!moving) return false;
  const underSameParent = dims.filter((d) => d.brainTreeTypeId === moving.brainTreeTypeId);
  const { list: reordered, changed } = reorder(underSameParent, id, newPriority);
  if (!changed) return false;
  const reorderedIds = new Set(reordered.map((d) => d.id));
  const others = dims.filter((d) => !reorderedIds.has(d.id));
  RoomDatabase.saveBrainTreeDimensions([...others, ...reordered]);
  return true;
}

export function reorderBrainTag(id: string, newPriority: number): boolean {
  const tags = RoomDatabase.getBrainTreeTags();
  const moving = tags.find((t) => t.id === id);
  if (!moving) return false;
  const underSameParent = tags.filter((t) => t.brainTreeDimensionId === moving.brainTreeDimensionId);
  const { list: reordered, changed } = reorder(underSameParent, id, newPriority);
  if (!changed) return false;
  const reorderedIds = new Set(reordered.map((t) => t.id));
  const others = tags.filter((t) => !reorderedIds.has(t.id));
  RoomDatabase.saveBrainTreeTags([...others, ...reordered]);
  return true;
}

// ─────────────────────────────────────────────────────────────────────
// Evidence Convenience Creators (wire from App handlers)
// ─────────────────────────────────────────────────────────────────────

export function createJournalEvidence(journal: JournalEntry, tagIds: string[]): BrainEvidence | null {
  if (tagIds.length === 0) return null;
  const preview = `${journal.title || journal.date}: ${journal.content}`.slice(0, 140);
  const row = RoomDatabase.attachEvidenceToTags({
    kind: "journal",
    sourceId: journal.id,
    preview,
    occurredAt: journal.timestamp || Date.now(),
    tagIds,
  });
  recalcAndPersistTagGrowth();
  return row;
}

export function createHabitCompletedEvidence(
  habit: HabitItem,
  completedDateStr: string,
  tagIds: string[]
): BrainEvidence | null {
  if (tagIds.length === 0) return null;
  const sourceId = `${habit.id}::${completedDateStr}`;
  const preview = `Habit completed: ${habit.title} (${completedDateStr})`;
  const existing = RoomDatabase.getBrainEvidence().find(
    (e) => e.kind === "habit_completed" && e.sourceId === sourceId
  );
  if (existing) {
    const union = Array.from(new Set([...existing.brainTreeTagIds, ...tagIds]));
    RoomDatabase.updateBrainEvidence(existing.id, { brainTreeTagIds: union, updatedAt: Date.now() });
    recalcAndPersistTagGrowth();
    return existing;
  }
  const row = RoomDatabase.attachEvidenceToTags({
    kind: "habit_completed",
    sourceId,
    preview,
    occurredAt: new Date(completedDateStr).getTime() || Date.now(),
    tagIds,
  });
  recalcAndPersistTagGrowth();
  return row;
}

export function createReminderCompletedEvidence(
  reminder: ReminderItem,
  tagIds: string[]
): BrainEvidence | null {
  if (tagIds.length === 0) return null;
  const row = RoomDatabase.attachEvidenceToTags({
    kind: "reminder_completed",
    sourceId: reminder.id,
    preview: `Reminder done: ${reminder.text}`.slice(0, 140),
    occurredAt: Date.now(),
    tagIds,
  });
  recalcAndPersistTagGrowth();
  return row;
}

export function createGoalProgressEvidence(
  goal: GoalItem,
  tagIds: string[]
): BrainEvidence | null {
  if (tagIds.length === 0) return null;
  const preview = `Goal: ${goal.title} — progress ${goal.progressPercent}%`.slice(0, 140);
  const existing = RoomDatabase.getBrainEvidence().find(
    (e) => e.kind === "goal_progress" && e.sourceId === goal.id
  );
  const weights = DEFAULT_BRAIN_CONFIG.evidenceWeights;
  // Percent-aware: goal_progress base weight is scaled by progress%.
  const _percentAware = (weights.goal_progress * (goal.progressPercent ?? 0)) / 100;
  if (existing) {
    const union = Array.from(new Set([...existing.brainTreeTagIds, ...tagIds]));
    RoomDatabase.updateBrainEvidence(existing.id, {
      brainTreeTagIds: union,
      preview,
      updatedAt: Date.now(),
    });
  } else {
    RoomDatabase.attachEvidenceToTags({
      kind: "goal_progress",
      sourceId: goal.id,
      preview,
      occurredAt: new Date(goal.createdAt).getTime() || Date.now(),
      tagIds,
    });
  }
  recalcAndPersistTagGrowth();
  return existing ?? RoomDatabase.getBrainEvidence().find((e) => e.sourceId === goal.id) ?? null;
}

// ─────────────────────────────────────────────────────────────────────
// AI Suggestion Helper: find best matching (type, dim, tag) by keyword
// ─────────────────────────────────────────────────────────────────────

export interface PlacementCandidate {
  type: BrainTreeType;
  dimension: BrainTreeDimension;
  tag: BrainTreeTag;
  score: number;
}

/**
 * Keyword-based placement fallback (used when AI is unavailable).
 * Scans all tags and scores token overlap with text (title + content).
 * If no matches exist, returns empty array — caller should propose creating new node.
 */
export function findPlacementCandidatesByKeyword(
  text: string,
  maxCandidates = 4,
  minOverlap = 1
): PlacementCandidate[] {
  const types = RoomDatabase.getBrainTreeTypes();
  const dims = RoomDatabase.getBrainTreeDimensions();
  const tags = RoomDatabase.getBrainTreeTags();
  if (tags.length === 0 || !text.trim()) return [];

  const hay = text.toLowerCase();
  const tokens = new Set(
    hay
      .split(/[\s,.;:!?()\[\]"'“”‘’\-–—\/\\]+/u)
      .filter((t) => t.length >= 2)
  );
  if (tokens.size === 0) return [];

  const candidates: PlacementCandidate[] = [];
  for (const tag of tags) {
    const dim = dims.find((d) => d.id === tag.brainTreeDimensionId);
    const type = types.find((t) => t.id === tag.brainTreeTypeId);
    if (!dim || !type) continue;
    const searchFields = [tag.name, dim.name, type.name].join(" ").toLowerCase();
    let overlap = 0;
    for (const tok of tokens) {
      if (searchFields.includes(tok)) overlap++;
    }
    if (overlap >= minOverlap) {
      // bonus if exact tag name appears
      const bonus = hay.includes(tag.name.toLowerCase()) ? 2 : 0;
      candidates.push({ type, dimension: dim, tag, score: overlap + bonus });
    }
  }
  candidates.sort((a, b) => b.score - a.score);
  return candidates.slice(0, maxCandidates);
}

// ─────────────────────────────────────────────────────────────────────
// Lookup helpers for UI
// ─────────────────────────────────────────────────────────────────────

export function getTypeById(id: string): BrainTreeType | undefined {
  return RoomDatabase.getBrainTreeTypes().find((t) => t.id === id);
}
export function getDimensionById(id: string): BrainTreeDimension | undefined {
  return RoomDatabase.getBrainTreeDimensions().find((d) => d.id === id);
}
export function getTagById(id: string): BrainTreeTag | undefined {
  return RoomDatabase.getBrainTreeTags().find((t) => t.id === id);
}

export function getEvidenceByTagId(tagId: string): BrainEvidence[] {
  return RoomDatabase.getBrainEvidence().filter((e) => e.brainTreeTagIds.includes(tagId));
}
export function getEvidenceByDimensionId(dimensionId: string): BrainEvidence[] {
  const tagIds = new Set(
    RoomDatabase.getBrainTreeTags()
      .filter((t) => t.brainTreeDimensionId === dimensionId)
      .map((t) => t.id)
  );
  return RoomDatabase.getBrainEvidence().filter((e) =>
    e.brainTreeTagIds.some((tid) => tagIds.has(tid))
  );
}
export function getEvidenceByTypeId(typeId: string): BrainEvidence[] {
  const tagIds = new Set(
    RoomDatabase.getBrainTreeTags()
      .filter((t) => t.brainTreeTypeId === typeId)
      .map((t) => t.id)
  );
  return RoomDatabase.getBrainEvidence().filter((e) =>
    e.brainTreeTagIds.some((tid) => tagIds.has(tid))
  );
}