/**
 * Security analysis for repositories
 */

import { SecurityMetrics } from '../types';
import { GitHubClient } from '../utils/GitHubClient';

export interface SecurityAudit {
  vulnerabilities: number;
  criticalVulnerabilities: number;
  highVulnerabilities: number;
  mediumVulnerabilities: number;
}

export class SecurityAnalyzer {
  constructor(private githubClient: GitHubClient) {}

  async analyze(owner: string, repo: string): Promise<SecurityMetrics> {
    const [
      hasSecurityPolicy,
      vulnerabilities,
      dependabotEnabled,
      secretsExposed,
    ] = await Promise.all([
      this.hasSecurityPolicy(owner, repo),
      this.countVulnerabilities(owner, repo),
      this.isDependabotEnabled(owner, repo),
      this.detectExposedSecrets(owner, repo),
    ]);

    const securityScore = this.calculateSecurityScore(
      hasSecurityPolicy,
      vulnerabilities,
      dependabotEnabled,
      secretsExposed
    );

    return {
      hasSecurityPolicy,
      vulnerabilities,
      dependabotEnabled,
      secretsExposed,
      securityScore,
    };
  }

  private async hasSecurityPolicy(owner: string, repo: string): Promise<boolean> {
    const securityPolicyPaths = [
      'SECURITY.md',
      '.github/SECURITY.md',
      'docs/SECURITY.md',
      '.github/security/policy.md',
    ];

    for (const path of securityPolicyPaths) {
      if (await this.githubClient.hasFile(owner, repo, path)) {
        return true;
      }
    }
    return false;
  }

  private async countVulnerabilities(owner: string, repo: string): Promise<number> {
    try {
      // Check package.json for npm audit data
      const packageJson = await this.githubClient.getFileContent(
        owner,
        repo,
        'package.json'
      );

      if (packageJson) {
        try {
          const pkg = JSON.parse(packageJson);
          // This would ideally run `npm audit` but we simulate based on known patterns
          // In production, you'd call npm audit programmatically or use a security API

          // Check for common vulnerable dependencies (hardcoded list for MVP)
          const vulnerablePkgs = await this.checkKnownVulnerabilities(pkg.dependencies || {});
          const vulnerableDevPkgs = await this.checkKnownVulnerabilities(
            pkg.devDependencies || {}
          );

          return vulnerablePkgs + vulnerableDevPkgs;
        } catch {
          return 0;
        }
      }

      return 0;
    } catch {
      return 0;
    }
  }

  private async checkKnownVulnerabilities(dependencies: Record<string, string>): Promise<number> {
    // Known vulnerable packages (simplified list)
    const knownVulnerable: Record<string, string[]> = {
      'lodash': ['<4.17.21'],
      'minimist': ['<1.2.6'],
      'serialize-javascript': ['<5.0.1'],
      'ws': ['<6.2.2', '>=7.0.0 <7.4.6'],
      'glob-parent': ['<5.1.2'],
      'tar': ['<6.1.11'],
      'immer': ['<9.0.7'],
    };

    let count = 0;
    for (const [pkg, vulnVersions] of Object.entries(knownVulnerable)) {
      if (dependencies[pkg]) {
        // Simplified version check (in production, use semver library)
        count++;
      }
    }
    return count;
  }

  private async isDependabotEnabled(owner: string, repo: string): Promise<boolean> {
    // Check for Dependabot configuration files
    const dependabotPaths = [
      '.github/dependabot.yml',
      '.github/dependabot.yaml',
      '.dependabot/config.yml',
    ];

    for (const path of dependabotPaths) {
      if (await this.githubClient.hasFile(owner, repo, path)) {
        return true;
      }
    }

    return false;
  }

  private async detectExposedSecrets(owner: string, repo: string): Promise<number> {
    // Check for common secret patterns in common files
    const commonSecretFiles = [
      '.env',
      '.env.local',
      'config.json',
      'secrets.json',
      '.npmrc',
      '.aws/credentials',
      'credentials.json',
    ];

    let secretsCount = 0;

    for (const file of commonSecretFiles) {
      if (await this.githubClient.hasFile(owner, repo, file)) {
        secretsCount++;
      }
    }

    return secretsCount;
  }

  private calculateSecurityScore(
    hasSecurityPolicy: boolean,
    vulnerabilities: number,
    dependabotEnabled: boolean,
    secretsExposed: number
  ): number {
    let score = 50; // Base score

    // Security policy contributes 20 points
    if (hasSecurityPolicy) {
      score += 20;
    }

    // Dependabot enabled contributes 15 points
    if (dependabotEnabled) {
      score += 15;
    }

    // Vulnerabilities reduce score
    if (vulnerabilities === 0) {
      score += 10;
    } else if (vulnerabilities <= 2) {
      score += 5;
    } else if (vulnerabilities > 5) {
      score -= vulnerabilities * 2;
    }

    // Exposed secrets heavily penalize score
    if (secretsExposed > 0) {
      score -= secretsExposed * 5;
    }

    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(100, score));
  }
}

export default SecurityAnalyzer;
