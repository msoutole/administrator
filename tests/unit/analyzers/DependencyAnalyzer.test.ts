import { DependencyAnalyzer } from '../../../src/analyzers/DependencyAnalyzer';
import { GitHubClient } from '../../../src/utils/GitHubClient';

jest.mock('../../../src/utils/GitHubClient');

describe('DependencyAnalyzer', () => {
  let analyzer: DependencyAnalyzer;
  let mockGithubClient: jest.Mocked<GitHubClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGithubClient = new GitHubClient('test-token') as jest.Mocked<GitHubClient>;
    analyzer = new DependencyAnalyzer(mockGithubClient);
  });

  describe('analyze', () => {
    it('should return dependency metrics', async () => {
      mockGithubClient.getFileContent = jest.fn().mockResolvedValue(
        JSON.stringify({
          dependencies: {
            express: '4.17.1',
            lodash: '4.17.21',
          },
          devDependencies: {
            jest: '26.0.0',
          },
        })
      );

      const metrics = await analyzer.analyze('owner', 'repo');

      expect(metrics).toBeDefined();
      expect(metrics).toHaveProperty('totalDependencies');
      expect(metrics).toHaveProperty('outdatedDependencies');
      expect(metrics).toHaveProperty('deprecatedDependencies');
      expect(metrics).toHaveProperty('dependencyHealth');
    });

    it('should count all dependency types', async () => {
      mockGithubClient.getFileContent = jest.fn().mockResolvedValue(
        JSON.stringify({
          dependencies: {
            express: '4.17.1',
            'axios': '0.21.0',
          },
          devDependencies: {
            jest: '26.0.0',
            typescript: '4.0.0',
          },
          peerDependencies: {
            react: '16.0.0',
          },
          optionalDependencies: {
            'optional-pkg': '1.0.0',
          },
        })
      );

      const metrics = await analyzer.analyze('owner', 'repo');

      expect(metrics.totalDependencies).toBe(5);
    });

    it('should detect outdated dependencies', async () => {
      mockGithubClient.getFileContent = jest.fn().mockResolvedValue(
        JSON.stringify({
          dependencies: {
            react: '15.0.0', // Outdated
            express: '4.17.1',
          },
          devDependencies: {
            typescript: '3.0.0', // Outdated
          },
        })
      );

      const metrics = await analyzer.analyze('owner', 'repo');

      expect(metrics.outdatedDependencies).toBeGreaterThan(0);
    });

    it('should detect deprecated dependencies', async () => {
      mockGithubClient.getFileContent = jest.fn().mockResolvedValue(
        JSON.stringify({
          dependencies: {
            'node-uuid': '1.4.8', // Deprecated
            express: '4.17.1',
          },
        })
      );

      const metrics = await analyzer.analyze('owner', 'repo');

      expect(metrics.deprecatedDependencies).toBeGreaterThan(0);
    });

    it('should calculate dependency health score', async () => {
      mockGithubClient.getFileContent = jest.fn().mockResolvedValue(
        JSON.stringify({
          dependencies: {
            express: '4.17.1',
            axios: '0.21.0',
          },
        })
      );

      const metrics = await analyzer.analyze('owner', 'repo');

      expect(metrics.dependencyHealth).toBeGreaterThanOrEqual(0);
      expect(metrics.dependencyHealth).toBeLessThanOrEqual(100);
    });

    it('should give high health score for clean dependencies', async () => {
      mockGithubClient.getFileContent = jest.fn().mockResolvedValue(
        JSON.stringify({
          dependencies: {
            express: '4.18.2',
            axios: '1.4.0',
          },
          devDependencies: {
            typescript: '5.0.0',
          },
        })
      );

      const metrics = await analyzer.analyze('owner', 'repo');

      expect(metrics.dependencyHealth).toBeGreaterThan(70);
    });

    it('should penalize for outdated dependencies', async () => {
      mockGithubClient.getFileContent = jest.fn().mockResolvedValue(
        JSON.stringify({
          dependencies: {
            'react': '16.0.0', // Outdated
            'angular': '8.0.0', // Outdated
            'vue': '2.0.0', // Outdated
            'typescript': '3.0.0', // Outdated
          },
        })
      );

      const metrics = await analyzer.analyze('owner', 'repo');

      expect(metrics.outdatedDependencies).toBeGreaterThan(0);
      expect(metrics.dependencyHealth).toBeLessThan(80);
    });

    it('should heavily penalize for deprecated packages', async () => {
      mockGithubClient.getFileContent = jest.fn().mockResolvedValue(
        JSON.stringify({
          dependencies: {
            'node-uuid': '1.4.8',
            'bower': '1.8.0',
            'gulp-util': '3.0.0',
          },
        })
      );

      const metrics = await analyzer.analyze('owner', 'repo');

      expect(metrics.deprecatedDependencies).toBeGreaterThan(0);
      expect(metrics.dependencyHealth).toBeLessThan(60);
    });

    it('should handle missing package.json gracefully', async () => {
      mockGithubClient.getFileContent = jest.fn().mockResolvedValue(null);

      const metrics = await analyzer.analyze('owner', 'repo');

      expect(metrics.totalDependencies).toBe(0);
      expect(metrics.outdatedDependencies).toBe(0);
      expect(metrics.deprecatedDependencies).toBe(0);
      expect(metrics.dependencyHealth).toBe(100);
    });

    it('should handle malformed package.json gracefully', async () => {
      mockGithubClient.getFileContent = jest.fn().mockResolvedValue('invalid json');

      const metrics = await analyzer.analyze('owner', 'repo');

      expect(metrics.totalDependencies).toBe(0);
      expect(metrics.dependencyHealth).toBe(100);
    });
  });

  describe('Health score calculation', () => {
    it('should return full score for repos with no dependencies', async () => {
      mockGithubClient.getFileContent = jest.fn().mockResolvedValue(
        JSON.stringify({
          dependencies: {},
        })
      );

      const metrics = await analyzer.analyze('owner', 'repo');

      expect(metrics.dependencyHealth).toBe(100);
    });

    it('should give bonus for manageable dependency count', async () => {
      mockGithubClient.getFileContent = jest.fn().mockResolvedValue(
        JSON.stringify({
          dependencies: {
            express: '4.18.2',
            axios: '1.4.0',
            react: '18.0.0',
            'react-dom': '18.0.0',
            lodash: '4.17.21',
          },
        })
      );

      const metrics = await analyzer.analyze('owner', 'repo');

      expect(metrics.dependencyHealth).toBeGreaterThan(70);
    });

    it('should penalize for excessive dependencies', async () => {
      const deps: Record<string, string> = {};
      for (let i = 0; i < 150; i++) {
        deps[`package-${i}`] = '1.0.0';
      }

      mockGithubClient.getFileContent = jest.fn().mockResolvedValue(
        JSON.stringify({
          dependencies: deps,
        })
      );

      const metrics = await analyzer.analyze('owner', 'repo');

      expect(metrics.dependencyHealth).toBeLessThan(90);
    });

    it('should consider mixed outdated and deprecated packages', async () => {
      mockGithubClient.getFileContent = jest.fn().mockResolvedValue(
        JSON.stringify({
          dependencies: {
            'react': '16.0.0', // Outdated
            'node-uuid': '1.4.8', // Deprecated
            'express': '4.18.2', // Current
            'axios': '0.21.0', // Outdated
          },
        })
      );

      const metrics = await analyzer.analyze('owner', 'repo');

      expect(metrics.outdatedDependencies).toBeGreaterThan(0);
      expect(metrics.deprecatedDependencies).toBeGreaterThan(0);
      expect(metrics.dependencyHealth).toBeLessThan(80);
    });
  });

  describe('Dependency type handling', () => {
    it('should check both production and dev dependencies for outdated', async () => {
      mockGithubClient.getFileContent = jest.fn().mockResolvedValue(
        JSON.stringify({
          dependencies: {
            'react': '15.0.0', // Outdated prod dependency
          },
          devDependencies: {
            'jest': '20.0.0', // Outdated dev dependency
          },
        })
      );

      const metrics = await analyzer.analyze('owner', 'repo');

      expect(metrics.outdatedDependencies).toBe(2);
    });

    it('should check both dependency types for deprecated', async () => {
      mockGithubClient.getFileContent = jest.fn().mockResolvedValue(
        JSON.stringify({
          dependencies: {
            'node-uuid': '1.4.8', // Deprecated prod dependency
          },
          devDependencies: {
            'gulp-util': '3.0.0', // Deprecated dev dependency
          },
        })
      );

      const metrics = await analyzer.analyze('owner', 'repo');

      expect(metrics.deprecatedDependencies).toBe(2);
    });
  });
});
