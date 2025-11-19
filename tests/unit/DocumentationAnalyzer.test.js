"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DocumentationAnalyzer_1 = require("../../src/analyzers/DocumentationAnalyzer");
const GitHubClient_1 = require("../../src/utils/GitHubClient");
jest.mock('../../src/utils/GitHubClient');
describe('DocumentationAnalyzer', () => {
    let mockGitHubClient;
    let analyzer;
    beforeEach(() => {
        mockGitHubClient = new GitHubClient_1.GitHubClient('token');
        analyzer = new DocumentationAnalyzer_1.DocumentationAnalyzer(mockGitHubClient);
    });
    describe('analyze', () => {
        it('should analyze repository documentation', async () => {
            const readmeContent = `# Test Repo
      
This is a test repository.

## Installation

\`\`\`bash
npm install
\`\`\`

## Usage

Example usage here.
`;
            mockGitHubClient.hasFile = jest
                .fn()
                .mockResolvedValueOnce(true)
                .mockResolvedValueOnce(true)
                .mockResolvedValueOnce(true)
                .mockResolvedValueOnce(true)
                .mockResolvedValueOnce(true);
            mockGitHubClient.getFileContent = jest.fn().mockResolvedValue(readmeContent);
            const result = await analyzer.analyze('owner', 'repo');
            expect(result.hasReadme).toBe(true);
            expect(result.hasContributing).toBe(true);
            expect(result.hasLicense).toBe(true);
            expect(result.hasChangelog).toBe(true);
            expect(result.apiDocumentation).toBe(true);
            expect(result.readmeQuality).toBeGreaterThan(50);
        });
        it('should handle missing documentation files', async () => {
            mockGitHubClient.hasFile = jest.fn().mockResolvedValue(false);
            mockGitHubClient.getFileContent = jest.fn().mockResolvedValue(null);
            const result = await analyzer.analyze('owner', 'repo');
            expect(result.hasReadme).toBe(false);
            expect(result.hasContributing).toBe(false);
            expect(result.hasLicense).toBe(false);
            expect(result.hasChangelog).toBe(false);
            expect(result.apiDocumentation).toBe(false);
            expect(result.readmeQuality).toBe(0);
        });
        it('should calculate README quality correctly', async () => {
            const highQualityReadme = `# Awesome Project

![Build Status](badge.png)

A comprehensive project description.

## Installation

\`\`\`bash
npm install awesome-project
\`\`\`

## Usage

\`\`\`javascript
const awesome = require('awesome-project');
awesome.doSomething();
\`\`\`

See [documentation](https://docs.example.com) for more details.
`;
            mockGitHubClient.hasFile = jest.fn().mockResolvedValue(true);
            mockGitHubClient.getFileContent = jest.fn().mockResolvedValue(highQualityReadme);
            const result = await analyzer.analyze('owner', 'repo');
            expect(result.readmeQuality).toBeGreaterThan(80);
        });
        it('should handle short README with lower quality score', async () => {
            const shortReadme = '# Short';
            mockGitHubClient.hasFile = jest.fn().mockResolvedValue(true);
            mockGitHubClient.getFileContent = jest.fn().mockResolvedValue(shortReadme);
            const result = await analyzer.analyze('owner', 'repo');
            expect(result.readmeQuality).toBeLessThan(50);
        });
    });
});
//# sourceMappingURL=DocumentationAnalyzer.test.js.map