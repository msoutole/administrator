/**
 * CSV report generator
 */

import { AnalysisResult, BatchAnalysisResult } from '../types';

export class CSVReporter {
  /**
   * Generate CSV report from single analysis
   */
  generateSingleReport(result: AnalysisResult): string {
    const lines: string[] = [];

    // Header
    lines.push('Repository Analysis Report - CSV Format');
    lines.push('');

    // Repository Info
    lines.push('Repository Information');
    lines.push(this.escapeCsv(`Owner,${result.repository.owner}`));
    lines.push(this.escapeCsv(`Name,${result.repository.name}`));
    lines.push(this.escapeCsv(`URL,${result.repository.url}`));
    lines.push(this.escapeCsv(`Language,${result.repository.language || 'Unknown'}`));
    lines.push(this.escapeCsv(`Stars,${result.repository.stars}`));
    lines.push(this.escapeCsv(`Forks,${result.repository.forks}`));
    lines.push(this.escapeCsv(`Open Issues,${result.repository.openIssues}`));
    lines.push(this.escapeCsv(`License,${result.repository.license || 'None'}`));
    lines.push('');

    // Scores
    lines.push('Quality Scores');
    lines.push('Dimension,Score');
    lines.push(`Code Quality,${result.score.breakdown.codeQuality}`);
    lines.push(`Documentation,${result.score.breakdown.documentation}`);
    lines.push(`Testing,${result.score.breakdown.testing}`);
    lines.push(`Community,${result.score.breakdown.community}`);
    lines.push(`Security,${result.score.breakdown.security}`);
    lines.push(`Dependencies,${result.score.breakdown.dependencies}`);
    lines.push('');

    // Overall Score
    lines.push('Overall Score');
    lines.push(`Score,Grade,Timestamp,Duration`);
    lines.push(
      `${result.score.overall},${result.score.grade},${result.timestamp.toISOString()},${result.duration}ms`
    );
    lines.push('');

    // Detailed Metrics
    lines.push('Code Quality Metrics');
    lines.push('Metric,Value');
    lines.push(`Lines of Code,${result.metrics.codeQuality.linesOfCode}`);
    if (result.metrics.codeQuality.complexity) {
      lines.push(`Complexity,${result.metrics.codeQuality.complexity}`);
    }
    if (result.metrics.codeQuality.maintainabilityIndex) {
      lines.push(`Maintainability Index,${result.metrics.codeQuality.maintainabilityIndex}`);
    }
    lines.push('');

    // Documentation Metrics
    lines.push('Documentation Metrics');
    lines.push('File,Present');
    lines.push(`README,${result.metrics.documentation.hasReadme ? 'Yes' : 'No'}`);
    lines.push(
      `Contributing,${result.metrics.documentation.hasContributing ? 'Yes' : 'No'}`
    );
    lines.push(`License,${result.metrics.documentation.hasLicense ? 'Yes' : 'No'}`);
    lines.push(`Changelog,${result.metrics.documentation.hasChangelog ? 'Yes' : 'No'}`);
    lines.push(
      `API Documentation,${result.metrics.documentation.apiDocumentation ? 'Yes' : 'No'}`
    );
    lines.push('');

    // Testing Metrics
    lines.push('Testing Metrics');
    lines.push('Metric,Value');
    lines.push(`Has Tests,${result.metrics.testing.hasTests ? 'Yes' : 'No'}`);
    lines.push(`Has CI/CD,${result.metrics.testing.hasCICD ? 'Yes' : 'No'}`);
    lines.push(`CI Status,${result.metrics.testing.ciStatus || 'Unknown'}`);
    lines.push('');

    // Community Metrics
    lines.push('Community Metrics');
    lines.push('Metric,Value');
    lines.push(`Contributors,${result.metrics.community.contributors}`);
    lines.push(
      `Code of Conduct,${result.metrics.community.hasCodeOfConduct ? 'Yes' : 'No'}`
    );
    lines.push(
      `Issue Templates,${result.metrics.community.hasIssueTemplates ? 'Yes' : 'No'}`
    );
    lines.push(`PR Templates,${result.metrics.community.hasPRTemplates ? 'Yes' : 'No'}`);
    lines.push(`Health Score,${result.metrics.community.communityHealthScore}`);
    lines.push('');

    // Security Metrics
    lines.push('Security Metrics');
    lines.push('Metric,Value');
    lines.push(
      `Security Policy,${result.metrics.security.hasSecurityPolicy ? 'Yes' : 'No'}`
    );
    lines.push(`Vulnerabilities,${result.metrics.security.vulnerabilities}`);
    lines.push(`Dependabot Enabled,${result.metrics.security.dependabotEnabled ? 'Yes' : 'No'}`);
    lines.push(`Secrets Exposed,${result.metrics.security.secretsExposed}`);
    lines.push(`Security Score,${result.metrics.security.securityScore}`);
    lines.push('');

    // Dependencies Metrics
    lines.push('Dependencies Metrics');
    lines.push('Metric,Value');
    lines.push(`Total Dependencies,${result.metrics.dependencies.totalDependencies}`);
    lines.push(`Outdated Dependencies,${result.metrics.dependencies.outdatedDependencies}`);
    lines.push(
      `Deprecated Dependencies,${result.metrics.dependencies.deprecatedDependencies}`
    );
    lines.push(`Dependency Health,${result.metrics.dependencies.dependencyHealth}`);
    lines.push('');

    // Recommendations
    if (result.score.recommendations.length > 0) {
      lines.push('Recommendations');
      result.score.recommendations.forEach((rec, idx) => {
        lines.push(`${idx + 1},${this.escapeCsv(rec)}`);
      });
    }

    return lines.join('\n');
  }

  /**
   * Generate CSV report from batch analysis
   */
  generateBatchReport(result: BatchAnalysisResult): string {
    const lines: string[] = [];

    // Header
    lines.push('Repository Analysis - Batch Report');
    lines.push('');

    // Summary
    lines.push('Summary');
    lines.push(`Total Repositories,${result.total}`);
    lines.push(`Completed,${result.completed}`);
    lines.push(`Failed,${result.failed}`);
    lines.push('');

    // Results table
    lines.push('Results');
    lines.push(
      'Owner,Repository,Overall Score,Grade,Code Quality,Documentation,Testing,Community,Security,Dependencies'
    );

    for (const analysis of result.results) {
      const row = [
        analysis.repository.owner,
        analysis.repository.name,
        analysis.score.overall,
        analysis.score.grade,
        analysis.score.breakdown.codeQuality,
        analysis.score.breakdown.documentation,
        analysis.score.breakdown.testing,
        analysis.score.breakdown.community,
        analysis.score.breakdown.security,
        analysis.score.breakdown.dependencies,
      ];
      lines.push(row.map(v => this.escapeCsv(String(v))).join(','));
    }

    lines.push('');

    // Errors
    if (result.errors.length > 0) {
      lines.push('Errors');
      lines.push('Repository,Error Message');
      for (const error of result.errors) {
        lines.push(`${this.escapeCsv(error.repository)},${this.escapeCsv(error.error)}`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Escape CSV values
   */
  private escapeCsv(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
}

export default CSVReporter;
