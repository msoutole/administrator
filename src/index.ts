/**
 * Main entry point for Administrator library
 */

export { RepositoryAnalyzer } from './analyzers/RepositoryAnalyzer';
export { DocumentationAnalyzer } from './analyzers/DocumentationAnalyzer';
export { ScoringEngine } from './analyzers/ScoringEngine';
export { ReportGenerator } from './reporters/ReportGenerator';
export { ConfigManager } from './config/ConfigManager';
export { GitHubClient } from './utils/GitHubClient';

export * from './types';
export { configSchema } from './schemas/config-schema';
