/**
 * OpenAI provider implementation
 */

import { AIProvider, AIAnalysisRequest, AIAnalysisResponse } from '../AIProvider';
import {
  OpenAICompletionResponse,
  isOpenAIError,
} from '../ApiResponseTypes';

export class OpenAIProvider implements AIProvider {
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor(apiKey: string, model?: string) {
    this.apiKey = apiKey;
    this.model = model || 'gpt-4-turbo-preview';
    this.baseUrl = 'https://api.openai.com/v1';
  }

  async analyze(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: request.prompt,
            },
            {
              role: 'user',
              content: request.content,
            },
          ],
          max_tokens: request.maxTokens || 2000,
          temperature: request.temperature || 0.7,
        }),
      });

      if (!response.ok) {
        const error = (await response.json()) as unknown;
        if (isOpenAIError(error)) {
          throw new Error(`OpenAI API error: ${error.error.message}`);
        }
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = (await response.json()) as OpenAICompletionResponse;

      return {
        result: data.choices[0].message.content,
        tokensUsed: data.usage.total_tokens,
        model: data.model,
        provider: this.getProviderName(),
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`OpenAI analysis failed: ${error.message}`);
      }
      throw error;
    }
  }

  getProviderName(): string {
    return 'OpenAI';
  }

  async validateCredentials(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  getAvailableModels(): string[] {
    return [
      'gpt-4-turbo-preview',
      'gpt-4',
      'gpt-4-32k',
      'gpt-3.5-turbo',
      'gpt-3.5-turbo-16k',
    ];
  }
}
