/**
 * SARIF (Static Analysis Results Interchange Format) report generator
 */

import { AnalysisResult, BatchAnalysisResult } from '../types';

export interface SARIFReport {
  version: string;
  $schema: string;
  runs: Array<{
    tool: {
      driver: {
        name: string;
        version: string;
        informationUri: string;
      };
    };
    results: Array<{
      ruleId: string;
      level: 'note' | 'warning' | 'error';
      message: { text: string };
      locations: Array<{
        physicalLocation: {
          artifactLocation: { uri: string };
        };
      }>;
    }>;
  }>;
}

export class SARIFReporter {
  /**
   * Generate SARIF report from single analysis
   */
  generateSingleReport(result: AnalysisResult): string {
    const results = this.generateResultsFromAnalysis(result);

    const sarifReport: SARIFReport = {
      version: '2.1.0',
      $schema:
        'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
      runs: [
        {
          tool: {
            driver: {
              name: 'Administrator',
              version: '1.0.0',
              informationUri: 'https://github.com/msoutole/Administrator',
            },
          },
          results,
        },
      ],
    };

    return JSON.stringify(sarifReport, null, 2);
  }

  /**
   * Generate SARIF report from batch analysis
   */
  generateBatchReport(batchResult: BatchAnalysisResult): string {
    const results: SARIFReport['runs'][0]['results'] = [];

    for (const analysis of batchResult.results) {
      const analysisResults = this.generateResultsFromAnalysis(analysis);
      results.push(...analysisResults);
    }

    // Add errors as results
    for (const error of batchResult.errors) {
      results.push({
        ruleId: 'ANALYSIS_FAILED',
        level: 'error',
        message: {
          text: `Analysis failed for ${error.repository}: ${error.error}`,
        },
        locations: [
          {
            physicalLocation: {
              artifactLocation: { uri: error.repository },
            },
          },
        ],
      });
    }

    const sarifReport: SARIFReport = {
      version: '2.1.0',
      $schema:
        'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
      runs: [
        {
          tool: {
            driver: {
              name: 'Administrator',
              version: '1.0.0',
              informationUri: 'https://github.com/msoutole/Administrator',
            },
          },
          results,
        },
      ],
    };

    return JSON.stringify(sarifReport, null, 2);
  }

  /**
   * Generate SARIF results from analysis
   */
  private generateResultsFromAnalysis(result: AnalysisResult): SARIFReport['runs'][0]['results'] {
    const results: SARIFReport['runs'][0]['results'] = [];
    const uri = `${result.repository.owner}/${result.repository.name}`;

    // Add issues based on scores and metrics
    const issues = this.identifyIssues(result);

    for (const issue of issues) {
      results.push({
        ruleId: issue.ruleId,
        level: issue.severity,
        message: { text: issue.message },
        locations: [
          {
            physicalLocation: {
              artifactLocation: { uri },
            },
          },
        ],
      });
    }

    return results;
  }

  /**
   * Identify issues from analysis results
   */
  private identifyIssues(
    result: AnalysisResult
  ): Array<{
    ruleId: string;
    severity: 'note' | 'warning' | 'error';
    message: string;
  }> {
    const issues: Array<{
      ruleId: string;
      severity: 'note' | 'warning' | 'error';
      message: string;
    }> = [];

    // Code Quality Issues
    if (result.score.breakdown.codeQuality < 50) {
      issues.push({
        ruleId: 'LOW_CODE_QUALITY',
        severity: 'error',
        message: `Code quality score is low (${result.score.breakdown.codeQuality}/100)`,
      });
    } else if (result.score.breakdown.codeQuality < 70) {
      issues.push({
        ruleId: 'MEDIUM_CODE_QUALITY',
        severity: 'warning',
        message: `Code quality score could be improved (${result.score.breakdown.codeQuality}/100)`,
      });
    }

    // Documentation Issues
    if (!result.metrics.documentation.hasReadme) {
      issues.push({
        ruleId: 'MISSING_README',
        severity: 'warning',
        message: 'Repository is missing a README file',
      });
    }

    if (!result.metrics.documentation.hasLicense) {
      issues.push({
        ruleId: 'MISSING_LICENSE',
        severity: 'warning',
        message: 'Repository is missing a LICENSE file',
      });
    }

    // Testing Issues
    if (!result.metrics.testing.hasTests) {
      issues.push({
        ruleId: 'NO_TESTS',
        severity: 'warning',
        message: 'Repository has no tests',
      });
    }

    if (!result.metrics.testing.hasCICD) {
      issues.push({
        ruleId: 'NO_CI_CD',
        severity: 'warning',
        message: 'Repository does not have CI/CD configured',
      });
    }

    // Security Issues
    if (result.metrics.security.vulnerabilities > 0) {
      issues.push({
        ruleId: 'KNOWN_VULNERABILITIES',
        severity: 'error',
        message: `Repository has ${result.metrics.security.vulnerabilities} known vulnerabilities`,
      });
    }

    if (!result.metrics.security.hasSecurityPolicy) {
      issues.push({
        ruleId: 'MISSING_SECURITY_POLICY',
        severity: 'note',
        message: 'Repository does not have a SECURITY.md policy file',
      });
    }

    if (result.metrics.security.secretsExposed > 0) {
      issues.push({
        ruleId: 'EXPOSED_SECRETS',
        severity: 'error',
        message: `Repository has ${result.metrics.security.secretsExposed} potential exposed secrets`,
      });
    }

    if (!result.metrics.security.dependabotEnabled) {
      issues.push({
        ruleId: 'DEPENDABOT_DISABLED',
        severity: 'warning',
        message: 'Dependabot is not enabled for automated dependency updates',
      });
    }

    // Dependency Issues
    if (result.metrics.dependencies.outdatedDependencies > 0) {
      issues.push({
        ruleId: 'OUTDATED_DEPENDENCIES',
        severity: 'warning',
        message: `Repository has ${result.metrics.dependencies.outdatedDependencies} outdated dependencies`,
      });
    }

    if (result.metrics.dependencies.deprecatedDependencies > 0) {
      issues.push({
        ruleId: 'DEPRECATED_DEPENDENCIES',
        severity: 'error',
        message: `Repository has ${result.metrics.dependencies.deprecatedDependencies} deprecated dependencies`,
      });
    }

    // Community Issues
    if (!result.metrics.community.hasCodeOfConduct) {
      issues.push({
        ruleId: 'MISSING_CODE_OF_CONDUCT',
        severity: 'note',
        message: 'Repository does not have a CODE_OF_CONDUCT.md file',
      });
    }

    if (result.metrics.community.contributors < 5) {
      issues.push({
        ruleId: 'LOW_CONTRIBUTOR_COUNT',
        severity: 'note',
        message: `Repository has very few contributors (${result.metrics.community.contributors})`,
      });
    }

    // Score-based recommendations
    if (result.score.overall < 50) {
      issues.push({
        ruleId: 'LOW_OVERALL_SCORE',
        severity: 'error',
        message: `Overall repository quality score is low (${result.score.overall}/100)`,
      });
    } else if (result.score.overall < 70) {
      issues.push({
        ruleId: 'MEDIUM_OVERALL_SCORE',
        severity: 'warning',
        message: `Overall repository quality score could be improved (${result.score.overall}/100)`,
      });
    }

    return issues;
  }
}

export default SARIFReporter;
