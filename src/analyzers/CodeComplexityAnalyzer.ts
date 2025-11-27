/**
 * Code complexity analysis for repositories
 */

import { CodeQualityMetrics } from '../types';
import { GitHubClient } from '../utils/GitHubClient';

export interface ComplexityMetrics {
  averageComplexity: number;
  highComplexityFiles: number;
  estimatedTechnicalDebt: string;
  codeSmells: number;
}

export class CodeComplexityAnalyzer {
  constructor(private githubClient: GitHubClient) {}

  async analyze(owner: string, repo: string, totalLines: number): Promise<CodeQualityMetrics> {
    // Get repository structure to estimate complexity
    const metrics = await this.estimateComplexity(owner, repo, totalLines);

    return {
      linesOfCode: totalLines,
      complexity: metrics.averageComplexity,
      maintainabilityIndex: this.calculateMaintainabilityIndex(
        totalLines,
        metrics.averageComplexity,
        metrics.codeSmells
      ),
      technicalDebt: metrics.estimatedTechnicalDebt,
      codeSmells: metrics.codeSmells,
    };
  }

  private async estimateComplexity(
    owner: string,
    repo: string,
    totalLines: number
  ): Promise<ComplexityMetrics> {
    try {
      // Estimate complexity based on repository size and structure
      // In production, you'd use tools like ast-grep, jscomplexity, or similar

      // Fetch package.json to understand project type
      const packageJson = await this.githubClient.getFileContent(owner, repo, 'package.json');

      let averageComplexity = 5; // Default baseline
      let codeSmells = 0;
      let highComplexityFiles = 0;

      if (packageJson) {
        try {
          const pkg = JSON.parse(packageJson);

          // Estimate complexity based on dependencies and project size
          const depCount = Object.keys(pkg.dependencies || {}).length +
            Object.keys(pkg.devDependencies || {}).length;

          // Larger projects with more deps tend to be more complex
          if (depCount > 100) {
            averageComplexity = 8;
          } else if (depCount > 50) {
            averageComplexity = 7;
          } else if (depCount > 20) {
            averageComplexity = 6;
          }

          // Estimate code smells based on project characteristics
          codeSmells = this.estimateCodeSmells(pkg);

          // Estimate files with high complexity
          highComplexityFiles = Math.ceil(totalLines / 500 * 0.15); // Rough estimate
        } catch {
          // Fallback to size-based estimation
          averageComplexity = this.estimateComplexityFromSize(totalLines);
          codeSmells = Math.ceil(totalLines / 1000);
        }
      }

      const technicalDebt = this.estimateTechnicalDebt(
        totalLines,
        averageComplexity,
        codeSmells
      );

      return {
        averageComplexity,
        highComplexityFiles,
        estimatedTechnicalDebt: technicalDebt,
        codeSmells,
      };
    } catch {
      return {
        averageComplexity: 5,
        highComplexityFiles: 0,
        estimatedTechnicalDebt: 'Unknown',
        codeSmells: 0,
      };
    }
  }

  private estimateComplexityFromSize(linesOfCode: number): number {
    // Cyclomatic complexity typically increases with code size
    if (linesOfCode > 100000) return 10;
    if (linesOfCode > 50000) return 8;
    if (linesOfCode > 10000) return 6;
    if (linesOfCode > 1000) return 4;
    return 2;
  }

  private estimateCodeSmells(pkg: any): number {
    let smells = 0;

    // Check for potential code smell indicators
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    // Duplicate dependencies (e.g., multiple versions of same package)
    const uniqueDeps = new Set(Object.keys(deps));
    if (Object.keys(deps).length > uniqueDeps.size) {
      smells += 2;
    }

    // Too many peer dependencies might indicate design issues
    const peerDeps = Object.keys(pkg.peerDependencies || {}).length;
    if (peerDeps > 10) {
      smells += 1;
    }

    // Missing test framework could be a smell
    const hasTestFramework =
      'jest' in deps ||
      'mocha' in deps ||
      'vitest' in deps ||
      '@testing-library/react' in deps;
    if (!hasTestFramework) {
      smells += 2;
    }

    // No linter is a code smell
    const hasLinter = 'eslint' in deps || 'prettier' in deps || 'tslint' in deps;
    if (!hasLinter) {
      smells += 1;
    }

    return smells;
  }

  private estimateTechnicalDebt(
    linesOfCode: number,
    averageComplexity: number,
    codeSmells: number
  ): string {
    // Estimate technical debt based on metrics
    const complexityScore = Math.min(averageComplexity / 10, 1);
    const sizeScore = Math.min(linesOfCode / 100000, 1);
    const smellScore = Math.min(codeSmells / 50, 1);

    const debtIndex = (complexityScore + sizeScore + smellScore) / 3;

    if (debtIndex > 0.7) {
      return 'High - Significant refactoring needed';
    } else if (debtIndex > 0.4) {
      return 'Medium - Some refactoring recommended';
    } else if (debtIndex > 0.2) {
      return 'Low - Minor improvements possible';
    }
    return 'Minimal - Well-maintained codebase';
  }

  private calculateMaintainabilityIndex(
    linesOfCode: number,
    averageComplexity: number,
    codeSmells: number
  ): number {
    // Maintainability Index calculation (simplified version of SEI methodology)
    // Range: 0-100, higher is better

    if (linesOfCode === 0) {
      return 100;
    }

    // Base score
    let score = 100;

    // Penalty for lines of code (adjusted for modern standards)
    const locPenalty = Math.min(linesOfCode / 10000, 20);
    score -= locPenalty;

    // Penalty for complexity (higher complexity = harder to maintain)
    const complexityPenalty = Math.min(averageComplexity * 2, 30);
    score -= complexityPenalty;

    // Penalty for code smells
    const smellPenalty = Math.min(codeSmells * 2, 20);
    score -= smellPenalty;

    // Bonus for reasonable size repositories
    if (linesOfCode > 1000 && linesOfCode < 50000) {
      score += 10;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }
}

export default CodeComplexityAnalyzer;
