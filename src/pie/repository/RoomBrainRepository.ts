import { RoomDatabase } from "../../lib/db";
import type {
  BrainCard,
  BrainTreeDimension,
  BrainTreeTag,
  BrainTreeType,
  BrainEvidence,
  LifeDimension,
  BrainType,
  JournalEntry,
} from "../../types";
import type { BrainRepository, RequestContextOverride } from "./BrainRepository";
import type { RetrievalSource, LearnResult } from "../types";

const PENDING_LEARNING_KEY = "mylifeos_pie_pending_learning_v1";

function keywordMatches(text: string, keywords: string[]): number {
  if (keywords.length === 0) return 0;
  const lower = text.toLowerCase();
  return keywords.reduce((count, kw) => count + (lower.includes(kw.toLowerCase()) ? 1 : 0), 0);
}

function dimensionAllowed(
  dim: LifeDimension | undefined,
  allowed: LifeDimension[] | "*"
): boolean {
  if (!dim) return true;
  if (allowed === "*") return true;
  return allowed.includes(dim);
}

function brainTypeAllowed(bt: BrainType | undefined, allowed: BrainType[] | "*"): boolean {
  if (!bt) return true;
  if (allowed === "*") return true;
  return allowed.includes(bt);
}

function cardToSource(card: BrainCard, hits: number): RetrievalSource {
  return {
    kind: "brain_card_legacy",
    id: card.id,
    title: card.title,
    content: card.description || card.title,
    dimension: card.dimension,
    brainType: card.brainType,
    timestamp: card.updatedAt,
    tags: card.tags,
    rawRef: { card, hits },
  };
}

type JournalLike = Pick<JournalEntry, "title" | "mood" | "content" | "date" | "dimension"> & {
  timestamp?: number;
};

export class RoomBrainRepository implements BrainRepository {
  getBrainTree() {
    return {
      types: this.getBrainTreeTypes(),
      dimensions: this.getBrainTreeDimensions(),
      tags: this.getBrainTreeTags(),
    };
  }

  getBrainTreeTypes(): BrainTreeType[] {
    return RoomDatabase.getBrainTreeTypes();
  }

  getBrainTreeDimensions(): BrainTreeDimension[] {
    return RoomDatabase.getBrainTreeDimensions();
  }

  getBrainTreeTags(): BrainTreeTag[] {
    return RoomDatabase.getBrainTreeTags();
  }

  getBrainEvidence(): BrainEvidence[] {
    return RoomDatabase.getBrainEvidence();
  }

  getJournals(limit = 20): JournalLike[] {
    const all = RoomDatabase.getJournals();
    const recent = all.slice(0, limit);
    return recent.map((j) => ({
      title: j.title,
      mood: j.mood,
      content: j.content,
      date: j.date,
      dimension: j.dimension,
      timestamp: new Date(j.date).getTime() || Date.now(),
    }));
  }

  getLegacyBrainCards(): BrainCard[] {
    return RoomDatabase.getBrainCards();
  }

  getSettings() {
    return RoomDatabase.getSettings();
  }

  getRelevantMemory(params: {
    keywords: string[];
    detectedDimensions: LifeDimension[];
    detectedBrainTypes: BrainType[];
    allowedDimensions: LifeDimension[] | "*";
    allowedBrainTypes: BrainType[] | "*";
    maxSources?: number;
    requestContext?: RequestContextOverride;
  }): RetrievalSource[] {
    const {
      keywords,
      detectedDimensions: dims,
      detectedBrainTypes: types,
      allowedDimensions,
      allowedBrainTypes,
      requestContext,
    } = params;

    const tree = requestContext?.brainTree ?? this.getBrainTree();
    const journalSources = this.convertJournalsToSources(
      keywords,
      dims,
      allowedDimensions,
      requestContext?.recentJournals
    );
    const treeSources = this.convertBrainTreeToSources(tree, keywords, dims, types);
    const legacyCardSources = this.convertBrainCardsToSources(
      keywords,
      dims,
      types,
      allowedDimensions,
      allowedBrainTypes,
      requestContext?.brainCards
    );

    const primarySources = [...treeSources, ...journalSources];
    const fallbackThreshold = 5;
    let final: RetrievalSource[];

    if (primarySources.length < fallbackThreshold && legacyCardSources.length > 0) {
      const slotsRemaining = Math.max(0, fallbackThreshold - primarySources.length);
      final = [...primarySources, ...legacyCardSources.slice(0, slotsRemaining + 8)];
    } else {
      final = primarySources.length > 0 ? primarySources : legacyCardSources;
    }

    return final.slice(0, params.maxSources ?? 30);
  }

  private convertBrainCardsToSources(
    keywords: string[],
    dims: LifeDimension[],
    types: BrainType[],
    allowedDimensions: LifeDimension[] | "*",
    allowedBrainTypes: BrainType[] | "*",
    overrideCards?: BrainCard[]
  ): RetrievalSource[] {
    const cards = overrideCards ?? this.getLegacyBrainCards();
    const sources: RetrievalSource[] = [];
    for (const card of cards) {
      if (!dimensionAllowed(card.dimension, allowedDimensions)) continue;
      if (!brainTypeAllowed(card.brainType, allowedBrainTypes)) continue;

      const textToMatch = `${card.title} ${card.description} ${card.tags.join(" ")}`;
      const kwMatch = keywordMatches(textToMatch, keywords);
      const dimMatch = dims.includes(card.dimension) ? 2 : 0;
      const typeMatch = types.includes(card.brainType) ? 2 : 0;
      const totalHits = kwMatch + dimMatch + typeMatch;

      if (totalHits === 0 && dims.length > 0 && types.length > 0) {
        if (card.updatedAt > Date.now() - 1000 * 60 * 60 * 24 * 30) {
          sources.push(cardToSource(card, 0));
        }
        continue;
      }

      sources.push(cardToSource(card, totalHits));
    }
    return sources.sort((a, b) => {
      const ha = (a.rawRef as { hits?: number })?.hits ?? 0;
      const hb = (b.rawRef as { hits?: number })?.hits ?? 0;
      if (hb !== ha) return hb - ha;
      return b.timestamp - a.timestamp;
    });
  }

