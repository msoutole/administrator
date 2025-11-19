/**
 * Tests for ScoringEngine
 */

import { ScoringEngine } from '../../src/analyzers/ScoringEngine';
import { RepositoryMetrics } from '../../src/types';

describe('ScoringEngine', () => {
  const mockMetrics: RepositoryMetrics = {
    codeQuality: {
      linesOfCode: 5000,
      maintainabilityIndex: 75,
    },
    documentation: {
      hasReadme: true,
      readmeQuality: 80,
      hasContributing: true,
      hasLicense: true,
      hasChangelog: true,
      apiDocumentation: true,
    },
    testing: {
      hasTests: true,
      testCoverage: 85,
      hasCICD: true,
      ciStatus: 'passing',
    },
    community: {
      contributors: 10,
      hasCodeOfConduct: true,
      hasIssueTemplates: true,
      hasPRTemplates: true,
      communityHealthScore: 80,
    },
    security: {
      hasSecurityPolicy: true,
      vulnerabilities: 0,
      dependabotEnabled: true,
      secretsExposed: 0,
      securityScore: 90,
    },
    dependencies: {
      totalDependencies: 20,
      outdatedDependencies: 2,
      deprecatedDependencies: 0,
      dependencyHealth: 85,
    },
  };

  describe('calculateScore', () => {
    it('should calculate overall score with default weights', () => {
      const engine = new ScoringEngine();
      const result = engine.calculateScore(mockMetrics);

      expect(result.overall).toBeGreaterThanOrEqual(0);
      expect(result.overall).toBeLessThanOrEqual(100);
      expect(result.grade).toBeDefined();
      expect(result.breakdown).toBeDefined();
      expect(result.recommendations).toBeDefined();
    });

    it('should calculate score breakdown for all dimensions', () => {
      const engine = new ScoringEngine();
      const result = engine.calculateScore(mockMetrics);

      expect(result.breakdown.codeQuality).toBeGreaterThanOrEqual(0);
      expect(result.breakdown.documentation).toBeGreaterThanOrEqual(0);
      expect(result.breakdown.testing).toBeGreaterThanOrEqual(0);
      expect(result.breakdown.community).toBeGreaterThanOrEqual(0);
      expect(result.breakdown.security).toBeGreaterThanOrEqual(0);
      expect(result.breakdown.dependencies).toBeGreaterThanOrEqual(0);
    });

    it('should assign correct grade based on score', () => {
      const engine = new ScoringEngine();
      const result = engine.calculateScore(mockMetrics);

      expect(['A', 'B', 'C', 'D', 'F']).toContain(result.grade);
    });

    it('should use custom weights when provided', () => {
      const customWeights = {
        codeQuality: 0.4,
        documentation: 0.3,
        testing: 0.2,
        community: 0.05,
        security: 0.05,
        dependencies: 0.0,
      };

      const engine = new ScoringEngine(customWeights);
      const result = engine.calculateScore(mockMetrics);

      expect(result.overall).toBeGreaterThanOrEqual(0);
      expect(result.overall).toBeLessThanOrEqual(100);
    });

    it('should generate recommendations for low scores', () => {
      const lowScoreMetrics: RepositoryMetrics = {
        ...mockMetrics,
        documentation: {
          hasReadme: false,
          readmeQuality: 0,
          hasContributing: false,
          hasLicense: false,
          hasChangelog: false,
          apiDocumentation: false,
        },
      };

      const engine = new ScoringEngine();
      const result = engine.calculateScore(lowScoreMetrics);

      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.recommendations.some((r) => r.includes('documentation'))).toBe(true);
    });

    it('should handle edge case with all zeros', () => {
      const zeroMetrics: RepositoryMetrics = {
        codeQuality: {
          linesOfCode: 0,
        },
        documentation: {
          hasReadme: false,
          readmeQuality: 0,
          hasContributing: false,
          hasLicense: false,
          hasChangelog: false,
          apiDocumentation: false,
        },
        testing: {
          hasTests: false,
          hasCICD: false,
          ciStatus: 'unknown',
        },
        community: {
          contributors: 0,
          hasCodeOfConduct: false,
          hasIssueTemplates: false,
          hasPRTemplates: false,
          communityHealthScore: 0,
        },
        security: {
          hasSecurityPolicy: false,
          vulnerabilities: 0,
          dependabotEnabled: false,
          secretsExposed: 0,
          securityScore: 0,
        },
        dependencies: {
          totalDependencies: 0,
          outdatedDependencies: 0,
          deprecatedDependencies: 0,
          dependencyHealth: 0,
        },
      };

      const engine = new ScoringEngine();
      const result = engine.calculateScore(zeroMetrics);

      expect(result.overall).toBeGreaterThanOrEqual(0);
      expect(result.grade).toBe('F');
    });

    it('should calculate documentation score correctly', () => {
      const engine = new ScoringEngine();
      const result = engine.calculateScore(mockMetrics);

      expect(result.breakdown.documentation).toBeGreaterThan(80);
    });

    it('should calculate testing score correctly', () => {
      const engine = new ScoringEngine();
      const result = engine.calculateScore(mockMetrics);

      expect(result.breakdown.testing).toBeGreaterThan(80);
    });

    it('should penalize security score for vulnerabilities', () => {
      const vulnerableMetrics = {
        ...mockMetrics,
        security: {
          hasSecurityPolicy: false,
          vulnerabilities: 5,
          dependabotEnabled: false,
          secretsExposed: 2,
          securityScore: 50,
        },
      };

      const engine = new ScoringEngine();
      const result = engine.calculateScore(vulnerableMetrics);

      expect(result.breakdown.security).toBeLessThan(50);
    });
  });
});
