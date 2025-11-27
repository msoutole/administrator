import { RepositoryAnalyzer } from '../../../src/analyzers/RepositoryAnalyzer';
import { GitHubClient } from '../../../src/utils/GitHubClient';
import { DocumentationAnalyzer } from '../../../src/analyzers/DocumentationAnalyzer';
import { SecurityAnalyzer } from '../../../src/analyzers/SecurityAnalyzer';
import { DependencyAnalyzer } from '../../../src/analyzers/DependencyAnalyzer';
import { CodeComplexityAnalyzer } from '../../../src/analyzers/CodeComplexityAnalyzer';
import { CommunityAnalyzer } from '../../../src/analyzers/CommunityAnalyzer';
import { ScoringEngine } from '../../../src/analyzers/ScoringEngine';

// Mock all dependencies
jest.mock('../../../src/utils/GitHubClient');
jest.mock('../../../src/analyzers/DocumentationAnalyzer');
jest.mock('../../../src/analyzers/SecurityAnalyzer');
jest.mock('../../../src/analyzers/DependencyAnalyzer');
jest.mock('../../../src/analyzers/CodeComplexityAnalyzer');
jest.mock('../../../src/analyzers/CommunityAnalyzer');
jest.mock('../../../src/analyzers/ScoringEngine');
jest.mock('../../../src/config/ConfigManager');

