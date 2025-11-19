/**
 * Utility functions for repository URL parsing and validation
 */

export interface ParsedRepository {
  owner: string;
  name: string;
}

export function parseRepositoryUrl(input: string): ParsedRepository {
  // Handle full GitHub URLs
  const urlPattern =
    /^https?:\/\/github\.com\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_.-]+?)(?:\.git)?(?:\/.*)?$/;
  const urlMatch = input.match(urlPattern);

  if (urlMatch) {
    return {
      owner: urlMatch[1],
      name: urlMatch[2],
    };
  }

  // Handle owner/repo format
  const shortPattern = /^([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_.-]+)$/;
  const shortMatch = input.match(shortPattern);

  if (shortMatch) {
    return {
      owner: shortMatch[1],
      name: shortMatch[2],
    };
  }

  throw new Error(`Invalid repository format: ${input}`);
}

export function validateRepositoryUrl(input: string): boolean {
  try {
    parseRepositoryUrl(input);
    return true;
  } catch {
    return false;
  }
}

export function formatRepositoryUrl(owner: string, name: string): string {
  return `https://github.com/${owner}/${name}`;
}

export function calculateGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9_-]/g, '_');
}
