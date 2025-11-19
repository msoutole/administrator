# API Types Reference

Complete TypeScript type definitions for Administrator.

## Core Types

### Config

Main configuration interface for Administrator.

```typescript
interface Config {
  github: GitHubConfig;
  analysis?: AnalysisConfig;
  scoring?: ScoringConfig;
  output?: OutputConfig;
}
```

### AnalysisResult

Result object returned from repository analysis.

```typescript
interface AnalysisResult {
  repository: RepositoryInfo;
  score: QualityScore;
  metrics: RepositoryMetrics;
  timestamp: Date;
  duration: number;
}
```

### QualityScore

Quality scoring information.

```typescript
interface QualityScore {
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
```

### RepositoryInfo

GitHub repository information.

```typescript
interface RepositoryInfo {
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
```

## Configuration Types

### GitHubConfig

```typescript
interface GitHubConfig {
  token: string;
  apiVersion?: string;
}
```

### AnalysisConfig

```typescript
interface AnalysisConfig {
  minQualityScore?: number;
  maxReposPerBatch?: number;
  timeout?: number;
  cache?: CacheConfig;
}
```

### ScoringConfig

```typescript
interface ScoringConfig {
  weights?: ScoringWeights;
}

interface ScoringWeights {
  codeQuality?: number;
  documentation?: number;
  testing?: number;
  community?: number;
  security?: number;
  dependencies?: number;
}
```

## Metrics Types

### RepositoryMetrics

```typescript
interface RepositoryMetrics {
  codeQuality: CodeQualityMetrics;
  documentation: DocumentationMetrics;
  testing: TestingMetrics;
  community: CommunityMetrics;
  security: SecurityMetrics;
  dependencies: DependencyMetrics;
}
```

### CodeQualityMetrics

```typescript
interface CodeQualityMetrics {
  linesOfCode: number;
  complexity?: number;
  maintainabilityIndex?: number;
  technicalDebt?: string;
  codeSmells?: number;
}
```

### DocumentationMetrics

```typescript
interface DocumentationMetrics {
  hasReadme: boolean;
  readmeQuality: number;
  hasContributing: boolean;
  hasLicense: boolean;
  hasChangelog: boolean;
  apiDocumentation: boolean;
  inlineComments?: number;
}
```

### TestingMetrics

```typescript
interface TestingMetrics {
  hasTests: boolean;
  testCoverage?: number;
  testFramework?: string;
  hasCICD: boolean;
  ciStatus?: 'passing' | 'failing' | 'unknown';
}
```

### CommunityMetrics

```typescript
interface CommunityMetrics {
  contributors: number;
  issueResponseTime?: number;
  hasCodeOfConduct: boolean;
  hasIssueTemplates: boolean;
  hasPRTemplates: boolean;
  communityHealthScore: number;
}
```

### SecurityMetrics

```typescript
interface SecurityMetrics {
  hasSecurityPolicy: boolean;
  vulnerabilities: number;
  dependabotEnabled: boolean;
  secretsExposed: number;
  securityScore: number;
}
```

### DependencyMetrics

```typescript
interface DependencyMetrics {
  totalDependencies: number;
  outdatedDependencies: number;
  deprecatedDependencies: number;
  dependencyHealth: number;
}
```

## Batch Analysis Types

### BatchAnalysisResult

```typescript
interface BatchAnalysisResult {
  total: number;
  completed: number;
  failed: number;
  results: AnalysisResult[];
  errors: Array<{ repository: string; error: string }>;
}
```

## Utility Types

### AnalysisStatus

```typescript
type AnalysisStatus = 'pending' | 'in_progress' | 'completed' | 'failed';
```

### ParsedRepository

```typescript
interface ParsedRepository {
  owner: string;
  name: string;
}
```

## Usage Examples

### Basic Usage

```typescript
import { RepositoryAnalyzer, Config, AnalysisResult } from 'administrator';

const config: Config = {
  github: {
    token: process.env.GITHUB_TOKEN || '',
  },
};

const analyzer = new RepositoryAnalyzer(config);

async function analyze(): Promise<void> {
  const result: AnalysisResult = await analyzer.analyze('owner/repo');
  console.log(`Score: ${result.score.overall}`);
}
```

### With Custom Scoring

```typescript
import { Config, ScoringWeights } from 'administrator';

const customWeights: ScoringWeights = {
  codeQuality: 0.3,
  documentation: 0.3,
  testing: 0.2,
  community: 0.1,
  security: 0.1,
  dependencies: 0.0,
};

const config: Config = {
  github: { token: process.env.GITHUB_TOKEN || '' },
  scoring: { weights: customWeights },
};
```

### Type Guards

```typescript
function isHighQuality(result: AnalysisResult): boolean {
  return result.score.overall >= 80;
}

function hasTests(metrics: RepositoryMetrics): boolean {
  return metrics.testing.hasTests && (metrics.testing.testCoverage ?? 0) > 70;
}
```

## See Also

- [Getting Started Guide](../guides/getting-started.md)
- [Configuration Reference](../guides/configuration.md)
- [Examples](../examples/)
