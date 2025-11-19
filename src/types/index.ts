/**
 * Core type definitions for Administrator
 */

export interface Config {
  github: GitHubConfig;
  analysis?: AnalysisConfig;
  scoring?: ScoringConfig;
  output?: OutputConfig;
}

export interface GitHubConfig {
  token: string;
  apiVersion?: string;
}

export interface AnalysisConfig {
  minQualityScore?: number;
  maxReposPerBatch?: number;
  timeout?: number;
  cache?: CacheConfig;
}

export interface CacheConfig {
  enabled?: boolean;
  directory?: string;
  ttl?: number;
}

export interface ScoringConfig {
  weights?: ScoringWeights;
}

export interface ScoringWeights {
  codeQuality?: number;
  documentation?: number;
  testing?: number;
  community?: number;
  security?: number;
  dependencies?: number;
}

export interface OutputConfig {
  format?: 'markdown' | 'json' | 'html';
  directory?: string;
  includeJson?: boolean;
}

export interface RepositoryInfo {
  owner: string;
  name: string;
  url: string;
  description?: string;
  language?: string;
  stars: number;
  forks: number;
  openIssues: number;
  createdAt: Date;
  updatedAt: Date;
  license?: string;
}

export interface AnalysisResult {
  repository: RepositoryInfo;
  score: QualityScore;
  metrics: RepositoryMetrics;
  timestamp: Date;
  duration: number;
}

export interface QualityScore {
  overall: number;
  breakdown: {
    codeQuality: number;
    documentation: number;
    testing: number;
    community: number;
    security: number;
    dependencies: number;
  };
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  recommendations: string[];
}

export interface RepositoryMetrics {
  codeQuality: CodeQualityMetrics;
  documentation: DocumentationMetrics;
  testing: TestingMetrics;
  community: CommunityMetrics;
  security: SecurityMetrics;
  dependencies: DependencyMetrics;
}

export interface CodeQualityMetrics {
  linesOfCode: number;
  complexity?: number;
  maintainabilityIndex?: number;
  technicalDebt?: string;
  codeSmells?: number;
}

export interface DocumentationMetrics {
  hasReadme: boolean;
  readmeQuality: number;
  hasContributing: boolean;
  hasLicense: boolean;
  hasChangelog: boolean;
  apiDocumentation: boolean;
  inlineComments?: number;
}

export interface TestingMetrics {
  hasTests: boolean;
  testCoverage?: number;
  testFramework?: string;
  hasCICD: boolean;
  ciStatus?: 'passing' | 'failing' | 'unknown';
}

export interface CommunityMetrics {
  contributors: number;
  issueResponseTime?: number;
  hasCodeOfConduct: boolean;
  hasIssueTemplates: boolean;
  hasPRTemplates: boolean;
  communityHealthScore: number;
}

export interface SecurityMetrics {
  hasSecurityPolicy: boolean;
  vulnerabilities: number;
  dependabotEnabled: boolean;
  secretsExposed: number;
  securityScore: number;
}

export interface DependencyMetrics {
  totalDependencies: number;
  outdatedDependencies: number;
  deprecatedDependencies: number;
  dependencyHealth: number;
}

export type AnalysisStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface BatchAnalysisResult {
  total: number;
  completed: number;
  failed: number;
  results: AnalysisResult[];
  errors: Array<{ repository: string; error: string }>;
}
