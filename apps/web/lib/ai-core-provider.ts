import { FreeLLMAPIProvider } from '@mastermax/ai-core';
import type { ChatMessage } from '@mastermax/shared';

export const aiProvider = new FreeLLMAPIProvider({
  baseUrl: process.env.FREELLM_API_BASE,
  apiKey: process.env.FREELLM_API_KEY,
  defaultModel: process.env.FREELLM_DEFAULT_MODEL,
});

export async function* streamChat(
  messages: ChatMessage[],
  model?: string,
  temperature?: number
): AsyncGenerator<string> {
  yield* aiProvider.stream({
    messages,
    model,
    temperature,
  });
}

export async function completeChat(
  messages: ChatMessage[],
  model?: string,
  temperature?: number
): Promise<{ content: string; usage?: { promptTokens: number; completionTokens: number; totalTokens: number } }> {
  const result = await aiProvider.complete({
    messages,
    model,
    temperature,
  });

  return {
    content: result.content,
    usage: result.usage,
  };
}