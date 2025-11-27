/**
 * Dependency analysis for repositories
 */

import { DependencyMetrics } from '../types';
import { GitHubClient } from '../utils/GitHubClient';

export interface PackageInfo {
  name: string;
  version: string;
  latest?: string;
  isOutdated: boolean;
  isDeprecated: boolean;
  hasVulnerabilities: boolean;
}

export class DependencyAnalyzer {
  constructor(private githubClient: GitHubClient) {}

  async analyze(owner: string, repo: string): Promise<DependencyMetrics> {
    const [totalDeps, outdatedDeps, deprecatedDeps] = await Promise.all([
      this.getTotalDependencies(owner, repo),
      this.getOutdatedDependencies(owner, repo),
      this.getDeprecatedDependencies(owner, repo),
    ]);

    const dependencyHealth = this.calculateDependencyHealth(
      totalDeps,
      outdatedDeps,
      deprecatedDeps
    );

    return {
      totalDependencies: totalDeps,
      outdatedDependencies: outdatedDeps,
      deprecatedDependencies: deprecatedDeps,
      dependencyHealth,
    };
  }

  private async getTotalDependencies(owner: string, repo: string): Promise<number> {
    const packageJson = await this.githubClient.getFileContent(
      owner,
      repo,
      'package.json'
    );

    if (!packageJson) {
      return 0;
    }

    try {
      const pkg = JSON.parse(packageJson);
      const dependencies = pkg.dependencies || {};
      const devDependencies = pkg.devDependencies || {};
      const peerDependencies = pkg.peerDependencies || {};
      const optionalDependencies = pkg.optionalDependencies || {};

      return (
        Object.keys(dependencies).length +
        Object.keys(devDependencies).length +
        Object.keys(peerDependencies).length +
        Object.keys(optionalDependencies).length
      );
    } catch {
      return 0;
    }
  }

  private async getOutdatedDependencies(owner: string, repo: string): Promise<number> {
    const packageJson = await this.githubClient.getFileContent(
      owner,
      repo,
      'package.json'
    );

    if (!packageJson) {
      return 0;
    }

    try {
      const pkg = JSON.parse(packageJson);
      const lockFile = await this.githubClient.getFileContent(
        owner,
        repo,
        'package-lock.json'
      );

      let outdatedCount = 0;

      // Check production dependencies
      const dependencies = pkg.dependencies || {};
      for (const [name, version] of Object.entries(dependencies)) {
        if (this.isOutdatedVersion(version as string, name)) {
          outdatedCount++;
        }
      }

      // Check dev dependencies
      const devDependencies = pkg.devDependencies || {};
      for (const [name, version] of Object.entries(devDependencies)) {
        if (this.isOutdatedVersion(version as string, name)) {
          outdatedCount++;
        }
      }

      return outdatedCount;
    } catch {
      return 0;
    }
  }

  private async getDeprecatedDependencies(owner: string, repo: string): Promise<number> {
    const packageJson = await this.githubClient.getFileContent(
      owner,
      repo,
      'package.json'
    );

    if (!packageJson) {
      return 0;
    }

    try {
      const pkg = JSON.parse(packageJson);
      const deprecatedPackages = await this.getDeprecatedPackageList();

      let deprecatedCount = 0;

      // Check production dependencies
      const dependencies = pkg.dependencies || {};
      for (const name of Object.keys(dependencies)) {
        if (deprecatedPackages.includes(name)) {
          deprecatedCount++;
        }
      }

      // Check dev dependencies
      const devDependencies = pkg.devDependencies || {};
      for (const name of Object.keys(devDependencies)) {
        if (deprecatedPackages.includes(name)) {
          deprecatedCount++;
        }
      }

      return deprecatedCount;
    } catch {
      return 0;
    }
  }

  private isOutdatedVersion(version: string, packageName: string): boolean {
    // Simplified check - in production, use npm registry API
    // This is a basic heuristic that considers versions with specific patterns as outdated

    const knownOutdated: Record<string, string[]> = {
      'react': ['<16.13.0'],
      'vue': ['<2.6.0'],
      'angular': ['<10.0.0'],
      'typescript': ['<4.0.0'],
      'eslint': ['<7.0.0'],
      'prettier': ['<2.0.0'],
      'jest': ['<26.0.0'],
      'webpack': ['<4.0.0'],
      'babel': ['<7.0.0'],
    };

    const criticalVersions = knownOutdated[packageName];
    if (!criticalVersions) {
      return false;
    }

    // Very simplified version comparison
    const versionNum = this.extractMajorVersion(version);
    return criticalVersions.some(critical => {
      const criticalNum = this.extractMajorVersion(critical);
      return versionNum < criticalNum;
    });
  }

  private extractMajorVersion(version: string): number {
    // Remove caret, tilde, equals signs
    const cleanVersion = version.replace(/^[\^~=v]/, '');
    const major = cleanVersion.split('.')[0];
    return parseInt(major, 10) || 0;
  }

  private async getDeprecatedPackageList(): Promise<string[]> {
    // Known deprecated packages
    return [
      'node-uuid',
      'bower',
      'gulp-util',
      'node-inspector',
      'jade',
      'express-less',
      'cluster-key-ad',
      'cluster-key-linearizer',
      'kraken-js',
    ];
  }

  private calculateDependencyHealth(
    totalDeps: number,
    outdatedDeps: number,
    deprecatedDeps: number
  ): number {
    if (totalDeps === 0) {
      return 100; // No dependencies = clean
    }

    let score = 100;

    // Penalize for outdated dependencies
    const outdatedRatio = outdatedDeps / totalDeps;
    if (outdatedRatio > 0.5) {
      score -= 40;
    } else if (outdatedRatio > 0.2) {
      score -= 25;
    } else if (outdatedRatio > 0.1) {
      score -= 15;
    } else if (outdatedRatio > 0) {
      score -= 5;
    }

    // Heavily penalize for deprecated dependencies
    const deprecatedRatio = deprecatedDeps / totalDeps;
    score -= deprecatedRatio * 50;

    // Bonus for having manageable dependency count
    if (totalDeps <= 20) {
      score += 5;
    } else if (totalDeps > 100) {
      score -= 10;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }
}

export default DependencyAnalyzer;
