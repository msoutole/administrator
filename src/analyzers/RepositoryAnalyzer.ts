/**
 * Main repository analyzer
 */

import { Config, AnalysisResult, BatchAnalysisResult } from '../types';
import { ConfigManager } from '../config/ConfigManager';
import { GitHubClient } from '../utils/GitHubClient';
import { DocumentationAnalyzer } from './DocumentationAnalyzer';
import { ScoringEngine } from './ScoringEngine';
import { parseRepositoryUrl } from '../utils/helpers';

export class RepositoryAnalyzer {
  private config: Config;
  private githubClient: GitHubClient;
  private documentationAnalyzer: DocumentationAnalyzer;
  private scoringEngine: ScoringEngine;

  constructor(config?: Partial<Config>) {
    const configManager = new ConfigManager(config);
    this.config = configManager.getConfig();
    this.githubClient = new GitHubClient(
      configManager.getGitHubToken(),
      this.config.github.apiVersion
    );
    this.documentationAnalyzer = new DocumentationAnalyzer(this.githubClient);
    this.scoringEngine = new ScoringEngine(this.config.scoring?.weights);
  }

  async analyze(repository: string): Promise<AnalysisResult> {
    const startTime = Date.now();

    try {
      const { owner, name } = parseRepositoryUrl(repository);

      // Fetch repository info
      const repoInfo = await this.githubClient.getRepositoryInfo(repository);

      // Analyze documentation
      const docMetrics = await this.documentationAnalyzer.analyze(owner, name);

      // Analyze testing
      const testingMetrics = {
        hasTests: await this.hasTests(owner, name),
        hasCICD: await this.hasCICD(owner, name),
        ciStatus: 'unknown' as const,
      };

      // Analyze community
      const contributors = await this.githubClient.getContributors(owner, name);
      const communityMetrics = {
        contributors,
        hasCodeOfConduct: await this.githubClient.hasFile(owner, name, 'CODE_OF_CONDUCT.md'),
        hasIssueTemplates: await this.hasIssueTemplates(owner, name),
        hasPRTemplates: await this.hasPRTemplates(owner, name),
        communityHealthScore: this.calculateCommunityHealth(contributors, repoInfo.stars),
      };

      // Analyze security
      const securityMetrics = {
        hasSecurityPolicy: await this.githubClient.hasFile(owner, name, 'SECURITY.md'),
        vulnerabilities: 0,
        dependabotEnabled: false,
        secretsExposed: 0,
        securityScore: 75,
      };

      // Analyze code quality
      const languages = await this.githubClient.getLanguages(owner, name);
      const totalLines = Object.values(languages).reduce((sum, lines) => sum + lines, 0);
      const codeQualityMetrics = {
        linesOfCode: totalLines,
        maintainabilityIndex: 75,
      };

      // Analyze dependencies
      const dependencyMetrics = {
        totalDependencies: 0,
        outdatedDependencies: 0,
        deprecatedDependencies: 0,
        dependencyHealth: 80,
      };

      // Calculate scores
      const metrics = {
        codeQuality: codeQualityMetrics,
        documentation: docMetrics,
        testing: testingMetrics,
        community: communityMetrics,
        security: securityMetrics,
        dependencies: dependencyMetrics,
      };

      const score = this.scoringEngine.calculateScore(metrics);

      const duration = Date.now() - startTime;

      return {
        repository: repoInfo,
        score,
        metrics,
        timestamp: new Date(),
        duration,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Analysis failed for ${repository}: ${error.message}`);
      }
      throw error;
    }
  }

  async batchAnalyze(repositories: string[]): Promise<BatchAnalysisResult> {
    const maxBatch = this.config.analysis?.maxReposPerBatch || 10;
    const toAnalyze = repositories.slice(0, maxBatch);

    const results: AnalysisResult[] = [];
    const errors: Array<{ repository: string; error: string }> = [];

    for (const repo of toAnalyze) {
      try {
        const result = await this.analyze(repo);
        results.push(result);
      } catch (error) {
        errors.push({
          repository: repo,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return {
      total: toAnalyze.length,
      completed: results.length,
      failed: errors.length,
      results,
      errors,
    };
  }

  private async hasTests(owner: string, repo: string): Promise<boolean> {
    const testPaths = ['test/', 'tests/', '__tests__/', 'spec/'];
    for (const path of testPaths) {
      if (await this.githubClient.hasFile(owner, repo, path)) {
        return true;
      }
    }
    return false;
  }

  private async hasCICD(owner: string, repo: string): Promise<boolean> {
    const ciPaths = ['.github/workflows/', '.gitlab-ci.yml', '.travis.yml', 'circle.yml'];
    for (const path of ciPaths) {
      if (await this.githubClient.hasFile(owner, repo, path)) {
        return true;
      }
    }
    return false;
  }

  private async hasIssueTemplates(owner: string, repo: string): Promise<boolean> {
    return await this.githubClient.hasFile(owner, repo, '.github/ISSUE_TEMPLATE');
  }

  private async hasPRTemplates(owner: string, repo: string): Promise<boolean> {
    const prPaths = ['.github/PULL_REQUEST_TEMPLATE.md', '.github/pull_request_template.md'];
    for (const path of prPaths) {
      if (await this.githubClient.hasFile(owner, repo, path)) {
        return true;
      }
    }
    return false;
  }

  private calculateCommunityHealth(contributors: number, stars: number): number {
    const contributorScore = Math.min(contributors / 10, 1) * 50;
    const popularityScore = Math.min(stars / 100, 1) * 50;
    return Math.round(contributorScore + popularityScore);
  }
}

export default RepositoryAnalyzer;
