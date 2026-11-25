/**
 * @mastermax/web - Types
 * Local types that extend shared types for the web app.
 */

import type { ChatMessage as SharedChatMessage, ChatSession as SharedChatSession } from '@mastermax/shared';

export interface ChatMessage extends SharedChatMessage {
  reasoning?: string;
}

export interface ChatSession extends SharedChatSession {
  systemPrompt?: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  description?: string;
  contextWindow?: number;
  available?: boolean;
  unavailableReason?: string | null;
}

export interface StreamChunk {
  content: string;
  reasoning?: string;
  done: boolean;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface ChatRequest {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface ChatResponse {
  id: string;
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}