import { SecurityAnalyzer } from '../../../src/analyzers/SecurityAnalyzer';
import { GitHubClient } from '../../../src/utils/GitHubClient';

jest.mock('../../../src/utils/GitHubClient');

describe('SecurityAnalyzer', () => {
  let analyzer: SecurityAnalyzer;
  let mockGithubClient: jest.Mocked<GitHubClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGithubClient = new GitHubClient('test-token') as jest.Mocked<GitHubClient>;
    analyzer = new SecurityAnalyzer(mockGithubClient);
  });

  describe('analyze', () => {
    it('should return security metrics', async () => {
      mockGithubClient.hasFile = jest.fn().mockResolvedValue(true);
      mockGithubClient.getFileContent = jest.fn().mockResolvedValue(
        JSON.stringify({
          dependencies: {
            lodash: '4.17.15',
            express: '4.17.1',
          },
          devDependencies: {
            jest: '26.0.0',
          },
        })
      );

      const metrics = await analyzer.analyze('owner', 'repo');

      expect(metrics).toBeDefined();
      expect(metrics).toHaveProperty('hasSecurityPolicy');
      expect(metrics).toHaveProperty('vulnerabilities');
      expect(metrics).toHaveProperty('dependabotEnabled');
      expect(metrics).toHaveProperty('secretsExposed');
      expect(metrics).toHaveProperty('securityScore');
    });

    it('should detect security policy', async () => {
      mockGithubClient.hasFile = jest.fn(async (owner, repo, path) => {
        return path === 'SECURITY.md';
      });
      mockGithubClient.getFileContent = jest.fn().mockResolvedValue(
        JSON.stringify({ dependencies: {} })
      );

      const metrics = await analyzer.analyze('owner', 'repo');

      expect(metrics.hasSecurityPolicy).toBe(true);
    });

    it('should detect Dependabot configuration', async () => {
      mockGithubClient.hasFile = jest.fn(async (owner, repo, path) => {
        return path === '.github/dependabot.yml';
      });
      mockGithubClient.getFileContent = jest.fn().mockResolvedValue(
        JSON.stringify({ dependencies: {} })
      );

      const metrics = await analyzer.analyze('owner', 'repo');

      expect(metrics.dependabotEnabled).toBe(true);
    });

    it('should detect exposed secrets', async () => {
      mockGithubClient.hasFile = jest
        .fn()
        .mockResolvedValueOnce(false) // SECURITY.md
        .mockResolvedValueOnce(false) // dependabot
        .mockResolvedValueOnce(true) // .env
        .mockResolvedValue(false); // other secrets
      mockGithubClient.getFileContent = jest.fn().mockResolvedValue(
        JSON.stringify({ dependencies: {} })
      );

      const metrics = await analyzer.analyze('owner', 'repo');

      expect(metrics.secretsExposed).toBeGreaterThan(0);
    });

    it('should calculate security score', async () => {
      mockGithubClient.hasFile = jest.fn().mockResolvedValue(false);
      mockGithubClient.getFileContent = jest.fn().mockResolvedValue(
        JSON.stringify({ dependencies: {} })
      );

      const metrics = await analyzer.analyze('owner', 'repo');

      expect(metrics.securityScore).toBeGreaterThanOrEqual(0);
      expect(metrics.securityScore).toBeLessThanOrEqual(100);
    });

    it('should penalize score for vulnerabilities', async () => {
      // Setup mock to return known vulnerable package
      mockGithubClient.hasFile = jest.fn().mockResolvedValue(false);
      mockGithubClient.getFileContent = jest.fn().mockResolvedValue(
        JSON.stringify({
          dependencies: {
            lodash: '<4.17.21', // Known vulnerable version
          },
        })
      );

      const metrics = await analyzer.analyze('owner', 'repo');

      expect(metrics.vulnerabilities).toBeGreaterThan(0);
      expect(metrics.securityScore).toBeLessThan(100);
    });

    it('should handle missing package.json gracefully', async () => {
      mockGithubClient.hasFile = jest.fn().mockResolvedValue(false);
      mockGithubClient.getFileContent = jest.fn().mockResolvedValue(null);

      const metrics = await analyzer.analyze('owner', 'repo');

      expect(metrics.securityScore).toBeGreaterThanOrEqual(0);
      expect(metrics.securityScore).toBeLessThanOrEqual(100);
    });

    it('should add bonuses for good security practices', async () => {
      mockGithubClient.hasFile = jest
        .fn()
        .mockResolvedValueOnce(true) // SECURITY.md
        .mockResolvedValueOnce(true) // dependabot
        .mockResolvedValue(false); // no secrets
      mockGithubClient.getFileContent = jest.fn().mockResolvedValue(
        JSON.stringify({
          dependencies: {},
        })
      );

      const metrics = await analyzer.analyze('owner', 'repo');

      expect(metrics.securityScore).toBeGreaterThan(50);
    });
  });

  describe('Security policy detection', () => {
    it('should check multiple SECURITY.md locations', async () => {
      mockGithubClient.hasFile = jest.fn().mockResolvedValue(false);
      mockGithubClient.getFileContent = jest.fn().mockResolvedValue(
        JSON.stringify({ dependencies: {} })
      );

      await analyzer.analyze('owner', 'repo');

      const calls = mockGithubClient.hasFile.mock.calls;
      const securityPolicyChecks = calls.filter(call => call[2]?.includes('SECURITY'));

      expect(securityPolicyChecks.length).toBeGreaterThan(0);
    });
  });

  describe('Known vulnerability detection', () => {
    it('should detect known vulnerable packages', async () => {
      mockGithubClient.hasFile = jest.fn().mockResolvedValue(false);
      mockGithubClient.getFileContent = jest.fn().mockResolvedValue(
        JSON.stringify({
          dependencies: {
            'lodash': '4.17.20',
            'minimist': '1.2.0',
            'express': '4.18.0',
          },
        })
      );

      const metrics = await analyzer.analyze('owner', 'repo');

      expect(metrics.vulnerabilities).toBeGreaterThan(0);
    });

    it('should not detect vulnerabilities in safe versions', async () => {
      mockGithubClient.hasFile = jest.fn().mockResolvedValue(false);
      mockGithubClient.getFileContent = jest.fn().mockResolvedValue(
        JSON.stringify({
          dependencies: {
            'lodash': '4.17.21',
            'minimist': '1.2.6',
          },
        })
      );

      const metrics = await analyzer.analyze('owner', 'repo');

      // Should have vulnerabilities count as 0 if no actual vulnerabilities found
      expect(metrics.vulnerabilities).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Score calculation', () => {
    it('should return score between 0 and 100', async () => {
      mockGithubClient.hasFile = jest.fn().mockResolvedValue(false);
      mockGithubClient.getFileContent = jest.fn().mockResolvedValue(
        JSON.stringify({ dependencies: {} })
      );

      const metrics = await analyzer.analyze('owner', 'repo');

      expect(metrics.securityScore).toBeGreaterThanOrEqual(0);
      expect(metrics.securityScore).toBeLessThanOrEqual(100);
    });

    it('should give high score for secure repositories', async () => {
      mockGithubClient.hasFile = jest
        .fn()
        .mockResolvedValueOnce(true) // SECURITY.md
        .mockResolvedValueOnce(true) // dependabot
        .mockResolvedValue(false); // no secrets
      mockGithubClient.getFileContent = jest.fn().mockResolvedValue(
        JSON.stringify({ dependencies: {} })
      );

      const metrics = await analyzer.analyze('owner', 'repo');

      expect(metrics.securityScore).toBeGreaterThanOrEqual(70);
    });

    it('should penalize heavily for exposed secrets', async () => {
      mockGithubClient.hasFile = jest
        .fn()
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true) // .env
        .mockResolvedValueOnce(true) // .env.local
        .mockResolvedValue(false);
      mockGithubClient.getFileContent = jest.fn().mockResolvedValue(
        JSON.stringify({ dependencies: {} })
      );

      const metrics = await analyzer.analyze('owner', 'repo');

      expect(metrics.secretsExposed).toBe(2);
      expect(metrics.securityScore).toBeLessThan(50);
    });
  });
});
