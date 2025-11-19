/**
 * GitHub API client wrapper
 */

import { Octokit } from '@octokit/rest';
import { RepositoryInfo } from '../types';
import { parseRepositoryUrl } from '../utils/helpers';

export class GitHubClient {
  private octokit: Octokit;

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
}

export default GitHubClient;
