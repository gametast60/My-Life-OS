import type {
  PipelineContext,
  PipelineOptions,
  PipelineRequest,
  PipelineRunResult,
  PIPELINE_STAGE,
  AIRole,
  IntentResult,
  RetrievedMemory,
  RankedMemory,
  BuiltPrompt,
  ProviderResult,
  AnalyzedResponse,
  LearnResult,
} from "./types";
import { getRole } from "./roles";
import { runIntentEngine } from "./layers/intentEngine";
import { runMemoryRetrieval } from "./layers/memoryRetrieval";
import { runContextRanking } from "./layers/contextRanking";
import { runPromptBuilder } from "./layers/promptBuilder";
import { runProviderRouter } from "./layers/providerRouter";
import { runResponseAnalyzer } from "./layers/responseAnalyzer";
import { runLearningEngine } from "./layers/learningEngine";
import type { UserSettings, APIProvider } from "../types";
import { defaultBrainRepository } from "./repository/RoomBrainRepository";
import type { BrainRepository } from "./repository/BrainRepository";
import { pipelineLogger } from "./logger";
import { registerAllRoles } from "./roles/index";

registerAllRoles();

export function resolveRepository(options?: PipelineOptions): BrainRepository {
  return options?.repository ?? defaultBrainRepository;
}

export function getProvidersFromSettings(settings?: UserSettings): APIProvider[] {
  if (!settings) return [];
  if (settings.apiProviders && settings.apiProviders.length > 0) {
    return settings.apiProviders.map((p) => ({ ...p }));
  }
  if (settings.aiApiKey?.trim()) {
    return [
      {
        id: "legacy-gemini",
        name: "Gemini",
        apiKey: settings.aiApiKey,
        model: settings.aiModel || "gemini-2.5-flash",
        enabled: true,
        priority: 1,
      },
    ];
  }
  return [];
}

export function createEmptyContext(
  request: PipelineRequest,
  options?: PipelineOptions
): PipelineContext {
  // S7: resolve bieEnabled (explicit false → disabled; undefined/true/truthy → enabled = opt-out model)
  const effectiveBieEnabled: boolean = options?.bieEnabled !== false;
  const resolvedOptions: PipelineOptions & { bieEnabled: boolean } = {
    ...(options ?? {}),
    bieEnabled: effectiveBieEnabled,
  };

  const role: AIRole = getRole(request.roleId);
  const settings =
    request.settings ?? resolveRepository(options).getSettings();
  const providers = getProvidersFromSettings(settings);

  const emptyIntent: IntentResult = {
    messageType: "unknown",
    userGoal: "",
    detectedDimensions: [],
    detectedBrainTypes: [],
    urgency: 0,
    requiresContext: false,
    keywords: [],
  };
  const emptyRetrieval: RetrievedMemory = { sources: [], queryFragments: [] };
  const emptyRanking: RankedMemory = { sources: [], topRelevancePct: 0 };
  const emptyPrompt: BuiltPrompt = {
    systemPrompt: "",
    userPrompt: request.userInput,
    contextTokenEstimate: 0,
    usedMemoryCount: 0,
  };
  const emptyProvider: ProviderResult = {
    providerId: "none",
    providerName: "Gemini",
    model: "",
    rawText: "",
    latencyMs: 0,
    success: false,
  };
  const emptyAnalysis: AnalyzedResponse = {
    rawText: "",
    metadata: { tone: "ทั่วไป", lengthCategory: "short", containsActionable: false, containsQuestion: false },
    confidence: 0,
    extractedFacts: [],
    suggestedMemories: [],
  };
  const emptyLearn: LearnResult = { shouldPersist: false, itemsToPersist: [], applied: false };

  return {
    timestamp: Date.now(),
    request,
    role,
    providers,
    intent: emptyIntent,
    retrievedMemory: emptyRetrieval,
    rankedMemory: emptyRanking,
    prompt: emptyPrompt,
    providerResult: emptyProvider,
    analysis: emptyAnalysis,
    learnResult: emptyLearn,
    errors: [],
    options: resolvedOptions,
  };
}

