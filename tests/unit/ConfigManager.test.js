"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ConfigManager_1 = require("../../src/config/ConfigManager");
describe('ConfigManager', () => {
    const originalEnv = process.env;
    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
    });
    afterAll(() => {
        process.env = originalEnv;
    });
    describe('constructor', () => {
        it('should create instance with valid config', () => {
            const config = new ConfigManager_1.ConfigManager({
                github: { token: 'test-token' },
            });
            expect(config).toBeInstanceOf(ConfigManager_1.ConfigManager);
        });
        it('should load config from environment variables', () => {
            process.env.GITHUB_TOKEN = 'env-token';
            const config = new ConfigManager_1.ConfigManager();
            expect(config.getGitHubToken()).toBe('env-token');
        });
        it('should merge user config with defaults', () => {
            const config = new ConfigManager_1.ConfigManager({
                github: { token: 'test-token' },
                analysis: { minQualityScore: 75 },
            });
            const fullConfig = config.getConfig();
            expect(fullConfig.github.token).toBe('test-token');
            expect(fullConfig.analysis?.minQualityScore).toBe(75);
        });
        it('should throw error for invalid config', () => {
            expect(() => {
                new ConfigManager_1.ConfigManager({
                    github: { token: '' },
                });
            }).toThrow();
        });
        it('should validate scoring weights sum to 1.0', () => {
            expect(() => {
                new ConfigManager_1.ConfigManager({
                    github: { token: 'test-token' },
                    scoring: {
                        weights: {
                            codeQuality: 0.5,
                            documentation: 0.3,
                            testing: 0.1,
                            community: 0.1,
                            security: 0.1,
                            dependencies: 0.1,
                        },
                    },
                });
            }).toThrow('Scoring weights must sum to 1.0');
        });
    });
    describe('getConfig', () => {
        it('should return full config object', () => {
            const config = new ConfigManager_1.ConfigManager({
                github: { token: 'test-token' },
            });
            const fullConfig = config.getConfig();
            expect(fullConfig).toHaveProperty('github');
            expect(fullConfig).toHaveProperty('analysis');
            expect(fullConfig).toHaveProperty('scoring');
            expect(fullConfig).toHaveProperty('output');
        });
    });
    describe('getGitHubToken', () => {
        it('should return GitHub token', () => {
            const config = new ConfigManager_1.ConfigManager({
                github: { token: 'test-token' },
            });
            expect(config.getGitHubToken()).toBe('test-token');
        });
        it('should throw error if token is not set', () => {
            process.env.GITHUB_TOKEN = '';
            expect(() => {
                new ConfigManager_1.ConfigManager();
            }).toThrow('Configuration validation failed');
        });
    });
    describe('getSchema', () => {
        it('should return config schema', () => {
            const schema = ConfigManager_1.ConfigManager.getSchema();
            expect(schema).toHaveProperty('$schema');
            expect(schema).toHaveProperty('properties');
            expect(schema.type).toBe('object');
        });
    });
    describe('default values', () => {
        it('should use default values when not provided', () => {
            const config = new ConfigManager_1.ConfigManager({
                github: { token: 'test-token' },
            });
            const fullConfig = config.getConfig();
            expect(fullConfig.analysis?.minQualityScore).toBe(50);
            expect(fullConfig.analysis?.maxReposPerBatch).toBe(10);
            expect(fullConfig.output?.format).toBe('markdown');
        });
    });
    describe('validation', () => {
        it('should validate minQualityScore range', () => {
            expect(() => {
                new ConfigManager_1.ConfigManager({
                    github: { token: 'test-token' },
                    analysis: { minQualityScore: 150 },
                });
            }).toThrow();
        });
        it('should validate maxReposPerBatch range', () => {
            expect(() => {
                new ConfigManager_1.ConfigManager({
                    github: { token: 'test-token' },
                    analysis: { maxReposPerBatch: 0 },
                });
            }).toThrow();
        });
    });
});
//# sourceMappingURL=ConfigManager.test.js.map