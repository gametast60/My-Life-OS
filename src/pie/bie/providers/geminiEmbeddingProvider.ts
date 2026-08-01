// ─────────────────────────────────────────────────────────────────────
// BIE — Gemini Embedding Provider (Primary / Default)
// Phase 4A S3 — Default Provider Implementation (CONCRETE)
// ─────────────────────────────────────────────────────────────────────
//
// Implements `EmbeddingProvider` interface (S1) via Google's Gemini
// Embeddings HTTP API. Uses the same `@google/genai` endpoint style as
// `providerRouter.ts` (Phase 1) for consistency — no new SDK dependency.
//
// Hard constraints honored:
//   P4-5  Never throws on network/quota errors — always returns
//         `{ ok: false, ... }` so the hybrid orchestrator can fall
//         back to `LocalBM25EmbeddingProvider`.
//   P4-9  Depends on `EmbeddingProvider` interface ONLY. No other BIE
//         module imports this concrete type (imports via interface).
//   P4-10 Uses `contentHash()` (S2) to expose a stable cache key to the
//         Repository (S4). This provider does NOT persist — caching is
//         Repository's job per the Dependency Rule.
//   P4-7  Does not import any PIE layer (type-only import of
//         APIProvider is allowed — it's a settings type, not a layer).
//
// NOT wired into the pipeline yet (S6 responsibility). This file has
// zero consumers at the time of S3 commit — zero runtime impact.
// ─────────────────────────────────────────────────────────────────────

import type { APIProvider } from "../../../types";
import type { EmbeddingMethod } from "../types";
import type {
  EmbeddingOutcome,
  EmbeddingProvider,
  EmbeddingFailureReason,
} from "./embeddingProvider";
import { contentHash } from "../utils";

/**
 * Default model id passed to the Gemini embeddings endpoint.
 * Per DECISIONS.md "Hybrid Embedding Strategy" — uses text-embedding-004
 * which produces 768-dimensional unit-normalized vectors.
 */
const DEFAULT_MODEL = "text-embedding-004";

/** Fixed vector dimensionality for the Gemini text-embedding-004 model. */
const DEFAULT_DIMENSIONS = 768;

/**
 * Timeout (ms) applied to each embedding HTTP call. Prevents a hanging
 * network request from blocking the hybrid fallback path.
 * Chosen value: 10s — generous for 2G/3G mobile but not so long that
 * the user perceives the app as frozen. Trade-off documented in
 * DECISIONS.md (S3 adds a new entry if confirmed).
 */
const FETCH_TIMEOUT_MS = 10_000;

/**
 * Produces the Gemini embeddings API URL for a given model + apiKey.
 * Mirrors the URL-building style in `providerRouter.ts` callGemini()
 * so both providers stay consistent in endpoint format / error handling.
 */
function buildEmbedUrl(model: string, apiKey: string): string {
  const cleanModel = model?.trim() || DEFAULT_MODEL;
  const cleanKey = apiKey?.trim() || "";
  return `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:embedContent?key=${encodeURIComponent(cleanKey)}`;
}

/**
 * Produces the batch-embeddings URL (single round-trip for N texts).
 * Falls back to sequential single embeds if the batch endpoint is not
 * supported, but constructing the URL here lets us cleanly try batch first.
 */
function buildBatchEmbedUrl(model: string, apiKey: string): string {
  const cleanModel = model?.trim() || DEFAULT_MODEL;
  const cleanKey = apiKey?.trim() || "";
  return `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:batchEmbedContents?key=${encodeURIComponent(cleanKey)}`;
}

/**
 * Classifies an error / HTTP response into one of the typed
 * `EmbeddingFailureReason` values so the orchestrator can decide
 * whether to fall back (quota/network) or fail fast (invalid_input).
 */
function classifyFailure(status: number, message: string): EmbeddingFailureReason {
  const msg = (message || "").toLowerCase();
  if (status === 429 || msg.includes("quota") || msg.includes("resource_exhausted") || msg.includes("rate limit")) {
    return "quota";
  }
  if (status === 400 || status === 404 || msg.includes("invalid") || msg.includes("bad request")) {
    return "invalid_input";
  }
  if (msg.includes("network") || msg.includes("timeout") || msg.includes("fetch") || msg.includes("aborted")) {
    return "network";
  }
  if (status === 0 || (status >= 500 && status < 600)) {
    return "network";
  }
  return "unknown";
}

