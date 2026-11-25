/**
 * @mastermax/ai-core
 * Core AI engine: model integrations, prompt engineering, and autonomous
 * decision-making components for the MasterMax super-app.
 */

import type { AgentAction, ChatMessage, ModelInfo } from '@mastermax/shared';
import { FreeLLMAPIProvider } from './freeLLMAPIProvider';

export interface CompletionRequest {
  messages: ChatMessage[];
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface CompletionResponse {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AgentStep {
  thought: string;
  action: AgentAction;
}

// ─── Model Provider Interface ────────────────────────────────────────────────

export interface ModelProvider {
  name: string;
  complete(req: CompletionRequest): Promise<CompletionResponse>;
  stream?(req: CompletionRequest): AsyncGenerator<string>;
}

// ─── Prompt Engineering ──────────────────────────────────────────────────────

export function buildSystemPrompt(context: {
  appName: string;
  userPreferences?: Record<string, string>;
}): string {
  const lines = [
    `You are ${context.appName}, an autonomous AI assistant.`,
    'Help the user with tasks across web, desktop, and mobile contexts.',
    'Be concise, accurate, and proactive.',
  ];

  if (context.userPreferences) {
    lines.push('User preferences:', JSON.stringify(context.userPreferences));
  }

  return lines.join('\n');
}

// ─── Agent Loop (autonomous decision-making) ─────────────────────────────────

export class Agent {
  private steps: AgentStep[] = [];

  constructor(
    private provider: ModelProvider,
    private maxSteps = 10,
  ) {}

  async run(userMessage: string): Promise<AgentStep[]> {
    this.steps = [];
    // Placeholder for autonomous planning loop.
    // Each iteration: observe → think → act → observe.
    return this.steps;
  }

  get history(): readonly AgentStep[] {
    return this.steps;
  }
}

// ─── Exports ─────────────────────────────────────────────────────────────────

export type { ChatMessage, AgentAction, ModelInfo };
export { FreeLLMAPIProvider };

export const AI_CORE_VERSION = '0.1.0';
