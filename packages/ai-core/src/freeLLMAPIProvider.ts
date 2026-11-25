/**
 * @mastermax/ai-core
 * FreeLLMAPI provider — wraps the OpenAI-compatible gateway at
 * http://localhost:3001/v1 with streaming support.
 */

import type { ChatMessage, ModelInfo } from '@mastermax/shared';
import type {
  CompletionRequest,
  CompletionResponse,
  ModelProvider,
} from './index';

export interface FreeLLMAPIProviderOptions {
  baseUrl?: string;
  apiKey?: string;
  defaultModel?: string;
  timeoutMs?: number;
}

export class FreeLLMAPIProvider implements ModelProvider {
  public readonly name = 'FreeLLMAPI';

  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly defaultModel: string;
  private readonly timeoutMs: number;

  constructor(options: FreeLLMAPIProviderOptions = {}) {
    this.baseUrl = (options.baseUrl ?? process.env.FREELLM_API_BASE ?? 'http://localhost:3001/v1').replace(/\/$/, '');
    this.apiKey = options.apiKey ?? process.env.FREELLM_API_KEY ?? 'freellmapi-65177c08f67112390d20126ccb8ea4c0eea66ee707eecccc';
    this.defaultModel = options.defaultModel ?? process.env.FREELLM_DEFAULT_MODEL ?? 'auto';
    this.timeoutMs = options.timeoutMs ?? 60000;
  }

  private headers(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.apiKey}`,
    };
  }

  private async fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await fetch(url, { ...init, signal: controller.signal });
      return res;
    } finally {
      clearTimeout(timer);
    }
  }

  async complete(req: CompletionRequest): Promise<CompletionResponse> {
    const res = await this.fetchWithTimeout(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({
        model: req.model ?? this.defaultModel,
        messages: req.messages.map((m) => ({ role: m.role, content: m.content })),
        max_tokens: req.maxTokens,
        temperature: req.temperature,
        stream: false,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`FreeLLMAPI ${res.status}: ${text}`);
    }

    const data = await res.json();
    const choice = data.choices?.[0]?.message;
    return {
      content: choice?.content ?? '',
      model: data.model ?? req.model ?? this.defaultModel,
      usage: {
        promptTokens: data.usage?.prompt_tokens ?? 0,
        completionTokens: data.usage?.completion_tokens ?? 0,
        totalTokens: data.usage?.total_tokens ?? 0,
      },
    };
  }

  async *stream(req: CompletionRequest): AsyncGenerator<string> {
    const res = await this.fetchWithTimeout(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({
        model: req.model ?? this.defaultModel,
        messages: req.messages.map((m) => ({ role: m.role, content: m.content })),
        max_tokens: req.maxTokens,
        temperature: req.temperature,
        stream: true,
        stream_options: { include_usage: true },
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`FreeLLMAPI ${res.status}: ${text}`);
    }

    const reader = res.body?.getReader();
    if (!reader) {
      throw new Error('FreeLLMAPI: response body is not readable');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let accumulated = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let lineEnd: number;
      while ((lineEnd = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, lineEnd).trim();
        buffer = buffer.slice(lineEnd + 1);

        if (!line.startsWith('data: ')) continue;
        const payload = line.slice(6).trim();
        if (payload === '[DONE]') return;

        let parsed: any;
        try {
          parsed = JSON.parse(payload);
        } catch {
          continue;
        }

        const delta = parsed?.choices?.[0]?.delta?.content;
        if (typeof delta === 'string' && delta.length > 0) {
          accumulated += delta;
          yield delta;
        }
      }
    }

    if (accumulated.length === 0) {
      throw new Error('FreeLLMAPI: stream produced no content');
    }
  }

  async listModels(): Promise<ModelInfo[]> {
    const res = await this.fetchWithTimeout(`${this.baseUrl}/models`, {
      method: 'GET',
      headers: this.headers(),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`FreeLLMAPI ${res.status}: ${text}`);
    }

    const data = await res.json();
    const items: any[] = Array.isArray(data) ? data : data?.data ?? [];
    return items.map((m: any) => ({
      id: m.id ?? m.name ?? String(m),
      name: m.name ?? m.id ?? String(m),
      description: m.description,
      contextWindow: m.context_window ?? m.context_length,
      available: m.available ?? true,
      unavailableReason: m.unavailable_reason ?? null,
    }));
  }
}