/**
 * Primary `EmbeddingProvider` implementation: uses the Google Gemini
 * text-embedding-004 (768-dim) HTTP endpoint.
 *
 * Construction takes an `APIProvider` settings record (same shape used
 * throughout the PIE pipeline — `src/types.ts`). This keeps the provider
 * swappable: future embedding providers (`openai`, `voyageai`, `nomic`)
 * each accept their own settings record via their constructor.
 *
 * @example
 *   const provider = new GeminiEmbeddingProvider(settings.apiProviders[0]);
 *   if (provider.isAvailable()) {
 *     const outcome = await provider.embed("การเงิน");
 *     if (outcome.ok) use(outcome.embedding);
 *   }
 *
 * ### Failure modes guarded (never throws):
 *   - `invalid_input`   — empty / whitespace-only text, missing apiKey,
 *                         HTTP 400/404 from the endpoint.
 *   - `quota`           — HTTP 429, or response body carries
 *                         `RESOURCE_EXHAUSTED` / `quota`.
 *   - `network`         — fetch failure, timeout (10s), HTTP 5xx.
 *   - `unknown`         — anything else (malformed JSON, missing vector).
 */
export class GeminiEmbeddingProvider implements EmbeddingProvider {
  readonly id: EmbeddingMethod = "gemini";
  readonly displayName = "Gemini Embedding (text-embedding-004)";
  readonly dimensions = DEFAULT_DIMENSIONS;

  /** Resolved model id (trimmed) — defaults to text-embedding-004. */
  private readonly _model: string;

  /** Resolved api key (trimmed & non-empty) or empty string. */
  private readonly _apiKey: string;

  /**
   * @param settings - An `APIProvider` entry from user settings. The
   *   provider is considered "available" only when `enabled === true`
   *   AND `apiKey` is non-empty after trimming (see `isAvailable`).
   */
  constructor(private readonly _settings: APIProvider) {
    this._model = _settings?.model?.trim() || DEFAULT_MODEL;
    this._apiKey = _settings?.apiKey?.trim() || "";
  }

  /**
   * Cheap synchronous availability probe.
   *
   * The hybrid orchestrator (S5 semanticService) calls this BEFORE
   * awaiting `embed()` to skip over dead providers without paying the
   * cost of a round-trip DNS / TCP timeout.
   *
   * @returns `true` if: the wrapped settings row is `enabled`, the
   *   provider `name` matches `"Gemini"` (case-insensitive), AND a
   *   non-empty `apiKey` is present. Otherwise `false`.
   *
   *   NOTE: Availability ≠ the API is reachable right now. It only
   *   means "attempting the network call is worth it". A `false` here
   *   short-circuits straight to the `quota`/`unavailable` outcome
   *   inside `embed` for defensive callers.
   */
  isAvailable(): boolean {
    const s = this._settings;
    if (!s) return false;
    if (!s.enabled) return false;
    const name = (s.name || "").toLowerCase();
    if (name !== "gemini") return false;
    return this._apiKey.length > 0;
  }

