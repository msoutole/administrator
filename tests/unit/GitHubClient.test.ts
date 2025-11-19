/**
 * Tests for GitHubClient
 */

import { GitHubClient } from '../../src/utils/GitHubClient';

// Mock the Octokit module
jest.mock('@octokit/rest', () => {
  return {
    Octokit: jest.fn().mockImplementation(() => {
      return {
        repos: {
          get: jest.fn(),
          getContent: jest.fn(),
          listContributors: jest.fn(),
          listLanguages: jest.fn(),
        },
      };
    }),
  };
});

describe('GitHubClient', () => {
  let client: GitHubClient;
  let mockOctokit: any;

  beforeEach(() => {
    client = new GitHubClient('test-token');
    mockOctokit = (client as any).octokit;
  });

  describe('getRepositoryInfo', () => {
    it('should fetch repository information', async () => {
      const mockRepoData = {
        owner: { login: 'testowner' },
        name: 'testrepo',
        html_url: 'https://github.com/testowner/testrepo',
        description: 'Test repository',
        language: 'TypeScript',
        stargazers_count: 100,
        forks_count: 20,
        open_issues_count: 5,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        license: { spdx_id: 'MIT' },
      };

      mockOctokit.repos.get.mockResolvedValue({ data: mockRepoData });

      const result = await client.getRepositoryInfo('testowner/testrepo');

      expect(result.owner).toBe('testowner');
      expect(result.name).toBe('testrepo');
      expect(result.stars).toBe(100);
      expect(result.language).toBe('TypeScript');
    });

    it('should handle repository fetch errors', async () => {
      mockOctokit.repos.get.mockRejectedValue(new Error('Not found'));

      await expect(client.getRepositoryInfo('invalid/repo')).rejects.toThrow(
        'Failed to fetch repository info'
      );
    });
  });

  describe('getFileContent', () => {
    it('should fetch file content', async () => {
      const mockContent = Buffer.from('Test content').toString('base64');
      mockOctokit.repos.getContent.mockResolvedValue({
        data: { content: mockContent },
      });

      const result = await client.getFileContent('owner', 'repo', 'README.md');

      expect(result).toBe('Test content');
    });

    it('should return null for non-existent files', async () => {
      mockOctokit.repos.getContent.mockRejectedValue(new Error('Not found'));

      const result = await client.getFileContent('owner', 'repo', 'nonexistent.md');

      expect(result).toBeNull();
    });
  });

  describe('hasFile', () => {
    it('should return true if file exists', async () => {
      mockOctokit.repos.getContent.mockResolvedValue({ data: {} });

      const result = await client.hasFile('owner', 'repo', 'README.md');

      expect(result).toBe(true);
    });

    it('should return false if file does not exist', async () => {
      mockOctokit.repos.getContent.mockRejectedValue(new Error('Not found'));

      const result = await client.hasFile('owner', 'repo', 'nonexistent.md');

      expect(result).toBe(false);
    });
  });

  describe('getContributors', () => {
    it('should return contributor count', async () => {
      mockOctokit.repos.listContributors.mockResolvedValue({
        data: new Array(15).fill({}),
      });

      const result = await client.getContributors('owner', 'repo');

      expect(result).toBe(15);
    });

    it('should return 0 on error', async () => {
      mockOctokit.repos.listContributors.mockRejectedValue(new Error('Error'));

      const result = await client.getContributors('owner', 'repo');

      expect(result).toBe(0);
    });
  });

  describe('getLanguages', () => {
    it('should return language statistics', async () => {
      const mockLanguages = {
        TypeScript: 1000,
        JavaScript: 500,
      };
      mockOctokit.repos.listLanguages.mockResolvedValue({ data: mockLanguages });

      const result = await client.getLanguages('owner', 'repo');

      expect(result).toEqual(mockLanguages);
    });

    it('should return empty object on error', async () => {
      mockOctokit.repos.listLanguages.mockRejectedValue(new Error('Error'));

      const result = await client.getLanguages('owner', 'repo');

      expect(result).toEqual({});
    });
  });
});
