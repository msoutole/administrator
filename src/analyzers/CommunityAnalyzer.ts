/**
 * Community health analysis for repositories
 */

import { CommunityMetrics } from '../types';
import { GitHubClient } from '../utils/GitHubClient';

export class CommunityAnalyzer {
  constructor(private githubClient: GitHubClient) {}

  async analyze(
    owner: string,
    repo: string,
    contributors: number,
    stars: number
  ): Promise<CommunityMetrics> {
    const [
      hasCodeOfConduct,
      hasIssueTemplates,
      hasPRTemplates,
      issueResponseTime,
    ] = await Promise.all([
      this.hasCodeOfConduct(owner, repo),
      this.hasIssueTemplates(owner, repo),
      this.hasPRTemplates(owner, repo),
      this.estimateIssueResponseTime(owner, repo),
    ]);

    const communityHealthScore = this.calculateCommunityScore(
      contributors,
      stars,
      hasCodeOfConduct,
      hasIssueTemplates,
      hasPRTemplates,
      issueResponseTime
    );

    return {
      contributors,
      issueResponseTime,
      hasCodeOfConduct,
      hasIssueTemplates,
      hasPRTemplates,
      communityHealthScore,
    };
  }

  private async hasCodeOfConduct(owner: string, repo: string): Promise<boolean> {
    const paths = [
      'CODE_OF_CONDUCT.md',
      '.github/CODE_OF_CONDUCT.md',
      'docs/CODE_OF_CONDUCT.md',
      'CONDUCT.md',
    ];

    for (const path of paths) {
      if (await this.githubClient.hasFile(owner, repo, path)) {
        return true;
      }
    }
    return false;
  }

  private async hasIssueTemplates(owner: string, repo: string): Promise<boolean> {
    const paths = [
      '.github/ISSUE_TEMPLATE',
      '.github/issue_template',
      '.github/ISSUE_TEMPLATE.md',
      '.github/issue_template.md',
    ];

    for (const path of paths) {
      if (await this.githubClient.hasFile(owner, repo, path)) {
        return true;
      }
    }
    return false;
  }

  private async hasPRTemplates(owner: string, repo: string): Promise<boolean> {
    const paths = [
      '.github/PULL_REQUEST_TEMPLATE.md',
      '.github/pull_request_template.md',
      '.github/PULL_REQUEST_TEMPLATE',
      '.github/pull_request_template',
      '.github/CONTRIBUTING.md',
    ];

    for (const path of paths) {
      if (await this.githubClient.hasFile(owner, repo, path)) {
        return true;
      }
    }
    return false;
  }

  private async estimateIssueResponseTime(owner: string, repo: string): Promise<number | undefined> {
    // In a real scenario, you'd fetch recent issues and calculate response time
    // For now, return undefined as it requires more API calls
    try {
      // This would require fetching issues and checking when they were answered
      // Simplified: assume responsive if has code of conduct
      return undefined;
    } catch {
      return undefined;
    }
  }

  private calculateCommunityScore(
    contributors: number,
    stars: number,
    hasCodeOfConduct: boolean,
    hasIssueTemplates: boolean,
    hasPRTemplates: boolean,
    issueResponseTime?: number
  ): number {
    let score = 0;

    // Contributor score (0-30 points)
    // More nuanced: logarithmic scale
    if (contributors >= 100) {
      score += 30;
    } else if (contributors >= 50) {
      score += 25;
    } else if (contributors >= 20) {
      score += 20;
    } else if (contributors >= 10) {
      score += 15;
    } else if (contributors >= 5) {
      score += 10;
    } else if (contributors >= 1) {
      score += 5;
    }

    // Star score (0-30 points)
    // Logarithmic scale for stars
    if (stars >= 10000) {
      score += 30;
    } else if (stars >= 5000) {
      score += 25;
    } else if (stars >= 1000) {
      score += 20;
    } else if (stars >= 500) {
      score += 15;
    } else if (stars >= 100) {
      score += 10;
    } else if (stars >= 10) {
      score += 5;
    }

    // Community practices (0-40 points)
    if (hasCodeOfConduct) {
      score += 10;
    }
    if (hasIssueTemplates) {
      score += 10;
    }
    if (hasPRTemplates) {
      score += 10;
    }
    if (issueResponseTime && issueResponseTime < 24 * 60 * 60 * 1000) {
      // Less than 24 hours
      score += 10;
    }

    return Math.min(100, Math.round(score));
  }
}

export default CommunityAnalyzer;
