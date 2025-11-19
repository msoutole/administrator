"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("../../src/utils/helpers");
describe('helpers', () => {
    describe('parseRepositoryUrl', () => {
        it('should parse full GitHub URLs', () => {
            const result = (0, helpers_1.parseRepositoryUrl)('https://github.com/owner/repo');
            expect(result).toEqual({ owner: 'owner', name: 'repo' });
        });
        it('should parse short format (owner/repo)', () => {
            const result = (0, helpers_1.parseRepositoryUrl)('owner/repo');
            expect(result).toEqual({ owner: 'owner', name: 'repo' });
        });
        it('should handle .git suffix', () => {
            const result = (0, helpers_1.parseRepositoryUrl)('https://github.com/owner/repo.git');
            expect(result).toEqual({ owner: 'owner', name: 'repo' });
        });
        it('should throw error for invalid format', () => {
            expect(() => (0, helpers_1.parseRepositoryUrl)('invalid')).toThrow('Invalid repository format');
        });
        it('should handle repository names with dots', () => {
            const result = (0, helpers_1.parseRepositoryUrl)('owner/repo.name');
            expect(result).toEqual({ owner: 'owner', name: 'repo.name' });
        });
        it('should handle repository names with hyphens', () => {
            const result = (0, helpers_1.parseRepositoryUrl)('owner/repo-name');
            expect(result).toEqual({ owner: 'owner', name: 'repo-name' });
        });
    });
    describe('validateRepositoryUrl', () => {
        it('should return true for valid URLs', () => {
            expect((0, helpers_1.validateRepositoryUrl)('https://github.com/owner/repo')).toBe(true);
            expect((0, helpers_1.validateRepositoryUrl)('owner/repo')).toBe(true);
        });
        it('should return false for invalid URLs', () => {
            expect((0, helpers_1.validateRepositoryUrl)('invalid')).toBe(false);
            expect((0, helpers_1.validateRepositoryUrl)('')).toBe(false);
        });
    });
    describe('formatRepositoryUrl', () => {
        it('should format owner and name into GitHub URL', () => {
            const result = (0, helpers_1.formatRepositoryUrl)('owner', 'repo');
            expect(result).toBe('https://github.com/owner/repo');
        });
    });
    describe('calculateGrade', () => {
        it('should return A for scores 90-100', () => {
            expect((0, helpers_1.calculateGrade)(90)).toBe('A');
            expect((0, helpers_1.calculateGrade)(95)).toBe('A');
            expect((0, helpers_1.calculateGrade)(100)).toBe('A');
        });
        it('should return B for scores 80-89', () => {
            expect((0, helpers_1.calculateGrade)(80)).toBe('B');
            expect((0, helpers_1.calculateGrade)(85)).toBe('B');
            expect((0, helpers_1.calculateGrade)(89)).toBe('B');
        });
        it('should return C for scores 70-79', () => {
            expect((0, helpers_1.calculateGrade)(70)).toBe('C');
            expect((0, helpers_1.calculateGrade)(75)).toBe('C');
            expect((0, helpers_1.calculateGrade)(79)).toBe('C');
        });
        it('should return D for scores 60-69', () => {
            expect((0, helpers_1.calculateGrade)(60)).toBe('D');
            expect((0, helpers_1.calculateGrade)(65)).toBe('D');
            expect((0, helpers_1.calculateGrade)(69)).toBe('D');
        });
        it('should return F for scores below 60', () => {
            expect((0, helpers_1.calculateGrade)(0)).toBe('F');
            expect((0, helpers_1.calculateGrade)(30)).toBe('F');
            expect((0, helpers_1.calculateGrade)(59)).toBe('F');
        });
    });
    describe('formatDuration', () => {
        it('should format seconds correctly', () => {
            expect((0, helpers_1.formatDuration)(5000)).toBe('5s');
            expect((0, helpers_1.formatDuration)(30000)).toBe('30s');
        });
        it('should format minutes and seconds', () => {
            expect((0, helpers_1.formatDuration)(65000)).toBe('1m 5s');
            expect((0, helpers_1.formatDuration)(125000)).toBe('2m 5s');
        });
        it('should format hours, minutes, and seconds', () => {
            expect((0, helpers_1.formatDuration)(3665000)).toBe('1h 1m 5s');
        });
        it('should handle zero', () => {
            expect((0, helpers_1.formatDuration)(0)).toBe('0s');
        });
    });
    describe('sanitizeFilename', () => {
        it('should replace invalid characters with underscores', () => {
            expect((0, helpers_1.sanitizeFilename)('file/name:test')).toBe('file_name_test');
            expect((0, helpers_1.sanitizeFilename)('test*file?name')).toBe('test_file_name');
        });
        it('should keep valid characters', () => {
            expect((0, helpers_1.sanitizeFilename)('valid-file_name123')).toBe('valid-file_name123');
        });
        it('should handle empty string', () => {
            expect((0, helpers_1.sanitizeFilename)('')).toBe('');
        });
    });
});
//# sourceMappingURL=helpers.test.js.map