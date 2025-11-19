/**
 * Tests for ReportGenerator
 */

import { ReportGenerator } from '../../src/reporters/ReportGenerator';
import { AnalysisResult } from '../../src/types';

describe('ReportGenerator', () => {
  const mockAnalysisResult: AnalysisResult = {
    repository: {
      owner: 'testowner',
      name: 'testrepo',
      url: 'https://github.com/testowner/testrepo',
      description: 'Test repository',
      language: 'TypeScript',
      stars: 100,
      forks: 20,
      openIssues: 5,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2024-01-01'),
      license: 'MIT',
    },
    score: {
      overall: 85,
      breakdown: {
        codeQuality: 80,
        documentation: 90,
        testing: 85,
        community: 75,
        security: 88,
        dependencies: 82,
      },
      grade: 'B',
      recommendations: ['Improve code quality', 'Add more tests'],
    },
    metrics: {
      codeQuality: {
        linesOfCode: 5000,
        maintainabilityIndex: 75,
      },
      documentation: {
        hasReadme: true,
        readmeQuality: 90,
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
        communityHealthScore: 75,
      },
      security: {
        hasSecurityPolicy: true,
        vulnerabilities: 0,
        dependabotEnabled: true,
        secretsExposed: 0,
        securityScore: 88,
      },
      dependencies: {
        totalDependencies: 20,
        outdatedDependencies: 2,
        deprecatedDependencies: 0,
        dependencyHealth: 82,
      },
    },
    timestamp: new Date('2024-01-15T10:00:00Z'),
    duration: 5000,
  };

  describe('generateMarkdown', () => {
    it('should generate valid markdown report', () => {
      const generator = new ReportGenerator();
      const markdown = generator.generateMarkdown(mockAnalysisResult);

      expect(markdown).toContain('# Repository Analysis Report');
      expect(markdown).toContain('testowner/testrepo');
      expect(markdown).toContain('85/100');
      expect(markdown).toContain('Grade: B');
    });

    it('should include all sections in markdown', () => {
      const generator = new ReportGenerator();
      const markdown = generator.generateMarkdown(mockAnalysisResult);

      expect(markdown).toContain('## Summary');
      expect(markdown).toContain('## Quality Score Breakdown');
      expect(markdown).toContain('## Detailed Metrics');
      expect(markdown).toContain('## 💡 Recommendations');
    });

    it('should include repository information', () => {
      const generator = new ReportGenerator();
      const markdown = generator.generateMarkdown(mockAnalysisResult);

      expect(markdown).toContain('TypeScript');
      expect(markdown).toContain('⭐ 100');
      expect(markdown).toContain('MIT');
    });

    it('should include metrics details', () => {
      const generator = new ReportGenerator();
      const markdown = generator.generateMarkdown(mockAnalysisResult);

      expect(markdown).toContain('📝 Documentation');
      expect(markdown).toContain('🧪 Testing');
      expect(markdown).toContain('👥 Community');
      expect(markdown).toContain('🔒 Security');
      expect(markdown).toContain('💻 Code Quality');
    });

    it('should include recommendations', () => {
      const generator = new ReportGenerator();
      const markdown = generator.generateMarkdown(mockAnalysisResult);

      expect(markdown).toContain('Improve code quality');
      expect(markdown).toContain('Add more tests');
    });

    it('should include progress bars for scores', () => {
      const generator = new ReportGenerator();
      const markdown = generator.generateMarkdown(mockAnalysisResult);

      expect(markdown).toContain('█');
      expect(markdown).toContain('░');
    });
  });

  describe('generateJson', () => {
    it('should generate valid JSON', () => {
      const generator = new ReportGenerator();
      const json = generator.generateJson(mockAnalysisResult);

      expect(() => JSON.parse(json)).not.toThrow();
    });

    it('should include all result data in JSON', () => {
      const generator = new ReportGenerator();
      const json = generator.generateJson(mockAnalysisResult);
      const parsed = JSON.parse(json);

      expect(parsed.repository).toBeDefined();
      expect(parsed.score).toBeDefined();
      expect(parsed.metrics).toBeDefined();
      expect(parsed.timestamp).toBeDefined();
      expect(parsed.duration).toBeDefined();
    });

    it('should format JSON with proper indentation', () => {
      const generator = new ReportGenerator();
      const json = generator.generateJson(mockAnalysisResult);

      expect(json).toContain('\n');
      expect(json).toContain('  ');
    });
  });

  describe('edge cases', () => {
    it('should handle missing optional fields', () => {
      const minimalResult: AnalysisResult = {
        ...mockAnalysisResult,
        repository: {
          ...mockAnalysisResult.repository,
          description: undefined,
          language: undefined,
          license: undefined,
        },
      };

      const generator = new ReportGenerator();
      const markdown = generator.generateMarkdown(minimalResult);

      expect(markdown).toContain('N/A');
      expect(markdown).toContain('None');
    });

    it('should handle zero duration', () => {
      const result = {
        ...mockAnalysisResult,
        duration: 0,
      };

      const generator = new ReportGenerator();
      const markdown = generator.generateMarkdown(result);

      expect(markdown).toContain('0s');
    });
  });
});