  /**
   * Embed a single text via Gemini's `embedContent` endpoint.
   *
   * @param text - Raw input (mixed Thai/English allowed). Empty or
   *   whitespace-only input returns a typed `invalid_input` failure
   *   synchronously wrapped in a Promise — no network call is made.
   *
   * @returns `EmbeddingOutcome` — never rejects. Always resolves to:
   *   - `{ ok: true, embedding: number[768], method: "gemini", model, dimensions: 768 }`
   *   - `{ ok: false, reason: "quota" | "network" | "invalid_input" | "unknown", message }`
   *
   * ### Side-effect-free cache-key exposure:
   *   On success, the caller can reproduce the cache key with
   *   `contentHash(text)` (P4-10). This provider does NOT persist its
   *   own cache — persistence belongs to S4 `BrainIntelligenceRepository`.
   */
  async embed(text: string): Promise<EmbeddingOutcome> {
    const safeText = text ?? "";

    if (!safeText.trim()) {
      return {
        ok: false,
        reason: "invalid_input",
        message: "GeminiEmbeddingProvider: empty input text",
      };
    }

    if (!this.isAvailable()) {
      return {
        ok: false,
        reason: "unavailable",
        message:
          "GeminiEmbeddingProvider: not available (disabled, non-Gemini name, or missing apiKey). " +
          "Cache key for reference: " +
          contentHash(safeText),
      };
    }

    const url = buildEmbedUrl(this._model, this._apiKey);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: { role: "user", parts: [{ text: safeText }] },
        }),
        signal: controller.signal,
      });

      const body = await response.json().catch(() => null);
      clearTimeout(timeoutId);

      if (!response.ok) {
        const msg = body?.error?.message || `HTTP ${response.status}`;
        return {
          ok: false,
          reason: classifyFailure(response.status, msg),
          message: `GeminiEmbeddingProvider: ${msg}`,
        };
      }

      const values: unknown = body?.embedding?.values;
      if (!Array.isArray(values) || values.length === 0) {
        return {
          ok: false,
          reason: "unknown",
          message:
            "GeminiEmbeddingProvider: response missing `embedding.values` array",
        };
      }

      const numeric = values.map((v) => Number(v));
      if (numeric.some((n) => !Number.isFinite(n))) {
        return {
          ok: false,
          reason: "unknown",
          message:
            "GeminiEmbeddingProvider: embedding vector contained non-finite values",
        };
      }

      return {
        ok: true,
        embedding: numeric,
        method: "gemini",
        model: this._model,
        dimensions: numeric.length,
      };
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      const msg = err instanceof Error ? err.message : String(err ?? "unknown error");
      return {
        ok: false,
        reason: classifyFailure(0, msg),
        message: `GeminiEmbeddingProvider: ${msg}`,
      };
    }
  }

  /**
   * Embed multiple texts. Uses the Gemini `batchEmbedContents` endpoint
   * when possible; transparently falls back to sequential `embed()`
   * calls if the batch endpoint returns an unsupported error.
   *
   * @param texts - Array of raw input strings. Length MAY be 0 (returns
   *   an empty outcome array). Empty-string entries within the array
   *   produce per-slot `invalid_input` outcomes — they do NOT poison
   *   the whole batch (this matches the "fail-single, not batch"
   *   semantics of the hybrid fallback path).
   *
   * @returns Outcome array with the SAME length and order as `texts`.
   *   Never rejects — each slot is independently resolved so one bad
   *   row does not take the whole batch down.
   *
   * ### Batch vs sequential choice:
   *   The Gemini free-tier batch endpoint supports up to 100 texts per
   *   call. For inputs with > 100 rows we split into chunks of 100 and
   *   stitch the results. If the batch endpoint fails entirely for any
   *   reason (e.g. quota/network), the provider falls back to one
   *   `embed()` call per text and returns the per-item outcomes.
   */
  async batchEmbed(texts: string[]): Promise<EmbeddingOutcome[]> {
    const input = texts ?? [];
    if (input.length === 0) return [];

    if (!this.isAvailable()) {
      return input.map((t) => ({
        ok: false as const,
        reason: "unavailable" as const,
        message:
          "GeminiEmbeddingProvider.batchEmbed: provider not available. " +
          "Cache key for reference: " +
          contentHash(t ?? ""),
      }));
    }

    try {
      const CHUNK_SIZE = 100;
      const out: EmbeddingOutcome[] = [];
      for (let i = 0; i < input.length; i += CHUNK_SIZE) {
        const chunk = input.slice(i, i + CHUNK_SIZE);
        const chunkResults = await this._batchChunk(chunk);
        out.push(...chunkResults);
      }
      return out;
    } catch {
      return Promise.all(input.map((t) => this.embed(t)));
    }
  }

  /**
   * Internal: runs a single chunk through `batchEmbedContents`.
   * Performs minimal validation; outer caller handles fallback.
   */
  private async _batchChunk(chunk: string[]): Promise<EmbeddingOutcome[]> {
    const url = buildBatchEmbedUrl(this._model, this._apiKey);
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      FETCH_TIMEOUT_MS * Math.max(1, Math.min(3, Math.ceil(chunk.length / 20)))
    );

    try {
      const requests = chunk.map((t) => ({
        content: { role: "user", parts: [{ text: t }] },
      }));

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requests }),
        signal: controller.signal,
      });

      const body = await response.json().catch(() => null);
      clearTimeout(timeoutId);

      if (!response.ok) {
        const msg = body?.error?.message || `HTTP ${response.status}`;
        throw new Error(msg);
      }

      const embeddings: unknown = body?.embeddings;
      if (!Array.isArray(embeddings) || embeddings.length !== chunk.length) {
        throw new Error(
          "batchEmbedContents returned unexpected `embeddings` array length"
        );
      }

      return embeddings.map((entry, idx) => {
        const values: unknown = (entry as { values?: unknown })?.values;
        if (!Array.isArray(values) || values.length === 0) {
          return {
            ok: false as const,
            reason: "unknown" as const,
            message: `GeminiEmbeddingProvider.batchEmbed[${idx}]: missing values`,
          };
        }
        const numeric = values.map((v) => Number(v));
        if (numeric.some((n) => !Number.isFinite(n))) {
          return {
            ok: false as const,
            reason: "unknown" as const,
            message: `GeminiEmbeddingProvider.batchEmbed[${idx}]: non-finite value`,
          };
        }
        return {
          ok: true as const,
          embedding: numeric,
          method: "gemini" as const,
          model: this._model,
          dimensions: numeric.length,
        };
      });
    } catch (err) {
      clearTimeout(timeoutId);
      return Promise.all(chunk.map((t) => this.embed(t)));
    }
  }
}
