/**
 * Google Gemini provider implementation
 */

import { AIProvider, AIAnalysisRequest, AIAnalysisResponse } from '../AIProvider';
import {
  GeminiCompletionResponse,
  isGeminiError,
} from '../ApiResponseTypes';

export class GeminiProvider implements AIProvider {
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor(apiKey: string, model?: string) {
    this.apiKey = apiKey;
    this.model = model || 'gemini-1.5-pro';
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
  }

  async analyze(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `${request.prompt}\n\n${request.content}`,
                  },
                ],
              },
            ],
            generationConfig: {
              maxOutputTokens: request.maxTokens || 2000,
              temperature: request.temperature || 0.7,
            },
          }),
        }
      );

      if (!response.ok) {
        const error = (await response.json()) as unknown;
        if (isGeminiError(error)) {
          throw new Error(`Gemini API error: ${error.error.message}`);
        }
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = (await response.json()) as GeminiCompletionResponse;

      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response from Gemini API');
      }

      const result = data.candidates[0].content.parts[0].text;
      const tokensUsed =
        data.usage_metadata.prompt_token_count + data.usage_metadata.candidates_token_count;

      return {
        result,
        tokensUsed,
        model: this.model,
        provider: this.getProviderName(),
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Gemini analysis failed: ${error.message}`);
      }
      throw error;
    }
  }

  getProviderName(): string {
    return 'Google Gemini';
  }

  async validateCredentials(): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/models/${this.model}?key=${this.apiKey}`,
        {
          method: 'GET',
        }
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  getAvailableModels(): string[] {
    return [
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-1.0-pro',
      'gemini-1.0-pro-vision',
    ];
  }
}
