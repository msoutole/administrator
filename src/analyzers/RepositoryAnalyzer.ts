/**
 * Main repository analyzer
 */

import { Config, AnalysisResult, BatchAnalysisResult } from '../types';
import { ConfigManager } from '../config/ConfigManager';
import { GitHubClient } from '../utils/GitHubClient';
import { DocumentationAnalyzer } from './DocumentationAnalyzer';
import { SecurityAnalyzer } from './SecurityAnalyzer';
import { DependencyAnalyzer } from './DependencyAnalyzer';
import { CodeComplexityAnalyzer } from './CodeComplexityAnalyzer';
import { CommunityAnalyzer } from './CommunityAnalyzer';
import { ScoringEngine } from './ScoringEngine';
import { parseRepositoryUrl } from '../utils/helpers';

export class RepositoryAnalyzer {
  private config: Config;
  private githubClient: GitHubClient;
  private documentationAnalyzer: DocumentationAnalyzer;
  private securityAnalyzer: SecurityAnalyzer;
  private dependencyAnalyzer: DependencyAnalyzer;
  private codeComplexityAnalyzer: CodeComplexityAnalyzer;
  private communityAnalyzer: CommunityAnalyzer;
  private scoringEngine: ScoringEngine;

  constructor(config?: Partial<Config>) {
    const configManager = new ConfigManager(config);
    this.config = configManager.getConfig();
    this.githubClient = new GitHubClient(
      configManager.getGitHubToken(),
      this.config.github.apiVersion
    );
    this.documentationAnalyzer = new DocumentationAnalyzer(
      this.githubClient,
      this.config.ai
    );
    this.securityAnalyzer = new SecurityAnalyzer(this.githubClient);
    this.dependencyAnalyzer = new DependencyAnalyzer(this.githubClient);
    this.codeComplexityAnalyzer = new CodeComplexityAnalyzer(this.githubClient);
    this.communityAnalyzer = new CommunityAnalyzer(this.githubClient);
    this.scoringEngine = new ScoringEngine(this.config.scoring?.weights);
  }

  async analyze(repository: string): Promise<AnalysisResult> {
    const startTime = Date.now();

    try {
      const { owner, name } = parseRepositoryUrl(repository);

      // Fetch repository info
      const repoInfo = await this.githubClient.getRepositoryInfo(repository);

      // Fetch languages and calculate lines of code in parallel with other initial data
      const languages = await this.githubClient.getLanguages(owner, name);
      const totalLines = Object.values(languages).reduce((sum, lines) => sum + lines, 0);
      const contributors = await this.githubClient.getContributors(owner, name);

      // Run all analyses in parallel
      const [
        docMetrics,
        testingMetrics,
        communityMetrics,
        securityMetrics,
        codeQualityMetrics,
        dependencyMetrics,
      ] = await Promise.all([
        this.documentationAnalyzer.analyze(owner, name),
        this.analyzeTestingMetrics(owner, name),
        this.communityAnalyzer.analyze(owner, name, contributors, repoInfo.stars),
        this.securityAnalyzer.analyze(owner, name),
        this.codeComplexityAnalyzer.analyze(owner, name, totalLines),
        this.dependencyAnalyzer.analyze(owner, name),
      ]);

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

    // Process with configurable concurrency (default 3)
    const concurrency = 3;
    for (let i = 0; i < toAnalyze.length; i += concurrency) {
      const batch = toAnalyze.slice(i, i + concurrency);
      const batchResults = await Promise.allSettled(
        batch.map(repo => this.analyze(repo))
      );

      for (let j = 0; j < batchResults.length; j++) {
        const result = batchResults[j];
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          errors.push({
            repository: batch[j],
            error: result.reason instanceof Error ? result.reason.message : 'Unknown error',
          });
        }
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

  private async analyzeTestingMetrics(
    owner: string,
    repo: string
  ): Promise<{ hasTests: boolean; hasCICD: boolean; ciStatus: 'passing' | 'failing' | 'unknown' }> {
    const [hasTests, hasCICD] = await Promise.all([
      this.hasTests(owner, repo),
      this.hasCICD(owner, repo),
    ]);

    return {
      hasTests,
      hasCICD,
      ciStatus: 'unknown', // Would require additional API calls to determine actual status
    };
  }

  private async hasTests(owner: string, repo: string): Promise<boolean> {
    const testPaths = [
      'test/',
      'tests/',
      '__tests__/',
      'spec/',
      'test.js',
      'test.ts',
      'tests.js',
      'tests.ts',
    ];
    for (const path of testPaths) {
      if (await this.githubClient.hasFile(owner, repo, path)) {
        return true;
      }
    }
    return false;
  }

  private async hasCICD(owner: string, repo: string): Promise<boolean> {
    // Check for all major CI/CD platforms
    const ciPaths = [
      // GitHub Actions
      '.github/workflows/',
      '.github/workflows/ci.yml',
      '.github/workflows/ci.yaml',
      '.github/workflows/test.yml',
      '.github/workflows/test.yaml',
      // GitLab CI
      '.gitlab-ci.yml',
      // Travis CI
      '.travis.yml',
      '.travis.yaml',
      // Circle CI
      '.circleci/config.yml',
      'circle.yml',
      // Jenkins
      'Jenkinsfile',
      // AppVeyor
      'appveyor.yml',
      // Azure Pipelines
      'azure-pipelines.yml',
      'azure-pipelines.yaml',
      // Drone CI
      '.drone.yml',
      // Buildkite
      '.buildkite/pipeline.yml',
    ];

    for (const path of ciPaths) {
      if (await this.githubClient.hasFile(owner, repo, path)) {
        return true;
      }
    }
    return false;
  }
}

export default RepositoryAnalyzer;
