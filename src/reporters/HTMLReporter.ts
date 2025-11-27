/**
 * HTML report generator with visual charts
 */

import { AnalysisResult, BatchAnalysisResult } from '../types';

export class HTMLReporter {
  /**
   * Generate HTML report from single analysis
   */
  generateSingleReport(result: AnalysisResult): string {
    const gradeColor = this.getGradeColor(result.score.grade);

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Repository Analysis Report - ${result.repository.name}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: white;
        }

        header {
            border-bottom: 3px solid #0066cc;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }

        h1 {
            color: #0066cc;
            font-size: 2.5em;
            margin-bottom: 10px;
        }

        h2 {
            color: #0066cc;
            font-size: 1.5em;
            margin-top: 30px;
            margin-bottom: 15px;
            border-bottom: 2px solid #e0e0e0;
            padding-bottom: 10px;
        }

        .repo-info {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }

        .info-card {
            background: #f9f9f9;
            padding: 15px;
            border-left: 4px solid #0066cc;
            border-radius: 4px;
        }

        .info-card strong {
            display: block;
            color: #666;
            font-size: 0.9em;
            margin-bottom: 5px;
        }

        .info-card span {
            display: block;
            font-size: 1.2em;
            color: #333;
        }

        .score-section {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 8px;
            text-align: center;
            margin: 30px 0;
        }

        .overall-score {
            font-size: 4em;
            font-weight: bold;
            margin: 20px 0;
        }

        .grade-badge {
            display: inline-block;
            background: ${gradeColor};
            color: white;
            padding: 10px 20px;
            border-radius: 50%;
            font-size: 2em;
            font-weight: bold;
            margin: 10px;
            min-width: 80px;
            line-height: 1;
        }

        .scores-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }

        .score-card {
            background: white;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .score-card .dimension {
            font-size: 0.9em;
            color: #666;
            margin-bottom: 8px;
            font-weight: 500;
        }

        .score-card .value {
            font-size: 1.8em;
            font-weight: bold;
            color: #0066cc;
        }

        .metrics-section {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }

        .metric-group {
            background: #f9f9f9;
            padding: 20px;
            border-radius: 8px;
            border-top: 4px solid #0066cc;
        }

        .metric-group h3 {
            color: #0066cc;
            margin-bottom: 15px;
            font-size: 1.1em;
        }

        .metric {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e0e0e0;
        }

        .metric:last-child {
            border-bottom: none;
        }

        .metric-name {
            font-weight: 500;
            color: #555;
        }

        .metric-value {
            color: #0066cc;
            font-weight: bold;
        }

        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.85em;
            font-weight: 600;
            margin: 2px;
        }

        .badge.yes {
            background: #d4edda;
            color: #155724;
        }

        .badge.no {
            background: #f8d7da;
            color: #721c24;
        }

        .recommendations {
            background: #e7f3ff;
            border-left: 4px solid #0066cc;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
        }

        .recommendations h3 {
            color: #0066cc;
            margin-bottom: 15px;
        }

