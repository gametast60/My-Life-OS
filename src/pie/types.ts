import type {
  AIMode,
  APIProvider,
  BrainCard,
  JournalEntry,
  UserSettings,
  BrainTreeType,
  BrainTreeDimension,
  BrainTreeTag,
  LifeDimension,
  BrainType,
} from "../types";
import type { BrainRepository } from "./repository/BrainRepository";

export type MessageType =
  | "question"
  | "statement"
  | "command"
  | "reflection"
  | "greeting"
  | "planning"
  | "emotional"
  | "unknown";

export interface IntentResult {
  messageType: MessageType;
  userGoal: string;
  detectedDimensions: LifeDimension[];
  detectedBrainTypes: BrainType[];
  urgency: number;
  requiresContext: boolean;
  keywords: string[];
}

export interface RetrievalSource {
  kind: "brain_card_legacy" | "journal" | "brain_tree_tag" | "brain_tree_dimension" | "brain_tree_type";
  id: string;
  title: string;
  content: string;
  dimension?: LifeDimension;
  brainType?: BrainType;
  timestamp: number;
  tags: string[];
  rawRef: unknown;
  // ── BIE (Phase 4A) additive ranking signals ──────────────────────
  // All OPTIONAL: when BIE is disabled OR a signal is not computed,
  // these remain undefined and the existing 3-factor scorer is used
  // unchanged (hard constraint P4-8 — additive only, no breakage).
  /** Semantic similarity [0,1] from embedding cosine vs query vector. */
  semanticScore?: number;
  /** Tag-overlap score [0,1] from synonym-aware tag matching. */
  tagMatchScore?: number;
  /** Knowledge-graph boost [0,1] from graph edge traversal (Phase 4B). */
  graphScore?: number;
}

export interface RetrievedMemory {
  sources: RetrievalSource[];
  queryFragments: string[];
}

export interface RankedMemory {
  sources: (RetrievalSource & {
    relevance: number;
    confidence: number;
    recency: number;
    totalScore: number;
  })[];
  topRelevancePct: number;
}

export interface BuiltPrompt {
  systemPrompt: string;
  userPrompt: string;
  contextTokenEstimate: number;
  usedMemoryCount: number;
}

export type ProviderName = "Gemini" | "Groq" | "OpenRouter";

export interface ProviderResult {
  providerId: string;
  providerName: ProviderName;
  model: string;
  rawText: string;
  latencyMs: number;
  success: boolean;
  error?: string;
}

export interface ExtractedFact {
  fact: string;
  confidence: number;
  suggestedTag?: string;
  suggestedDimension?: LifeDimension;
  suggestedBrainType?: BrainType;
}

export interface AnalyzedResponse {
  rawText: string;
  metadata: {
    tone: string;
    lengthCategory: "short" | "medium" | "long";
    containsActionable: boolean;
    containsQuestion: boolean;
  };
  confidence: number;
  extractedFacts: ExtractedFact[];
  suggestedMemories: {
    title: string;
    content: string;
    reasoning: string;
    confidence: number;
  }[];
}

export interface LearnResult {
  shouldPersist: boolean;
  itemsToPersist: {
    kind: "brain_card" | "brain_tree_evidence" | "brain_tree_tag_suggestion";
    payload: Record<string, unknown>;
    reason: string;
    confidence: number;
  }[];
  applied: boolean;
}

export type AIRoleId =
  | "coach"
  | "therapist"
  | "psychologist"
  | "planner"
  | "language_tutor"
  | "trading_mentor"
  | "teacher"
  | "nutrition"
  | "custom";

export interface AIRole {
  id: AIRoleId;
  name: string;
  legacyAIMode?: AIMode;
  persona: string;
  tone: string;
  allowedDimensions: LifeDimension[] | "*";
  allowedBrainTypes: BrainType[] | "*";
  contextPriority: LifeDimension[];
  memoryWeight: number;
  goalWeight: number;
  promptStrategy: "concise" | "detailed" | "socratic" | "reflective";
  temperature: number;
  maxTokens: number;
}

export interface PipelineRequest {
  userInput: string;
  roleId: AIRoleId;
  settings?: UserSettings;
  extraContext?: {
    brainCards?: BrainCard[];
    recentJournals?: Pick<JournalEntry, "title" | "mood" | "content" | "date" | "dimension" | "timestamp">[];
    brainTree?: {
      types: BrainTreeType[];
      dimensions: BrainTreeDimension[];
      tags: BrainTreeTag[];
    };
    customSystemPrompt?: string;
    customUserPrefix?: string;
    customUserSuffix?: string;
    outputFormat?: "text" | "json";
  };
}

export interface PipelineContext {
  timestamp: number;
  request: PipelineRequest;
  role: AIRole;
  providers: APIProvider[];
  intent: IntentResult;
  retrievedMemory: RetrievedMemory;
  rankedMemory: RankedMemory;
  prompt: BuiltPrompt;
  providerResult: ProviderResult;
  analysis: AnalyzedResponse;
  learnResult: LearnResult;
  errors: { layer: string; message: string; stack?: string }[];
}

export type PIPELINE_STAGE =
  | "created"
  | "intent"
  | "retrieval"
  | "ranking"
  | "prompt_build"
  | "provider_call"
  | "analysis"
  | "learning"
  | "complete";

export const PIPELINE_STAGES_ORDER: PIPELINE_STAGE[] = [
  "created",
  "intent",
  "retrieval",
  "ranking",
  "prompt_build",
  "provider_call",
  "analysis",
  "learning",
  "complete",
];

export interface PipelineOptions {
  skipStages?: Partial<Record<PIPELINE_STAGE, boolean>>;
  maxRetrievalSources?: number;
  maxRankedSources?: number;
  learningEnabled?: boolean;
  onStageComplete?: (stage: PIPELINE_STAGE, ctx: PipelineContext) => void;
  repository?: BrainRepository;
  /**
   * BIE enable switch (Phase 4A).
   *
   * Default behavior when omitted/true: BIE hooks (when wired in later
   * sub-phases) MAY run. When explicitly `false`: ALL BIE hooks SKIP,
   * so the pipeline behaves EXACTLY like Pre-Phase-4 (keyword-only
   * 3-factor ranking, no embeddings, no graph, no identity).
   *
   * Hard constraint P4-14 — Future-Proof Disable Switch.
   */
  bieEnabled?: boolean;
}

export interface PipelineRunResult {
  success: boolean;
  finalText: string;
  context: PipelineContext;
  stagesRun: PIPELINE_STAGE[];
}
