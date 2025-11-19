/**
 * Quality scoring engine
 */

import { QualityScore, RepositoryMetrics, ScoringWeights } from '../types';
import { calculateGrade } from '../utils/helpers';

export class ScoringEngine {
  private weights: Required<ScoringWeights>;

  constructor(customWeights?: ScoringWeights) {
    this.weights = {
      codeQuality: customWeights?.codeQuality ?? 0.25,
      documentation: customWeights?.documentation ?? 0.2,
      testing: customWeights?.testing ?? 0.2,
      community: customWeights?.community ?? 0.15,
      security: customWeights?.security ?? 0.15,
      dependencies: customWeights?.dependencies ?? 0.05,
    };
  }

  calculateScore(metrics: RepositoryMetrics): QualityScore {
    const breakdown = {
      codeQuality: this.calculateCodeQualityScore(metrics.codeQuality),
      documentation: this.calculateDocumentationScore(metrics.documentation),
      testing: this.calculateTestingScore(metrics.testing),
      community: this.calculateCommunityScore(metrics.community),
      security: this.calculateSecurityScore(metrics.security),
      dependencies: this.calculateDependencyScore(metrics.dependencies),
    };

    const overall = Math.round(
      breakdown.codeQuality * this.weights.codeQuality +
        breakdown.documentation * this.weights.documentation +
        breakdown.testing * this.weights.testing +
        breakdown.community * this.weights.community +
        breakdown.security * this.weights.security +
        breakdown.dependencies * this.weights.dependencies
    );

    const grade = calculateGrade(overall);
    const recommendations = this.generateRecommendations(breakdown);

    return {
      overall,
      breakdown,
      grade,
      recommendations,
    };
  }

  private calculateCodeQualityScore(metrics: RepositoryMetrics['codeQuality']): number {
    let score = 50; // Base score

    // Maintainability index contribution
    if (metrics.maintainabilityIndex) {
      score += (metrics.maintainabilityIndex / 100) * 30;
    }

    // Reasonable code size
    if (metrics.linesOfCode > 100 && metrics.linesOfCode < 100000) {
      score += 20;
    } else if (metrics.linesOfCode >= 100000) {
      score += 10;
    }

    return Math.min(Math.round(score), 100);
  }

  private calculateDocumentationScore(metrics: RepositoryMetrics['documentation']): number {
    let score = 0;

    if (metrics.hasReadme) score += 30;
    score += (metrics.readmeQuality / 100) * 30;
    if (metrics.hasLicense) score += 15;
    if (metrics.hasContributing) score += 10;
    if (metrics.hasChangelog) score += 10;
    if (metrics.apiDocumentation) score += 5;

    return Math.min(Math.round(score), 100);
  }

  private calculateTestingScore(metrics: RepositoryMetrics['testing']): number {
    let score = 0;

    if (metrics.hasTests) score += 40;
    if (metrics.testCoverage) {
      score += (metrics.testCoverage / 100) * 40;
    }
    if (metrics.hasCICD) score += 20;

    return Math.min(Math.round(score), 100);
  }

  private calculateCommunityScore(metrics: RepositoryMetrics['community']): number {
    let score = metrics.communityHealthScore * 0.5;

    if (metrics.hasCodeOfConduct) score += 15;
    if (metrics.hasIssueTemplates) score += 15;
    if (metrics.hasPRTemplates) score += 10;
    if (metrics.contributors > 5) score += 10;

    return Math.min(Math.round(score), 100);
  }

  private calculateSecurityScore(metrics: RepositoryMetrics['security']): number {
    let score = metrics.securityScore;

    if (metrics.hasSecurityPolicy) score += 10;
    if (metrics.dependabotEnabled) score += 10;

    // Deduct for vulnerabilities
    score -= metrics.vulnerabilities * 5;
    score -= metrics.secretsExposed * 10;

    return Math.max(0, Math.min(Math.round(score), 100));
  }

  private calculateDependencyScore(metrics: RepositoryMetrics['dependencies']): number {
    return Math.round(metrics.dependencyHealth);
  }

  private generateRecommendations(breakdown: QualityScore['breakdown']): string[] {
    const recommendations: string[] = [];

    if (breakdown.documentation < 70) {
      recommendations.push(
        'Improve documentation: Add or enhance README, CONTRIBUTING, and CHANGELOG files'
      );
    }

    if (breakdown.testing < 70) {
      recommendations.push('Increase test coverage and set up CI/CD pipeline');
    }

    if (breakdown.security < 70) {
      recommendations.push('Add SECURITY.md and enable Dependabot for security updates');
    }

    if (breakdown.community < 70) {
      recommendations.push(
        'Add CODE_OF_CONDUCT.md and issue/PR templates to improve community engagement'
      );
    }

    if (breakdown.codeQuality < 70) {
      recommendations.push('Focus on code maintainability and reducing complexity');
    }

    if (breakdown.dependencies < 70) {
      recommendations.push('Update outdated dependencies and remove deprecated packages');
    }

    if (recommendations.length === 0) {
      recommendations.push('Great work! Continue maintaining high quality standards');
    }

    return recommendations;
  }
}

export default ScoringEngine;
