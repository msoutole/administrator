/**
 * Anthropic (Claude) provider implementation
 */

import { AIProvider, AIAnalysisRequest, AIAnalysisResponse } from '../AIProvider';
import {
  AnthropicCompletionResponse,
  isAnthropicError,
} from '../ApiResponseTypes';

export class AnthropicProvider implements AIProvider {
  private apiKey: string;
  private model: string;
  private baseUrl: string;
  private apiVersion: string;

  constructor(apiKey: string, model?: string) {
    this.apiKey = apiKey;
    this.model = model || 'claude-3-5-sonnet-20241022';
    this.baseUrl = 'https://api.anthropic.com/v1';
    this.apiVersion = '2023-06-01';
  }

  async analyze(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': this.apiVersion,
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: request.maxTokens || 2000,
          temperature: request.temperature || 0.7,
          system: request.prompt,
          messages: [
            {
              role: 'user',
              content: request.content,
            },
          ],
        }),
      });

      if (!response.ok) {
        const error = (await response.json()) as unknown;
        if (isAnthropicError(error)) {
          throw new Error(`Anthropic API error: ${error.error.message}`);
        }
        throw new Error(`Anthropic API error: ${response.statusText}`);
      }

      const data = (await response.json()) as AnthropicCompletionResponse;

      return {
        result: data.content[0].text,
        tokensUsed: data.usage.input_tokens + data.usage.output_tokens,
        model: data.model,
        provider: this.getProviderName(),
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Anthropic analysis failed: ${error.message}`);
      }
      throw error;
    }
  }

  getProviderName(): string {
    return 'Anthropic';
  }

  async validateCredentials(): Promise<boolean> {
    try {
      // Anthropic doesn't have a simple validation endpoint
      // We'll try a minimal message to validate
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': this.apiVersion,
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 10,
          messages: [
            {
              role: 'user',
              content: 'Hi',
            },
          ],
        }),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  getAvailableModels(): string[] {
    return [
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022',
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307',
    ];
  }
}
