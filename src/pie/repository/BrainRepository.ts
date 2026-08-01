import type {
  BrainCard,
  BrainTreeDimension,
  BrainTreeTag,
  BrainTreeType,
  JournalEntry,
  UserSettings,
  BrainEvidence,
  LifeDimension,
  BrainType,
} from "../../types";
import type { RetrievalSource, LearnResult } from "../types";

export interface RequestContextOverride {
  brainCards?: BrainCard[];
  recentJournals?: (Pick<JournalEntry, "title" | "mood" | "content" | "date" | "dimension"> & {
    timestamp?: number;
  })[];
  brainTree?: {
    types: BrainTreeType[];
    dimensions: BrainTreeDimension[];
    tags: BrainTreeTag[];
  };
  options?: {
    bieEnabled?: boolean;
  };
}

export interface BrainRepository {
  getBrainTree(): {
    types: BrainTreeType[];
    dimensions: BrainTreeDimension[];
    tags: BrainTreeTag[];
  };

  getBrainTreeTypes(): BrainTreeType[];
  getBrainTreeDimensions(): BrainTreeDimension[];
  getBrainTreeTags(): BrainTreeTag[];
  getBrainEvidence(): BrainEvidence[];

  getJournals(limit?: number): (Pick<
    JournalEntry,
    "title" | "mood" | "content" | "date" | "dimension"
  > & { timestamp?: number })[];

  getLegacyBrainCards(): BrainCard[];

  getSettings(): UserSettings | undefined;

  getRelevantMemory(params: {
    keywords: string[];
    detectedDimensions: LifeDimension[];
    detectedBrainTypes: BrainType[];
    allowedDimensions: LifeDimension[] | "*";
    allowedBrainTypes: BrainType[] | "*";
    maxSources?: number;
    requestContext?: RequestContextOverride;
    bieEnabled?: boolean;
  }): Promise<RetrievalSource[]> | RetrievalSource[];

  savePendingLearning(items: LearnResult["itemsToPersist"]): void;
  getPendingLearning(): LearnResult["itemsToPersist"];
}