function runStage(
  stage: PIPELINE_STAGE,
  ctx: PipelineContext,
  options: PipelineOptions,
  pipelineId: string,
  onStage?: (stage: PIPELINE_STAGE, ctx: PipelineContext) => void
): PipelineContext | Promise<PipelineContext> {
  if (options.skipStages?.[stage]) {
    pipelineLogger.endStage(pipelineId, stage, ctx);
    onStage?.(stage, ctx);
    return ctx;
  }
  pipelineLogger.startStage(pipelineId, stage);
  let result: PipelineContext | Promise<PipelineContext>;
  switch (stage) {
    case "intent":
      result = runIntentEngine(ctx);
      break;
    case "retrieval":
      result = runMemoryRetrieval(ctx, options);
      break;
    case "ranking":
      result = runContextRanking(ctx, options);
      break;
    case "prompt_build":
      result = runPromptBuilder(ctx);
      break;
    case "provider_call":
      result = runProviderRouter(ctx);
      break;
    case "analysis":
      result = runResponseAnalyzer(ctx);
      break;
    case "learning":
      if (options.learningEnabled === false) {
        result = ctx;
      } else {
        result = runLearningEngine(ctx, options);
      }
      break;
    default:
      result = ctx;
  }
  const finalize = (resolved: PipelineContext): PipelineContext => {
    pipelineLogger.endStage(pipelineId, stage, resolved);
    if (onStage) onStage(stage, resolved);
    return resolved;
  };
  if (result instanceof Promise) {
    return result.then(finalize);
  }
  return finalize(result);
}

export async function runPipeline(
  request: PipelineRequest,
  options: PipelineOptions = {}
): Promise<PipelineRunResult> {
  const pipelineId = pipelineLogger.startPipeline(request.roleId);

  let ctx: PipelineContext = createEmptyContext(request, options);
  const stagesRun: PIPELINE_STAGE[] = ["created"];

  const ordered: PIPELINE_STAGE[] = [
    "intent",
    "retrieval",
    "ranking",
    "prompt_build",
    "provider_call",
    "analysis",
    "learning",
  ];

  for (const stage of ordered) {
    const next = runStage(stage, ctx, options, pipelineId, options.onStageComplete);
    if (next instanceof Promise) {
      ctx = await next;
    } else {
      ctx = next;
    }
    stagesRun.push(stage);
  }
  stagesRun.push("complete");
  pipelineLogger.completePipeline(pipelineId, ctx);

  const finalText = ctx.providerResult.success
    ? ctx.providerResult.rawText
    : (ctx.providerResult.error
      ? `[ไม่สามารถเชื่อมต่อ AI ได้] ${ctx.providerResult.error}\n\nกรุณาตรวจสอบ API Key ใน Manage AI ครับ`
      : "");

  const success = ctx.providerResult.success || ctx.providerResult.rawText.length > 0;

  return {
    success,
    finalText,
    context: ctx,
    stagesRun,
  };
}

export function createPipelineRequestFromLegacy(params: {
  prompt: string;
  systemPrompt?: string;
  roleHint?: "coach" | "therapist" | "reflection" | "future_self" | "secretary" | "decision" | "planner" | "custom";
  settings?: UserSettings;
  brainCards?: any[];
  recentJournals?: any[];
  outputFormat?: "text" | "json";
}): PipelineRequest {
  const roleMap: Record<string, PipelineRequest["roleId"]> = {
    coach: "coach",
    therapist: "therapist",
    reflection: "coach",
    future_self: "coach",
    secretary: "planner",
    decision: "planner",
    planner: "planner",
    custom: "custom",
  };
  return {
    userInput: params.prompt,
    roleId: roleMap[params.roleHint ?? "custom"] ?? "custom",
    settings: params.settings,
    extraContext: {
      brainCards: params.brainCards ?? [],
      recentJournals: params.recentJournals ?? [],
      customSystemPrompt: params.systemPrompt,
      outputFormat: params.outputFormat,
    },
  };
}