  private convertJournalsToSources(
    keywords: string[],
    dims: LifeDimension[],
    allowedDimensions: LifeDimension[] | "*",
    overrideJournals?: JournalLike[]
  ): RetrievalSource[] {
    const journals = overrideJournals ?? this.getJournals(15);
    const sources: RetrievalSource[] = [];
    for (const j of journals) {
      const dim: LifeDimension | undefined = (j as { dimension?: LifeDimension }).dimension;
      if (dim && !dimensionAllowed(dim, allowedDimensions)) continue;

      const textToMatch = `${j.title} ${j.content}`;
      const kwMatch = keywordMatches(textToMatch, keywords);
      const dimMatch = dim && dims.includes(dim) ? 2 : 0;
      const ts = (j as { timestamp?: number }).timestamp ?? Date.now();

      if (kwMatch === 0 && dimMatch === 0) {
        if (ts > Date.now() - 1000 * 60 * 60 * 24 * 14) {
          sources.push({
            kind: "journal",
            id: `j-${ts}-${sources.length}`,
            title: j.title,
            content: j.content,
            dimension: dim,
            timestamp: ts,
            tags: [],
            rawRef: { journal: j, hits: 0 },
          });
        }
        continue;
      }

      sources.push({
        kind: "journal",
        id: `j-${ts}-${sources.length}`,
        title: j.title,
        content: j.content,
        dimension: dim,
        timestamp: ts,
        tags: [],
        rawRef: { journal: j, hits: kwMatch + dimMatch },
      });
    }
    return sources.sort((a, b) => {
      const ha = (a.rawRef as { hits?: number })?.hits ?? 0;
      const hb = (b.rawRef as { hits?: number })?.hits ?? 0;
      if (hb !== ha) return hb - ha;
      return b.timestamp - a.timestamp;
    });
  }

  private convertBrainTreeToSources(
    tree: {
      types: BrainTreeType[];
      dimensions: BrainTreeDimension[];
      tags: BrainTreeTag[];
    },
    keywords: string[],
    dims: LifeDimension[],
    detectedBT: BrainType[]
  ): RetrievalSource[] {
    const { types, dimensions, tags } = tree;
    const sources: RetrievalSource[] = [];

    const dimIdToName = new Map<string, string>();
    for (const d of dimensions) dimIdToName.set(d.id, d.name);

    const typeIdToName = new Map<string, string>();
    for (const t of types) typeIdToName.set(t.id, t.name);

    for (const tag of tags) {
      const dimName = dimIdToName.get(tag.brainTreeDimensionId) ?? "";
      const typeName = typeIdToName.get(tag.brainTreeTypeId) ?? "";

      const textToMatch = `${tag.name} ${dimName} ${typeName}`;
      const kwMatch = keywordMatches(textToMatch, keywords);

      const nameLower = tag.name.toLowerCase();
      const explicitDimHits = dims.filter(
        (d) =>
          nameLower.includes(d.toLowerCase()) || dimName.toLowerCase().includes(d.toLowerCase())
      ).length;

      const explicitTypeHits = detectedBT.filter((bt) =>
        typeName.toLowerCase().includes(bt.toLowerCase())
      ).length;

      const relevance = kwMatch + explicitDimHits * 2 + explicitTypeHits * 2;

      if (relevance === 0 && tag.growthScore > 0) {
        if (tag.updatedAt > Date.now() - 1000 * 60 * 60 * 24 * 60) {
          sources.push({
            kind: "brain_tree_tag",
            id: `bt-tag-${tag.id}`,
            title: tag.name,
            content: `[${typeName}] ${dimName} > ${tag.name} (growth: ${tag.growthScore}, level ${tag.level})`,
            timestamp: tag.updatedAt,
            tags: [tag.name],
            rawRef: { tag, typeName, dimName, hits: 0 },
          });
        }
        continue;
      }

      if (relevance === 0) continue;

      sources.push({
        kind: "brain_tree_tag",
        id: `bt-tag-${tag.id}`,
        title: tag.name,
        content: `[${typeName}] ${dimName} > ${tag.name} (growth: ${tag.growthScore}, level ${tag.level})`,
        timestamp: tag.updatedAt,
        tags: [tag.name],
        rawRef: { tag, typeName, dimName, hits: relevance },
      });
    }

    return sources.sort((a, b) => {
      const ha = (a.rawRef as { hits?: number })?.hits ?? 0;
      const hb = (b.rawRef as { hits?: number })?.hits ?? 0;
      if (hb !== ha) return hb - ha;
      return b.timestamp - a.timestamp;
    });
  }

  savePendingLearning(items: LearnResult["itemsToPersist"]): void {
    try {
      const existing = this.getPendingLearning();
      const merged = [...existing, ...items].slice(-100);
      localStorage.setItem(PENDING_LEARNING_KEY, JSON.stringify(merged));
    } catch (e) {
      console.error("[RoomBrainRepository] savePendingLearning failed:", e);
    }
  }

  getPendingLearning(): LearnResult["itemsToPersist"] {
    try {
      const data = localStorage.getItem(PENDING_LEARNING_KEY);
      if (!data) return [];
      return JSON.parse(data) as LearnResult["itemsToPersist"];
    } catch {
      return [];
    }
  }
}

export const defaultBrainRepository: BrainRepository = new RoomBrainRepository();
