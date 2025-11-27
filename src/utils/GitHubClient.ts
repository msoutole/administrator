/**
 * GitHub API client wrapper
 */

import { Octokit } from '@octokit/rest';
import { RepositoryInfo } from '../types';
import { parseRepositoryUrl } from '../utils/helpers';

interface RateLimitState {
  remaining: number;
  resetTime: number;
  limit: number;
}

export class GitHubClient {
  private octokit: Octokit;
  private rateLimitState: RateLimitState = {
    remaining: 60,
    resetTime: Date.now() + 60 * 60 * 1000,
    limit: 60,
  };
  private maxRetries: number = 3;
  private retryDelays: number[] = [1000, 2000, 4000]; // Backoff delays in ms

  constructor(token: string, apiVersion?: string) {
    this.octokit = new Octokit({
      auth: token,
      headers: {
        'X-GitHub-Api-Version': apiVersion || '2022-11-28',
      },
    });
  }

  async getRepositoryInfo(repoUrl: string): Promise<RepositoryInfo> {
    const { owner, name } = parseRepositoryUrl(repoUrl);

    try {
      const { data } = await this.octokit.repos.get({
        owner,
        repo: name,
      });

      return {
        owner: data.owner.login,
        name: data.name,
        url: data.html_url,
        description: data.description || undefined,
        language: data.language || undefined,
        stars: data.stargazers_count,
        forks: data.forks_count,
        openIssues: data.open_issues_count,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        license: data.license?.spdx_id || undefined,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch repository info: ${error.message}`);
      }
      throw error;
    }
  }

  async getFileContent(owner: string, repo: string, path: string): Promise<string | null> {
    try {
      const { data } = await this.octokit.repos.getContent({
        owner,
        repo,
        path,
      });

      if ('content' in data && typeof data.content === 'string') {
        return Buffer.from(data.content, 'base64').toString('utf-8');
      }
      return null;
    } catch {
      return null;
    }
  }

  async hasFile(owner: string, repo: string, path: string): Promise<boolean> {
    try {
      await this.octokit.repos.getContent({
        owner,
        repo,
        path,
      });
      return true;
    } catch {
      return false;
    }
  }

  async getContributors(owner: string, repo: string): Promise<number> {
    try {
      const { data } = await this.octokit.repos.listContributors({
        owner,
        repo,
        per_page: 100,
      });
      return data.length;
    } catch {
      return 0;
    }
  }

  async getLanguages(owner: string, repo: string): Promise<Record<string, number>> {
    try {
      const { data } = await this.octokit.repos.listLanguages({
        owner,
        repo,
      });
      return data;
    } catch {
      return {};
    }
  }

  /**
   * Check rate limit status
   */
  async checkRateLimit(): Promise<RateLimitState> {
    try {
      const { data } = await this.octokit.rateLimit.get();
      this.rateLimitState = {
        remaining: data.rate.remaining,
        resetTime: data.rate.reset * 1000, // Convert to milliseconds
        limit: data.rate.limit,
      };
      return this.rateLimitState;
    } catch {
      return this.rateLimitState;
    }
  }

  /**
   * Get current rate limit state
   */
  getRateLimitState(): RateLimitState {
    return this.rateLimitState;
  }

  /**
   * Wait if rate limit is approaching
   */
  private async waitIfRateLimited(): Promise<void> {
    const state = this.rateLimitState;

    // If we have less than 10 requests remaining, wait for reset
    if (state.remaining < 10) {
      const now = Date.now();
      const waitTime = Math.max(0, state.resetTime - now);

      if (waitTime > 0) {
        console.warn(
          `Rate limit approaching (${state.remaining}/${state.limit}). Waiting ${waitTime}ms for reset.`
        );
        await this.sleep(waitTime + 1000); // Add 1 second buffer
      }

      // Update rate limit state
      await this.checkRateLimit();
    }
  }

  /**
   * Retry logic with exponential backoff
   */
  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    retryCount: number = 0
  ): Promise<T> {
    try {
      await this.waitIfRateLimited();
      return await fn();
    } catch (error) {
      if (retryCount < this.maxRetries && this.isRetryableError(error)) {
        const delay = this.retryDelays[retryCount];
        console.warn(`Request failed, retrying in ${delay}ms (attempt ${retryCount + 1}/${this.maxRetries})`);
        await this.sleep(delay);
        return this.retryWithBackoff(fn, retryCount + 1);
      }
      throw error;
    }
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: unknown): boolean {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      // Retry on network errors and some 5xx errors
      return (
        message.includes('econnreset') ||
        message.includes('enotfound') ||
        message.includes('timeout') ||
        message.includes('502') ||
        message.includes('503') ||
        message.includes('429') // Rate limit
      );
    }
    return false;
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default GitHubClient;
