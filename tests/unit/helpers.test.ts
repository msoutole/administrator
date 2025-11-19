/**
 * Tests for utility helper functions
 */

import {
  parseRepositoryUrl,
  validateRepositoryUrl,
  formatRepositoryUrl,
  calculateGrade,
  formatDuration,
  sanitizeFilename,
} from '../../src/utils/helpers';

describe('helpers', () => {
  describe('parseRepositoryUrl', () => {
    it('should parse full GitHub URLs', () => {
      const result = parseRepositoryUrl('https://github.com/owner/repo');
      expect(result).toEqual({ owner: 'owner', name: 'repo' });
    });

    it('should parse short format (owner/repo)', () => {
      const result = parseRepositoryUrl('owner/repo');
      expect(result).toEqual({ owner: 'owner', name: 'repo' });
    });

    it('should handle .git suffix', () => {
      const result = parseRepositoryUrl('https://github.com/owner/repo.git');
      expect(result).toEqual({ owner: 'owner', name: 'repo' });
    });

    it('should throw error for invalid format', () => {
      expect(() => parseRepositoryUrl('invalid')).toThrow('Invalid repository format');
    });

    it('should handle repository names with dots', () => {
      const result = parseRepositoryUrl('owner/repo.name');
      expect(result).toEqual({ owner: 'owner', name: 'repo.name' });
    });

    it('should handle repository names with hyphens', () => {
      const result = parseRepositoryUrl('owner/repo-name');
      expect(result).toEqual({ owner: 'owner', name: 'repo-name' });
    });
  });

  describe('validateRepositoryUrl', () => {
    it('should return true for valid URLs', () => {
      expect(validateRepositoryUrl('https://github.com/owner/repo')).toBe(true);
      expect(validateRepositoryUrl('owner/repo')).toBe(true);
    });

    it('should return false for invalid URLs', () => {
      expect(validateRepositoryUrl('invalid')).toBe(false);
      expect(validateRepositoryUrl('')).toBe(false);
    });
  });

  describe('formatRepositoryUrl', () => {
    it('should format owner and name into GitHub URL', () => {
      const result = formatRepositoryUrl('owner', 'repo');
      expect(result).toBe('https://github.com/owner/repo');
    });
  });

  describe('calculateGrade', () => {
    it('should return A for scores 90-100', () => {
      expect(calculateGrade(90)).toBe('A');
      expect(calculateGrade(95)).toBe('A');
      expect(calculateGrade(100)).toBe('A');
    });

    it('should return B for scores 80-89', () => {
      expect(calculateGrade(80)).toBe('B');
      expect(calculateGrade(85)).toBe('B');
      expect(calculateGrade(89)).toBe('B');
    });

    it('should return C for scores 70-79', () => {
      expect(calculateGrade(70)).toBe('C');
      expect(calculateGrade(75)).toBe('C');
      expect(calculateGrade(79)).toBe('C');
    });

    it('should return D for scores 60-69', () => {
      expect(calculateGrade(60)).toBe('D');
      expect(calculateGrade(65)).toBe('D');
      expect(calculateGrade(69)).toBe('D');
    });

    it('should return F for scores below 60', () => {
      expect(calculateGrade(0)).toBe('F');
      expect(calculateGrade(30)).toBe('F');
      expect(calculateGrade(59)).toBe('F');
    });
  });

  describe('formatDuration', () => {
    it('should format seconds correctly', () => {
      expect(formatDuration(5000)).toBe('5s');
      expect(formatDuration(30000)).toBe('30s');
    });

    it('should format minutes and seconds', () => {
      expect(formatDuration(65000)).toBe('1m 5s');
      expect(formatDuration(125000)).toBe('2m 5s');
    });

    it('should format hours, minutes, and seconds', () => {
      expect(formatDuration(3665000)).toBe('1h 1m 5s');
    });

    it('should handle zero', () => {
      expect(formatDuration(0)).toBe('0s');
    });
  });

  describe('sanitizeFilename', () => {
    it('should replace invalid characters with underscores', () => {
      expect(sanitizeFilename('file/name:test')).toBe('file_name_test');
      expect(sanitizeFilename('test*file?name')).toBe('test_file_name');
    });

    it('should keep valid characters', () => {
      expect(sanitizeFilename('valid-file_name123')).toBe('valid-file_name123');
    });

    it('should handle empty string', () => {
      expect(sanitizeFilename('')).toBe('');
    });
  });
});
