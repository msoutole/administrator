/**
 * History and trends tracking for repository analysis
 */

import { AnalysisResult } from '../types';
import * as fs from 'fs';
import * as path from 'path';

export interface AnalysisHistory {
  repositoryId: string;
  owner: string;
  repo: string;
  analyses: AnalysisSnapshot[];
}

export interface AnalysisSnapshot {
  timestamp: Date;
  overallScore: number;
  breakdown: {
    codeQuality: number;
    documentation: number;
    testing: number;
    community: number;
    security: number;
    dependencies: number;
  };
  metrics: {
    linesOfCode: number;
    contributors: number;
    vulnerabilities: number;
    testCoverage?: number;
  };
}

export interface Trend {
  dimension: string;
  current: number;
  previous?: number;
  change: number; // Change percentage
  trend: 'up' | 'down' | 'stable';
}

export class HistoryManager {
  private historyPath: string | null = null;
  private histories: Map<string, AnalysisHistory> = new Map();

  constructor(historyPath?: string) {
    this.historyPath = historyPath || null;

    if (this.historyPath) {
      this.loadHistories();
    }
  }

  /**
   * Record analysis result to history
   */
  recordAnalysis(result: AnalysisResult): void {
    const repositoryId = `${result.repository.owner}/${result.repository.name}`;

    let history = this.histories.get(repositoryId);
    if (!history) {
      history = {
        repositoryId,
        owner: result.repository.owner,
        repo: result.repository.name,
        analyses: [],
      };
    }

    // Add new snapshot
    const snapshot: AnalysisSnapshot = {
      timestamp: result.timestamp,
      overallScore: result.score.overall,
      breakdown: result.score.breakdown,
      metrics: {
        linesOfCode: result.metrics.codeQuality.linesOfCode,
        contributors: result.metrics.community.contributors,
        vulnerabilities: result.metrics.security.vulnerabilities,
        testCoverage: result.metrics.testing.testCoverage,
      },
    };

    history.analyses.push(snapshot);

    // Keep only last 100 analyses to avoid memory bloat
    if (history.analyses.length > 100) {
      history.analyses = history.analyses.slice(-100);
    }

    this.histories.set(repositoryId, history);

    // Save to disk if enabled
    if (this.historyPath) {
      this.saveHistory(repositoryId, history);
    }
  }

  /**
   * Get analysis history for repository
   */
  getHistory(owner: string, repo: string): AnalysisHistory | null {
    const repositoryId = `${owner}/${repo}`;
    return this.histories.get(repositoryId) || null;
  }

  /**
   * Get trends for repository
   */
  getTrends(owner: string, repo: string): Trend[] {
    const history = this.getHistory(owner, repo);
    if (!history || history.analyses.length < 2) {
      return [];
    }

    const trends: Trend[] = [];
    const current = history.analyses[history.analyses.length - 1];
    const previous = history.analyses[history.analyses.length - 2];

    // Overall score trend
    trends.push(this.calculateTrend('overall', current.overallScore, previous.overallScore));

    // Dimension trends
    for (const dimension of Object.keys(current.breakdown) as Array<
      keyof typeof current.breakdown
    >) {
      trends.push(
        this.calculateTrend(
          dimension,
          current.breakdown[dimension],
          previous.breakdown[dimension]
        )
      );
    }

    return trends;
  }

  /**
   * Get score progression over time
   */
  getScoreProgression(owner: string, repo: string): Array<{ date: Date; score: number }> {
    const history = this.getHistory(owner, repo);
    if (!history) {
      return [];
    }

    return history.analyses.map(snapshot => ({
      date: snapshot.timestamp,
      score: snapshot.overallScore,
    }));
  }

  /**
   * Get repository statistics over time
   */
  getStatistics(owner: string, repo: string): {
    totalAnalyses: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    trend: 'improving' | 'declining' | 'stable';
  } {
    const history = this.getHistory(owner, repo);
    if (!history || history.analyses.length === 0) {
      return {
        totalAnalyses: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        trend: 'stable',
      };
    }

    const scores = history.analyses.map(a => a.overallScore);
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);

    // Determine trend: compare first half with second half
    const midpoint = Math.floor(history.analyses.length / 2);
    const firstHalf = scores.slice(0, midpoint);
    const secondHalf = scores.slice(midpoint);

    const firstHalfAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    const change = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
    if (change > 2) trend = 'improving';
    if (change < -2) trend = 'declining';

    return {
      totalAnalyses: history.analyses.length,
      averageScore: Math.round(average),
      highestScore: highest,
      lowestScore: lowest,
      trend,
    };
  }

  /**
   * Clear history for repository
   */
  clearHistory(owner: string, repo: string): void {
    const repositoryId = `${owner}/${repo}`;
    this.histories.delete(repositoryId);

    if (this.historyPath) {
      try {
        const filePath = this.getHistoryFilePath(repositoryId);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        console.warn(`Failed to delete history file: ${error}`);
      }
    }
  }

  /**
   * Clear all history
   */
  clearAllHistory(): void {
    this.histories.clear();

    if (this.historyPath && fs.existsSync(this.historyPath)) {
      try {
        fs.rmSync(this.historyPath, { recursive: true, force: true });
        fs.mkdirSync(this.historyPath, { recursive: true });
      } catch (error) {
        console.warn(`Failed to clear history directory: ${error}`);
      }
    }
  }

  /**
   * Calculate trend for a dimension
   */
  private calculateTrend(
    dimension: string,
    current: number,
    previous: number
  ): Trend {
    const change = current - previous;
    const changePercent = (change / Math.abs(previous)) * 100;

    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (changePercent > 1) trend = 'up';
    if (changePercent < -1) trend = 'down';

    return {
      dimension,
      current,
      previous,
      change: Math.round(changePercent * 100) / 100,
      trend,
    };
  }

  /**
   * Get history file path
   */
  private getHistoryFilePath(repositoryId: string): string {
    const safeId = repositoryId.replace(/[\/\\:*?"<>|]/g, '_');
    return path.join(this.historyPath!, `${safeId}.json`);
  }

  /**
   * Save history to disk
   */
  private saveHistory(repositoryId: string, history: AnalysisHistory): void {
    if (!this.historyPath) return;

    try {
      const filePath = this.getHistoryFilePath(repositoryId);
      fs.writeFileSync(filePath, JSON.stringify(history, null, 2));
    } catch (error) {
      console.warn(`Failed to save history: ${error}`);
    }
  }

  /**
   * Load histories from disk
   */
  private loadHistories(): void {
    if (!this.historyPath || !fs.existsSync(this.historyPath)) {
      return;
    }

    try {
      const files = fs.readdirSync(this.historyPath);
      for (const file of files) {
        if (!file.endsWith('.json')) continue;

        const filePath = path.join(this.historyPath, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const history = JSON.parse(content) as AnalysisHistory;

        // Convert date strings back to Date objects
        history.analyses = history.analyses.map(snapshot => ({
          ...snapshot,
          timestamp: new Date(snapshot.timestamp),
        }));

        this.histories.set(history.repositoryId, history);
      }
    } catch (error) {
      console.warn(`Failed to load histories: ${error}`);
    }
  }
}

export default HistoryManager;
