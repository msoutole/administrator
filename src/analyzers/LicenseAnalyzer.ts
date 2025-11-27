/**
 * License compliance analysis for repositories
 */

export interface LicenseInfo {
  name: string;
  type: 'permissive' | 'copyleft' | 'proprietary' | 'unknown';
  url: string;
}

export interface LicenseConflict {
  package: string;
  license: string;
  conflict: string;
  severity: 'high' | 'medium' | 'low';
}

export interface LicenseMetrics {
  mainLicense?: string;
  mainLicenseType: 'permissive' | 'copyleft' | 'proprietary' | 'unknown';
  hasLicense: boolean;
  conflicts: LicenseConflict[];
  complianceScore: number;
}

export class LicenseAnalyzer {
  private knownLicenses: Record<string, LicenseInfo> = {
    'MIT': {
      name: 'MIT License',
      type: 'permissive',
      url: 'https://opensource.org/licenses/MIT',
    },
    'Apache-2.0': {
      name: 'Apache License 2.0',
      type: 'permissive',
      url: 'https://opensource.org/licenses/Apache-2.0',
    },
    'BSD-2-Clause': {
      name: 'BSD 2-Clause License',
      type: 'permissive',
      url: 'https://opensource.org/licenses/BSD-2-Clause',
    },
    'BSD-3-Clause': {
      name: 'BSD 3-Clause License',
      type: 'permissive',
      url: 'https://opensource.org/licenses/BSD-3-Clause',
    },
    'GPL-2.0': {
      name: 'GNU General Public License v2.0',
      type: 'copyleft',
      url: 'https://opensource.org/licenses/GPL-2.0',
    },
    'GPL-3.0': {
      name: 'GNU General Public License v3.0',
      type: 'copyleft',
      url: 'https://opensource.org/licenses/GPL-3.0',
    },
    'LGPL-2.1': {
      name: 'GNU Lesser General Public License v2.1',
      type: 'copyleft',
      url: 'https://opensource.org/licenses/LGPL-2.1',
    },
    'LGPL-3.0': {
      name: 'GNU Lesser General Public License v3.0',
      type: 'copyleft',
      url: 'https://opensource.org/licenses/LGPL-3.0',
    },
    'ISC': {
      name: 'ISC License',
      type: 'permissive',
      url: 'https://opensource.org/licenses/ISC',
    },
    'MPL-2.0': {
      name: 'Mozilla Public License 2.0',
      type: 'copyleft',
      url: 'https://opensource.org/licenses/MPL-2.0',
    },
    'AGPL-3.0': {
      name: 'Affero General Public License v3.0',
      type: 'copyleft',
      url: 'https://opensource.org/licenses/AGPL-3.0',
    },
    'Unlicense': {
      name: 'The Unlicense',
      type: 'permissive',
      url: 'https://unlicense.org/',
    },
  };

  /**
   * Analyze licenses in repository
   */
  async analyze(mainLicense?: string): Promise<LicenseMetrics> {
    const mainLicenseInfo = this.getLicenseInfo(mainLicense);

    // Check for common license conflicts
    const conflicts = this.checkForConflicts(mainLicenseInfo?.type);

    // Calculate compliance score
    const complianceScore = this.calculateComplianceScore(mainLicenseInfo, conflicts);

    return {
      mainLicense: mainLicense || undefined,
      mainLicenseType: mainLicenseInfo?.type || 'unknown',
      hasLicense: !!mainLicense,
      conflicts,
      complianceScore,
    };
  }

  /**
   * Get license information
   */
  private getLicenseInfo(license?: string): LicenseInfo | null {
    if (!license) {
      return null;
    }

    return this.knownLicenses[license] || {
      name: license,
      type: 'unknown',
      url: '',
    };
  }

  /**
   * Check for common license conflicts
   */
  private checkForConflicts(mainLicenseType?: string): LicenseConflict[] {
    const conflicts: LicenseConflict[] = [];

    // Common conflict patterns
    if (mainLicenseType === 'copyleft') {
      // Copyleft licenses can conflict with proprietary code
      conflicts.push({
        package: 'proprietary-deps',
        license: 'Proprietary',
        conflict: 'GPL/AGPL derivatives must be open source',
        severity: 'high',
      });
    }

    if (mainLicenseType === 'permissive') {
      // Permissive licenses are generally compatible with everything
      // But may have issues with GPL
      conflicts.push({
        package: 'potential-gpl-deps',
        license: 'GPL/AGPL',
        conflict: 'GPL dependencies may impose copyleft requirements',
        severity: 'medium',
      });
    }

    return conflicts;
  }

  /**
   * Calculate compliance score
   */
  private calculateComplianceScore(
    mainLicense: LicenseInfo | null,
    conflicts: LicenseConflict[]
  ): number {
    let score = 50; // Base score

    // Having a license is important
    if (mainLicense) {
      score += 30;

      // License type affects score
      if (mainLicense.type === 'permissive') {
        score += 15; // Permissive licenses are more compatible
      } else if (mainLicense.type === 'copyleft') {
        score += 10; // Copyleft is important but restrictive
      }
    }

    // Penalize for conflicts
    for (const conflict of conflicts) {
      if (conflict.severity === 'high') {
        score -= 20;
      } else if (conflict.severity === 'medium') {
        score -= 10;
      } else {
        score -= 5;
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Get all known licenses
   */
  getKnownLicenses(): Record<string, LicenseInfo> {
    return this.knownLicenses;
  }

  /**
   * Check if license is compatible with another
   */
  isCompatible(license1: string, license2: string): boolean {
    const lic1 = this.knownLicenses[license1];
    const lic2 = this.knownLicenses[license2];

    if (!lic1 || !lic2) {
      return true; // Unknown licenses assumed compatible
    }

    // Permissive licenses are compatible with everything
    if (lic1.type === 'permissive' || lic2.type === 'permissive') {
      return true;
    }

    // Same copyleft licenses are compatible
    if (lic1.type === 'copyleft' && lic2.type === 'copyleft') {
      return license1 === license2;
    }

    // Different types are generally incompatible
    return false;
  }
}

export default LicenseAnalyzer;