describe('RepositoryAnalyzer', () => {
  let analyzer: RepositoryAnalyzer;
  let mockGithubClient: jest.Mocked<GitHubClient>;
  let mockDocAnalyzer: jest.Mocked<DocumentationAnalyzer>;
  let mockSecurityAnalyzer: jest.Mocked<SecurityAnalyzer>;
  let mockDependencyAnalyzer: jest.Mocked<DependencyAnalyzer>;
  let mockComplexityAnalyzer: jest.Mocked<CodeComplexityAnalyzer>;
  let mockCommunityAnalyzer: jest.Mocked<CommunityAnalyzer>;
  let mockScoringEngine: jest.Mocked<ScoringEngine>;

  const mockRepoInfo = {
    owner: 'test-owner',
    name: 'test-repo',
    url: 'https://github.com/test-owner/test-repo',
    stars: 100,
    forks: 10,
    openIssues: 5,
    createdAt: new Date('2020-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockMetrics = {
    codeQuality: {
      linesOfCode: 5000,
      complexity: 5,
      maintainabilityIndex: 75,
    },
    documentation: {
      hasReadme: true,
      readmeQuality: 80,
      hasContributing: true,
      hasLicense: true,
      hasChangelog: false,
      apiDocumentation: true,
    },
    testing: {
      hasTests: true,
      hasCICD: true,
      ciStatus: 'unknown' as const,
    },
    community: {
      contributors: 15,
      hasCodeOfConduct: true,
      hasIssueTemplates: true,
      hasPRTemplates: true,
      communityHealthScore: 75,
    },
    security: {
      hasSecurityPolicy: true,
      vulnerabilities: 0,
      dependabotEnabled: true,
      secretsExposed: 0,
      securityScore: 85,
    },
    dependencies: {
      totalDependencies: 30,
      outdatedDependencies: 2,
      deprecatedDependencies: 0,
      dependencyHealth: 80,
    },
  };

  const mockScore = {
    overall: 80,
    breakdown: {
      codeQuality: 75,
      documentation: 85,
      testing: 80,
      community: 75,
      security: 85,
      dependencies: 80,
    },
    grade: 'A' as const,
    recommendations: ['Consider improving test coverage'],
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mocks
    mockGithubClient = GitHubClient as jest.Mocked<typeof GitHubClient>;
    mockDocAnalyzer = DocumentationAnalyzer as jest.Mocked<typeof DocumentationAnalyzer>;
    mockSecurityAnalyzer = SecurityAnalyzer as jest.Mocked<typeof SecurityAnalyzer>;
    mockDependencyAnalyzer = DependencyAnalyzer as jest.Mocked<typeof DependencyAnalyzer>;
    mockComplexityAnalyzer = CodeComplexityAnalyzer as jest.Mocked<typeof CodeComplexityAnalyzer>;
    mockCommunityAnalyzer = CommunityAnalyzer as jest.Mocked<typeof CommunityAnalyzer>;
    mockScoringEngine = ScoringEngine as jest.Mocked<typeof ScoringEngine>;

    // Mock constructor implementations
    mockGithubClient.prototype.getRepositoryInfo = jest
      .fn()
      .mockResolvedValue(mockRepoInfo);
    mockGithubClient.prototype.getLanguages = jest.fn().mockResolvedValue({
      TypeScript: 3000,
      JavaScript: 2000,
    });
    mockGithubClient.prototype.getContributors = jest.fn().mockResolvedValue(15);

    mockDocAnalyzer.prototype.analyze = jest.fn().mockResolvedValue(mockMetrics.documentation);
    mockSecurityAnalyzer.prototype.analyze = jest
      .fn()
      .mockResolvedValue(mockMetrics.security);
    mockDependencyAnalyzer.prototype.analyze = jest
      .fn()
      .mockResolvedValue(mockMetrics.dependencies);
    mockComplexityAnalyzer.prototype.analyze = jest
      .fn()
      .mockResolvedValue(mockMetrics.codeQuality);
    mockCommunityAnalyzer.prototype.analyze = jest.fn().mockResolvedValue(mockMetrics.community);

    mockScoringEngine.prototype.calculateScore = jest.fn().mockReturnValue(mockScore);

    // Create analyzer instance
    analyzer = new RepositoryAnalyzer({
      github: { token: 'test-token' },
    });
  });

  describe('analyze', () => {
    it('should successfully analyze a repository', async () => {
      const result = await analyzer.analyze('test-owner/test-repo');

      expect(result).toBeDefined();
      expect(result.repository).toEqual(mockRepoInfo);
      expect(result.score).toEqual(mockScore);
      expect(result.metrics).toBeDefined();
      expect(result.timestamp).toBeInstanceOf(Date);
      expect(result.duration).toBeGreaterThanOrEqual(0);
    });

    it('should fetch repository info correctly', async () => {
      await analyzer.analyze('test-owner/test-repo');

      expect(mockGithubClient.prototype.getRepositoryInfo).toHaveBeenCalledWith(
        'test-owner/test-repo'
      );
    });

    it('should run all analyzers in parallel', async () => {
      const startTime = Date.now();
      await analyzer.analyze('test-owner/test-repo');
      const duration = Date.now() - startTime;

      // All should be called
      expect(mockDocAnalyzer.prototype.analyze).toHaveBeenCalled();
      expect(mockSecurityAnalyzer.prototype.analyze).toHaveBeenCalled();
      expect(mockDependencyAnalyzer.prototype.analyze).toHaveBeenCalled();
      expect(mockComplexityAnalyzer.prototype.analyze).toHaveBeenCalled();
      expect(mockCommunityAnalyzer.prototype.analyze).toHaveBeenCalled();

      // Duration should be relatively short (parallelized)
      expect(duration).toBeLessThan(5000);
    });

    it('should include all metric categories in result', async () => {
      const result = await analyzer.analyze('test-owner/test-repo');

      expect(result.metrics).toHaveProperty('codeQuality');
      expect(result.metrics).toHaveProperty('documentation');
      expect(result.metrics).toHaveProperty('testing');
      expect(result.metrics).toHaveProperty('community');
      expect(result.metrics).toHaveProperty('security');
      expect(result.metrics).toHaveProperty('dependencies');
    });

    it('should handle analysis errors gracefully', async () => {
      const error = new Error('API Error');
      mockGithubClient.prototype.getRepositoryInfo = jest.fn().mockRejectedValue(error);

      await expect(analyzer.analyze('test-owner/test-repo')).rejects.toThrow(
        /Analysis failed for test-owner\/test-repo/
      );
    });

    it('should calculate duration correctly', async () => {
      const result = await analyzer.analyze('test-owner/test-repo');

      expect(result.duration).toBeGreaterThanOrEqual(0);
      expect(typeof result.duration).toBe('number');
    });
  });

  describe('batchAnalyze', () => {
    it('should analyze multiple repositories', async () => {
      const repos = ['owner1/repo1', 'owner2/repo2', 'owner3/repo3'];

      const result = await analyzer.batchAnalyze(repos);

      expect(result.total).toBe(3);
      expect(result.completed).toBeGreaterThanOrEqual(0);
      expect(result.results).toBeInstanceOf(Array);
      expect(result.errors).toBeInstanceOf(Array);
    });

    it('should respect maxReposPerBatch configuration', async () => {
      analyzer = new RepositoryAnalyzer({
        github: { token: 'test-token' },
        analysis: { maxReposPerBatch: 2 },
      });

      const repos = ['owner1/repo1', 'owner2/repo2', 'owner3/repo3', 'owner4/repo4'];

      const result = await analyzer.batchAnalyze(repos);

      expect(result.total).toBe(2); // Should only analyze first 2
    });

    it('should process with configurable concurrency', async () => {
      const repos = ['owner1/repo1', 'owner2/repo2', 'owner3/repo3'];

      const result = await analyzer.batchAnalyze(repos);

      expect(result.results).toBeDefined();
      expect(result.errors).toBeDefined();
    });

    it('should collect errors from failed analyses', async () => {
      mockGithubClient.prototype.getRepositoryInfo = jest
        .fn()
        .mockRejectedValueOnce(new Error('Not found'));

      const repos = ['invalid/repo', 'owner/repo'];

      const result = await analyzer.batchAnalyze(repos);

      expect(result.failed).toBeGreaterThan(0);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Private methods', () => {
    it('should detect test files', async () => {
      mockGithubClient.prototype.hasFile = jest
        .fn()
        .mockImplementationOnce(() => Promise.resolve(true));

      // Access private method through instance
      const hasTests = await (analyzer as any).hasTests('owner', 'repo');

      expect(hasTests).toBe(true);
    });

    it('should detect CI/CD platforms', async () => {
      mockGithubClient.prototype.hasFile = jest
        .fn()
        .mockImplementationOnce(() => Promise.resolve(true));

      const hasCICD = await (analyzer as any).hasCICD('owner', 'repo');

      expect(hasCICD).toBe(true);
    });

    it('should detect multiple CI/CD platforms', async () => {
      let callCount = 0;
      mockGithubClient.prototype.hasFile = jest.fn(async () => {
        callCount++;
        return callCount === 3; // Return true on 3rd call
      });

      const hasCICD = await (analyzer as any).hasCICD('owner', 'repo');

      expect(hasCICD).toBe(true);
      expect(mockGithubClient.prototype.hasFile).toHaveBeenCalled();
    });
  });
});
