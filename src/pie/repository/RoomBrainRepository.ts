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
import { createDefaultSemanticService } from "../bie/semanticService";
import { VectorIndex } from "../bie/vectorIndex";
import {
  rankItems as hybridRankItems,
  type ScorableItem,
  type HybridScoreContext,
} from "../bie/hybridScorer";
import { cosineSimilarity } from "../bie/utils";
import type { EmbeddingRecord } from "../bie/types";

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

  /**
   * Retrieve memory candidates matching keyword / dimension / type filters,
   * then run the legacy 3-factor keyword-only pipeline.
   *
   * @see The BIE Phase-4A S6 additive enrichment hook below enriches the
   *      returned rows with optional `semanticScore` / `tagMatchScore` /
   *      `graphScore` fields declared on RetrievalSource in pie/types.ts
   *      (lines 50/52/54). When BIE is absent, disabled, or throws — the
   *      legacy array is returned untouched (full backward compatibility).
   */
  async getRelevantMemory(params: {
    keywords: string[];
    detectedDimensions: LifeDimension[];
    detectedBrainTypes: BrainType[];
    allowedDimensions: LifeDimension[] | "*";
    allowedBrainTypes: BrainType[] | "*";
    maxSources?: number;
    requestContext?: RequestContextOverride;
    bieEnabled?: boolean;
  }): Promise<RetrievalSource[]> {
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
    let legacy: RetrievalSource[];

    if (primarySources.length < fallbackThreshold && legacyCardSources.length > 0) {
      const slotsRemaining = Math.max(0, fallbackThreshold - primarySources.length);
      legacy = [...primarySources, ...legacyCardSources.slice(0, slotsRemaining + 8)];
    } else {
      legacy = primarySources.length > 0 ? primarySources : legacyCardSources;
    }

    legacy = legacy.slice(0, params.maxSources ?? 30);

    /**
     * BIE Phase-4A S6 additive enrichment hook.
     * Uses S5 semanticService + vectorIndex + hybridScorer to populate
     * S1-declared optional fields (RetrievalSource.semanticScore /
     * .tagMatchScore / .graphScore).
     *
     * SKIPS ENTIRELY when bieEnabled=false or any BIE module throws →
     * legacy 3-factor keyword baseline is preserved unchanged.
     */
    try {
      // S7 Disable Switch: explicit bieEnabled=false → skip all BIE modules, preserve legacy 100%.
      if (params?.bieEnabled === false || params?.requestContext?.options?.bieEnabled === false) {
        return legacy;
      }
      const settings = this.getSettings();
      const providers = (settings as any)?.apiProviders ?? [];
      const semanticService = createDefaultSemanticService(providers);

      const bieRepo = (semanticService as any)._repo ??
        (semanticService.constructor.name.includes("SemanticService")
          ? null
          : null);

      if (legacy.length === 0) return legacy;

      const vectorIndex = new VectorIndex(
        bieRepo ?? {
          getEmbeddings: () => [],
          getEmbedding: () => undefined,
          saveEmbedding: () => {},
          deleteEmbedding: () => {},
          getGraphNodes: () => [],
          getGraphNode: () => undefined,
          saveGraphNode: () => {},
          deleteGraphNode: () => {},
          getGraphEdges: () => [],
          saveGraphEdge: () => {},
          applyGraphEdge: () => {},
          deleteGraphEdge: () => {},
          getIdentity: () => undefined,
          saveIdentity: () => {},
          applyIdentity: () => {},
          getInsights: () => [],
          appendInsight: () => {},
          applyInsight: () => {},
          deleteInsight: () => {},
          getTimelineItems: () => [],
          getTimelineItem: () => undefined,
          saveTimelineItem: () => {},
          clearTimeline: () => {},
          getPendingBieItems: () => [],
          getPendingBieItemsByKind: () => [],
          appendPendingBieItem: () => {},
          applyPendingBieItem: () => {},
          rejectPendingBieItem: () => {},
        },
        semanticService
      );

      const allTexts: string[] = [];
      const scorableItems: ScorableItem[] = [];

      for (let i = 0; i < legacy.length; i++) {
        const src = legacy[i];
        const textOrContent = (src.title ? src.title + " " : "") + (src.content ?? "");
        allTexts.push(textOrContent);

        let confidence = 0.5;
        switch (src.kind) {
          case "brain_tree_tag":
            confidence = 0.95;
            break;
          case "journal":
            confidence = 0.9;
            break;
          case "brain_card_legacy":
            confidence = 0.85;
            break;
          default:
            confidence = 0.5;
        }
        const rawRefAny = src.rawRef as any;
        if (rawRefAny && typeof rawRefAny.tag === "object" && rawRefAny.tag && typeof rawRefAny.tag.priority === "number") {
          confidence = Math.min(1, 0.5 + (rawRefAny.tag.priority ?? 0) * 0.1);
        }

        scorableItems.push({
          textOrContent,
          tags: src.tags ?? [],
          dimension: src.dimension,
          createdAtMs: src.timestamp,
          confidence,
          embeddingId: undefined,
        });
      }

      const candidateRecords: EmbeddingRecord[] = allTexts.length > 0
        ? await semanticService.batchEmbedTexts(allTexts)
        : [];

      const queryText = keywords.join(" ");
      const queryVecRecord = queryText.length > 0
        ? await semanticService.embedText(queryText)
        : null;
      const queryVec = queryVecRecord ? queryVecRecord.embedding : [];

      const semanticScoresMap = new Map<string, number>();
      for (let i = 0; i < candidateRecords.length; i++) {
        const rec = candidateRecords[i];
        if (!rec || !rec.embedding || !scorableItems[i]) continue;
        scorableItems[i].embeddingId = rec.id;
        const sim = queryVec.length > 0
          ? cosineSimilarity(queryVec, rec.embedding)
          : 0;
        semanticScoresMap.set(rec.id, Number.isFinite(sim) && sim >= 0 ? Math.min(1, sim) : 0);
      }

      const filterDimension: LifeDimension | undefined =
        dims.length === 1 ? dims[0] : undefined;

      const hybridCtx: HybridScoreContext = {
        queryKeywords: keywords ?? [],
        filterDimension,
        semanticScores: semanticScoresMap,
      };

      const ranked = hybridRankItems(scorableItems, hybridCtx, legacy.length);

      // S8: Attach semanticScore / tagMatchScore to each legacy source by
      // original insertion index (scorableItems[i] ↔ legacy[i]) so scores
      // are correct regardless of hybrid sort order.
      // ranked[] is already sorted DESC by hybridScore; its elements carry
      // the scorableItem fields but NOT the legacy RetrievalSource ref.
      // We build a Map<original-index → ranked-row> keyed by embeddingId
      // with index fallback to attach scores back to the correct source.

      // Build embeddingId → ranked-row lookup for O(1) score attachment.
      const embeddingIdToRankedRow = new Map<
        string,
        { semanticScore: number; tagMatchScore: number }
      >();
      // Also keep a parallel array: rankedIndexMap[rankPos] = legacyIndex
      // so we can reconstruct hybrid-sorted RetrievalSource array.
      const hybridSortedLegacy: RetrievalSource[] = new Array(legacy.length);

      for (let ri = 0; ri < ranked.length; ri++) {
        const r = ranked[ri];
        if (r.embeddingId) {
          embeddingIdToRankedRow.set(r.embeddingId, {
            semanticScore: Number.isFinite(r.semanticScore)
              ? Math.max(0, Math.min(1, r.semanticScore))
              : 0,
            tagMatchScore: Number.isFinite(r.tagMatchScore)
              ? Math.max(0, Math.min(1, r.tagMatchScore))
              : 0,
          });
        }
      }

      // Attach scores to legacy sources (by original index).
      for (let i = 0; i < legacy.length; i++) {
        const src = legacy[i];
        const embId = scorableItems[i]?.embeddingId;
        const scores = embId ? embeddingIdToRankedRow.get(embId) : undefined;
        src.semanticScore = scores?.semanticScore ?? 0;
        src.tagMatchScore = scores?.tagMatchScore ?? 0;
        src.graphScore = 0;
      }

      // S8: Build hybrid-sorted output array by reconstructing legacy
      // RetrievalSource references in the same DESC order as ranked[].
      // This reorders user-visible results by the 6-factor hybrid score
      // when bieEnabled=true (P4-2 compliant: bieEnabled=false path has
      // already returned above via the S7 guard at line 181).
      const legacyIndexByEmbId = new Map<string, number>();
      const noEmbedLegacyIndices: number[] = [];
      for (let i = 0; i < legacy.length; i++) {
        const embId = scorableItems[i]?.embeddingId;
        if (embId) {
          legacyIndexByEmbId.set(embId, i);
        } else {
          noEmbedLegacyIndices.push(i);
        }
      }

      let hybridPos = 0;
      for (let ri = 0; ri < ranked.length; ri++) {
        const r = ranked[ri];
        const legacyIdx = r.embeddingId
          ? legacyIndexByEmbId.get(r.embeddingId)
          : undefined;
        if (legacyIdx !== undefined) {
          hybridSortedLegacy[hybridPos++] = legacy[legacyIdx];
        }
      }
      // Append any items that had no embedding (rare) at the end.
      for (const idx of noEmbedLegacyIndices) {
        hybridSortedLegacy[hybridPos++] = legacy[idx];
      }

      // Return hybrid-sorted array (bieEnabled=true path).
      return hybridSortedLegacy.slice(0, hybridPos);
    } catch (e: any) {
      console.warn("[BIE S6 hook skipped:", e?.message ?? String(e), "]");
      return legacy;
    }
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
