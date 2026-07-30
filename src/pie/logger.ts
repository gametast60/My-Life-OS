import type { PIPELINE_STAGE, PipelineContext, ProviderResult } from "./types";

export interface PipelineLogEntry {
  timestamp: number;
  pipelineId: string;
  stage: PIPELINE_STAGE;
  durationMs: number;
  retrievalCount?: number;
  rankingTopScore?: number;
  provider?: string;
  model?: string;
  providerLatency?: number;
  success?: boolean;
  error?: string;
  roleId?: string;
}

class PipelineLogger {
  private logs: PipelineLogEntry[] = [];
  private stageStartTimes: Map<string, { stage: PIPELINE_STAGE; start: number }> = new Map();
  private readonly maxLogs = 200;

  private genId(): string {
    return `pipe-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  startPipeline(roleId?: string): string {
    const id = this.genId();
    this.pushLog({
      timestamp: Date.now(),
      pipelineId: id,
      stage: "created",
      durationMs: 0,
      roleId,
    });
    return id;
  }

  startStage(pipelineId: string, stage: PIPELINE_STAGE): void {
    this.stageStartTimes.set(`${pipelineId}:${stage}`, { stage, start: Date.now() });
  }

  endStage(
    pipelineId: string,
    stage: PIPELINE_STAGE,
    ctx?: PipelineContext
  ): void {
    const key = `${pipelineId}:${stage}`;
    const entry = this.stageStartTimes.get(key);
    const duration = entry ? Date.now() - entry.start : 0;
    this.stageStartTimes.delete(key);

    const log: PipelineLogEntry = {
      timestamp: Date.now(),
      pipelineId,
      stage,
      durationMs: duration,
      roleId: ctx?.role?.id,
    };

    if (stage === "retrieval" && ctx?.retrievedMemory?.sources) {
      log.retrievalCount = ctx.retrievedMemory.sources.length;
    }
    if (stage === "ranking" && ctx?.rankedMemory?.sources?.[0]) {
      log.rankingTopScore = ctx.rankedMemory.sources[0].totalScore;
    }
    if (stage === "provider_call" && ctx?.providerResult) {
      const pr: ProviderResult = ctx.providerResult;
      log.provider = pr.providerName;
      log.model = pr.model;
      log.providerLatency = pr.latencyMs;
      log.success = pr.success;
      log.error = pr.error;
    }

    if (ctx?.errors && ctx.errors.length > 0) {
      const lastErr = ctx.errors[ctx.errors.length - 1];
      log.error = `${lastErr.layer}: ${lastErr.message}`;
    }

    this.pushLog(log);
  }

  completePipeline(pipelineId: string, ctx?: PipelineContext): void {
    this.pushLog({
      timestamp: Date.now(),
      pipelineId,
      stage: "complete",
      durationMs: 0,
      roleId: ctx?.role?.id,
      success: ctx?.errors ? ctx.errors.length === 0 : undefined,
    });
  }

  private pushLog(entry: PipelineLogEntry): void {
    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.length = this.maxLogs;
    }
  }

  getLogs(limit = 50): PipelineLogEntry[] {
    return this.logs.slice(0, limit);
  }

  getLogsByPipeline(pipelineId: string): PipelineLogEntry[] {
    return this.logs.filter((l) => l.pipelineId === pipelineId);
  }

  clear(): void {
    this.logs = [];
    this.stageStartTimes.clear();
  }
}

export const pipelineLogger = new PipelineLogger();
