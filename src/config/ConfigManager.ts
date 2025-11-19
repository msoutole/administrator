/**
 * Configuration manager with validation
 */

import { z } from 'zod';
import * as dotenv from 'dotenv';
import { Config } from '../types';
import { configSchema } from '../schemas/config-schema';

dotenv.config();

const ConfigZodSchema = z.object({
  github: z.object({
    token: z.string().min(1),
    apiVersion: z.string().optional().default('2022-11-28'),
  }),
  analysis: z
    .object({
      minQualityScore: z.number().min(0).max(100).optional().default(50),
      maxReposPerBatch: z.number().min(1).max(100).optional().default(10),
      timeout: z.number().min(1000).optional().default(30000),
      cache: z
        .object({
          enabled: z.boolean().optional().default(true),
          directory: z.string().optional().default('.cache/administrator'),
          ttl: z.number().min(0).optional().default(86400),
        })
        .optional(),
    })
    .optional(),
  scoring: z
    .object({
      weights: z
        .object({
          codeQuality: z.number().min(0).max(1).optional().default(0.25),
          documentation: z.number().min(0).max(1).optional().default(0.2),
          testing: z.number().min(0).max(1).optional().default(0.2),
          community: z.number().min(0).max(1).optional().default(0.15),
          security: z.number().min(0).max(1).optional().default(0.15),
          dependencies: z.number().min(0).max(1).optional().default(0.05),
        })
        .optional(),
    })
    .optional(),
  output: z
    .object({
      format: z.enum(['markdown', 'json', 'html']).optional().default('markdown'),
      directory: z.string().optional().default('./reports'),
      includeJson: z.boolean().optional().default(true),
    })
    .optional(),
});

export class ConfigManager {
  private config: Config;

  constructor(config?: Partial<Config>) {
    this.config = this.loadConfig(config);
    this.validateConfig();
  }

  private loadConfig(userConfig?: Partial<Config>): Config {
    const defaultConfig: Config = {
      github: {
        token: process.env.GITHUB_TOKEN || '',
        apiVersion: process.env.GITHUB_API_VERSION || '2022-11-28',
      },
      analysis: {
        minQualityScore: Number(process.env.MIN_QUALITY_SCORE) || 50,
        maxReposPerBatch: Number(process.env.MAX_REPOS_PER_BATCH) || 10,
        timeout: Number(process.env.ANALYSIS_TIMEOUT) || 30000,
        cache: {
          enabled: process.env.CACHE_ENABLED !== 'false',
          directory: process.env.CACHE_DIR || '.cache/administrator',
          ttl: Number(process.env.CACHE_TTL) || 86400,
        },
      },
      scoring: {
        weights: {
          codeQuality: 0.25,
          documentation: 0.2,
          testing: 0.2,
          community: 0.15,
          security: 0.15,
          dependencies: 0.05,
        },
      },
      output: {
        format: 'markdown',
        directory: './reports',
        includeJson: true,
      },
    };

    return this.mergeConfigs(defaultConfig, userConfig || {});
  }

  private mergeConfigs(defaults: Config, overrides: Partial<Config>): Config {
    return {
      github: { ...defaults.github, ...overrides.github },
      analysis: { ...defaults.analysis, ...overrides.analysis },
      scoring: {
        weights: {
          ...defaults.scoring?.weights,
          ...overrides.scoring?.weights,
        },
      },
      output: { ...defaults.output, ...overrides.output },
    };
  }

  private validateConfig(): void {
    try {
      ConfigZodSchema.parse(this.config);
      this.validateWeights();
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Configuration validation failed: ${error.message}`);
      }
      throw error;
    }
  }

  private validateWeights(): void {
    const weights = this.config.scoring?.weights;
    if (!weights) return;

    const sum = Object.values(weights).reduce(
      (acc: number, val: number | undefined) => acc + (val || 0),
      0
    );
    const tolerance = 0.01;

    if (Math.abs(sum - 1.0) > tolerance) {
      throw new Error(`Scoring weights must sum to 1.0 (currently: ${sum})`);
    }
  }

  public getConfig(): Config {
    return this.config;
  }

  public getGitHubToken(): string {
    if (!this.config.github.token) {
      throw new Error('GitHub token is required. Set GITHUB_TOKEN environment variable.');
    }
    return this.config.github.token;
  }

  public static getSchema(): typeof configSchema {
    return configSchema;
  }
}

export default ConfigManager;
