/**
 * Type definitions for AI provider API responses
 */

// OpenAI Response Types
export interface OpenAIErrorResponse {
  error: {
    message: string;
    type: string;
    param: string | null;
    code: string;
  };
}

export interface OpenAICompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Anthropic Response Types
export interface AnthropicErrorResponse {
  error: {
    type: string;
    message: string;
  };
}

export interface AnthropicCompletionResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{
    type: string;
    text: string;
  }>;
  model: string;
  stop_reason: string;
  stop_sequence: string | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

// Google Gemini Response Types
export interface GeminiErrorResponse {
  error: {
    code: number;
    message: string;
    errors: Array<{
      message: string;
      domain: string;
      reason: string;
    }>;
  };
}

export interface GeminiCompletionResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
      role: string;
    };
    finish_reason: string;
    index: number;
    safety_ratings?: Array<{
      category: string;
      probability: string;
    }>;
  }>;
  usage_metadata: {
    prompt_token_count: number;
    candidates_token_count: number;
    total_token_count: number;
  };
}

export function isOpenAIError(data: unknown): data is OpenAIErrorResponse {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj = data as Record<string, unknown>;
  return 'error' in obj && typeof obj.error === 'object';
}

export function isAnthropicError(data: unknown): data is AnthropicErrorResponse {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj = data as Record<string, unknown>;
  return 'error' in obj && typeof obj.error === 'object';
}

export function isGeminiError(data: unknown): data is GeminiErrorResponse {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj = data as Record<string, unknown>;
  if (!('error' in obj) || typeof obj.error !== 'object') {
    return false;
  }
  const error = obj.error as Record<string, unknown>;
  return 'code' in error;
}