        .recommendation-item {
            padding: 10px;
            margin: 8px 0;
            background: white;
            border-radius: 4px;
            border-left: 3px solid #0066cc;
        }

        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            color: #666;
            font-size: 0.9em;
            text-align: center;
        }

        @media print {
            body {
                background: white;
            }

            .container {
                max-width: 100%;
                box-shadow: none;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>📊 Repository Analysis Report</h1>
            <p><a href="${result.repository.url}" target="_blank" style="color: #0066cc; text-decoration: none;">
                ${result.repository.owner}/${result.repository.name}
            </a></p>
        </header>

        <div class="repo-info">
            <div class="info-card">
                <strong>Language</strong>
                <span>${result.repository.language || 'Unknown'}</span>
            </div>
            <div class="info-card">
                <strong>Stars</strong>
                <span>⭐ ${result.repository.stars}</span>
            </div>
            <div class="info-card">
                <strong>Forks</strong>
                <span>🍴 ${result.repository.forks}</span>
            </div>
            <div class="info-card">
                <strong>Open Issues</strong>
                <span>📋 ${result.repository.openIssues}</span>
            </div>
            <div class="info-card">
                <strong>License</strong>
                <span>${result.repository.license || 'None'}</span>
            </div>
            <div class="info-card">
                <strong>Last Updated</strong>
                <span>${result.repository.updatedAt.toLocaleDateString()}</span>
            </div>
        </div>

        <div class="score-section">
            <h2 style="color: white; border: none; margin: 0 0 10px 0;">Overall Quality Score</h2>
            <div class="overall-score">${result.score.overall}</div>
            <div class="grade-badge">${result.score.grade}</div>
        </div>

        <div>
            <h2>Score Breakdown</h2>
            <div class="scores-grid">
                ${this.generateScoreCard('Code Quality', result.score.breakdown.codeQuality)}
                ${this.generateScoreCard('Documentation', result.score.breakdown.documentation)}
                ${this.generateScoreCard('Testing', result.score.breakdown.testing)}
                ${this.generateScoreCard('Community', result.score.breakdown.community)}
                ${this.generateScoreCard('Security', result.score.breakdown.security)}
                ${this.generateScoreCard('Dependencies', result.score.breakdown.dependencies)}
            </div>
        </div>

        <h2>Detailed Metrics</h2>
        <div class="metrics-section">
            ${this.generateCodeQualitySection(result)}
            ${this.generateDocumentationSection(result)}
            ${this.generateSecuritySection(result)}
            ${this.generateDependenciesSection(result)}
            ${this.generateCommunitySection(result)}
            ${this.generateTestingSection(result)}
        </div>

        ${
          result.score.recommendations.length > 0
            ? `
        <div class="recommendations">
            <h3>📝 Recommendations</h3>
            ${result.score.recommendations.map(rec => `<div class="recommendation-item">${rec}</div>`).join('')}
        </div>
        `
            : ''
        }

        <div class="footer">
            <p>Generated on ${result.timestamp.toLocaleString()} | Analysis took ${result.duration}ms</p>
        </div>
    </div>
</body>
</html>
    `;
  }

  /**
   * Generate batch HTML report
   */
  generateBatchReport(result: BatchAnalysisResult): string {
    const sortedResults = [...result.results].sort((a, b) => b.score.overall - a.score.overall);

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Batch Repository Analysis Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: white;
        }

        header {
            border-bottom: 3px solid #0066cc;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }

        h1 {
            color: #0066cc;
            font-size: 2.5em;
            margin-bottom: 10px;
        }

        h2 {
            color: #0066cc;
            font-size: 1.5em;
            margin-top: 30px;
            margin-bottom: 15px;
        }

        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }

        .summary-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }

        .summary-card .value {
            font-size: 2.5em;
            font-weight: bold;
            margin: 10px 0;
        }

        .summary-card .label {
            font-size: 0.9em;
            opacity: 0.9;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }

        th {
            background: #0066cc;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
        }

        td {
            padding: 12px;
            border-bottom: 1px solid #e0e0e0;
        }

        tr:hover {
            background: #f5f5f5;
        }

        .repo-link {
            color: #0066cc;
            text-decoration: none;
            font-weight: 500;
        }

        .repo-link:hover {
            text-decoration: underline;
        }

        .score {
            font-weight: bold;
            color: #0066cc;
        }

        .grade {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 0.9em;
        }

        .grade.a { background: #d4edda; color: #155724; }
        .grade.b { background: #d1ecf1; color: #0c5460; }
        .grade.c { background: #fff3cd; color: #856404; }
        .grade.d { background: #f8d7da; color: #721c24; }
        .grade.f { background: #f8d7da; color: #721c24; }

        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            color: #666;
            font-size: 0.9em;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>📊 Batch Repository Analysis Report</h1>
            <p>Analysis of ${result.total} repositories</p>
        </header>

        <div class="summary">
            <div class="summary-card">
                <div class="label">Total Repositories</div>
                <div class="value">${result.total}</div>
            </div>
            <div class="summary-card">
                <div class="label">Successful</div>
                <div class="value">${result.completed}</div>
            </div>
            <div class="summary-card">
                <div class="label">Failed</div>
                <div class="value">${result.failed}</div>
            </div>
            <div class="summary-card">
                <div class="label">Success Rate</div>
                <div class="value">${Math.round((result.completed / result.total) * 100)}%</div>
            </div>
        </div>

        <h2>Repository Rankings</h2>
        <table>
            <thead>
                <tr>
                    <th>Repository</th>
                    <th>Overall Score</th>
                    <th>Code Quality</th>
                    <th>Documentation</th>
                    <th>Testing</th>
                    <th>Community</th>
                    <th>Security</th>
                    <th>Dependencies</th>
                </tr>
            </thead>
            <tbody>
                ${sortedResults
                  .map(
                    analysis => `
                <tr>
                    <td><span class="repo-link">${analysis.repository.owner}/${analysis.repository.name}</span></td>
                    <td><span class="score">${analysis.score.overall}</span> <span class="grade ${analysis.score.grade.toLowerCase()}">${analysis.score.grade}</span></td>
                    <td>${analysis.score.breakdown.codeQuality}</td>
                    <td>${analysis.score.breakdown.documentation}</td>
                    <td>${analysis.score.breakdown.testing}</td>
                    <td>${analysis.score.breakdown.community}</td>
                    <td>${analysis.score.breakdown.security}</td>
                    <td>${analysis.score.breakdown.dependencies}</td>
                </tr>
                `
                  )
                  .join('')}
            </tbody>
        </table>

        ${
          result.errors.length > 0
            ? `
        <h2>Errors</h2>
        <table>
            <thead>
                <tr>
                    <th>Repository</th>
                    <th>Error Message</th>
                </tr>
            </thead>
            <tbody>
                ${result.errors.map(err => `<tr><td>${err.repository}</td><td>${err.error}</td></tr>`).join('')}
            </tbody>
        </table>
        `
            : ''
        }

        <div class="footer">
            <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
    </div>
</body>
</html>
    `;
  }

  private generateScoreCard(dimension: string, score: number): string {
    return `
        <div class="score-card">
            <div class="dimension">${dimension}</div>
            <div class="value">${score}</div>
        </div>
    `;
  }

  private generateCodeQualitySection(result: AnalysisResult): string {
    return `
        <div class="metric-group">
            <h3>Code Quality</h3>
            <div class="metric">
                <span class="metric-name">Lines of Code</span>
                <span class="metric-value">${result.metrics.codeQuality.linesOfCode}</span>
            </div>
            ${result.metrics.codeQuality.complexity ? `<div class="metric">
                <span class="metric-name">Complexity</span>
                <span class="metric-value">${result.metrics.codeQuality.complexity}</span>
            </div>` : ''}
        </div>
    `;
  }

  private generateDocumentationSection(result: AnalysisResult): string {
    return `
        <div class="metric-group">
            <h3>Documentation</h3>
            <div class="metric">
                <span class="metric-name">README</span>
                <span class="metric-value"><span class="badge ${result.metrics.documentation.hasReadme ? 'yes' : 'no'}">${result.metrics.documentation.hasReadme ? '✓' : '✗'}</span></span>
            </div>
            <div class="metric">
                <span class="metric-name">License</span>
                <span class="metric-value"><span class="badge ${result.metrics.documentation.hasLicense ? 'yes' : 'no'}">${result.metrics.documentation.hasLicense ? '✓' : '✗'}</span></span>
            </div>
        </div>
    `;
  }

  private generateSecuritySection(result: AnalysisResult): string {
    return `
        <div class="metric-group">
            <h3>Security</h3>
            <div class="metric">
                <span class="metric-name">Security Policy</span>
                <span class="metric-value"><span class="badge ${result.metrics.security.hasSecurityPolicy ? 'yes' : 'no'}">${result.metrics.security.hasSecurityPolicy ? '✓' : '✗'}</span></span>
            </div>
            <div class="metric">
                <span class="metric-name">Vulnerabilities</span>
                <span class="metric-value">${result.metrics.security.vulnerabilities}</span>
            </div>
            <div class="metric">
                <span class="metric-name">Dependabot</span>
                <span class="metric-value"><span class="badge ${result.metrics.security.dependabotEnabled ? 'yes' : 'no'}">${result.metrics.security.dependabotEnabled ? '✓' : '✗'}</span></span>
            </div>
        </div>
    `;
  }

  private generateDependenciesSection(result: AnalysisResult): string {
    return `
        <div class="metric-group">
            <h3>Dependencies</h3>
            <div class="metric">
                <span class="metric-name">Total</span>
                <span class="metric-value">${result.metrics.dependencies.totalDependencies}</span>
            </div>
            <div class="metric">
                <span class="metric-name">Outdated</span>
                <span class="metric-value">${result.metrics.dependencies.outdatedDependencies}</span>
            </div>
        </div>
    `;
  }

  private generateCommunitySection(result: AnalysisResult): string {
    return `
        <div class="metric-group">
            <h3>Community</h3>
            <div class="metric">
                <span class="metric-name">Contributors</span>
                <span class="metric-value">${result.metrics.community.contributors}</span>
            </div>
            <div class="metric">
                <span class="metric-name">Code of Conduct</span>
                <span class="metric-value"><span class="badge ${result.metrics.community.hasCodeOfConduct ? 'yes' : 'no'}">${result.metrics.community.hasCodeOfConduct ? '✓' : '✗'}</span></span>
            </div>
        </div>
    `;
  }

  private generateTestingSection(result: AnalysisResult): string {
    return `
        <div class="metric-group">
            <h3>Testing</h3>
            <div class="metric">
                <span class="metric-name">Has Tests</span>
                <span class="metric-value"><span class="badge ${result.metrics.testing.hasTests ? 'yes' : 'no'}">${result.metrics.testing.hasTests ? '✓' : '✗'}</span></span>
            </div>
            <div class="metric">
                <span class="metric-name">Has CI/CD</span>
                <span class="metric-value"><span class="badge ${result.metrics.testing.hasCICD ? 'yes' : 'no'}">${result.metrics.testing.hasCICD ? '✓' : '✗'}</span></span>
            </div>
        </div>
    `;
  }

  private getGradeColor(grade: string): string {
    const colors: Record<string, string> = {
      A: '#28a745',
      B: '#17a2b8',
      C: '#ffc107',
      D: '#fd7e14',
      F: '#dc3545',
    };
    return colors[grade] || '#6c757d';
  }
}

export default HTMLReporter;
