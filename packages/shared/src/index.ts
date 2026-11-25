/**
 * @mastermax/shared
 * Shared types, utilities, and constants used across all MasterMax apps.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface AgentAction {
  type: 'tool_call' | 'response' | 'thought';
  payload: unknown;
  timestamp: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

export const APP_NAME = 'MasterMax';
export const APP_VERSION = '0.1.0';

// ─── Utilities ───────────────────────────────────────────────────────────────

export function formatTimestamp(ts: number): string {
  return new Date(ts).toISOString();
}

export function createMessage(
  role: ChatMessage['role'],
  content: string,
): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    timestamp: Date.now(),
  };
}

// ─── API Types ───────────────────────────────────────────────────────────────

export interface ModelInfo {
  id: string;
  name: string;
  description?: string;
  contextWindow?: number;
  available?: boolean;
  unavailableReason?: string | null;
}

export const DEFAULT_MODEL = 'auto';
export const MODELS_ENDPOINT = '/v1/models';