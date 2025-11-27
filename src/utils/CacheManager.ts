/**
 * Cache management for repository analysis results
 */

import { AnalysisResult } from '../types';
import * as fs from 'fs';
import * as path from 'path';

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

export class CacheManager {
  private memoryCache: Map<string, CacheEntry<unknown>> = new Map();
  private diskCachePath: string | null = null;
  private defaultTTL: number; // Default TTL in milliseconds

  constructor(diskCachePath?: string, defaultTTL: number = 24 * 60 * 60 * 1000) {
    // Default TTL: 24 hours
    this.diskCachePath = diskCachePath || null;
    this.defaultTTL = defaultTTL;

    // Create disk cache directory if specified
    if (this.diskCachePath && !fs.existsSync(this.diskCachePath)) {
      try {
        fs.mkdirSync(this.diskCachePath, { recursive: true });
      } catch (error) {
        console.warn(`Failed to create cache directory: ${error}`);
        this.diskCachePath = null;
      }
    }
  }

  /**
   * Get cached value
   */
  get<T>(key: string): T | null {
    // Check memory cache first
    const memEntry = this.memoryCache.get(key);
    if (memEntry && this.isValid(memEntry)) {
      return memEntry.data as T;
    }

    // Check disk cache if enabled
    if (this.diskCachePath) {
      const diskEntry = this.getFromDisk<T>(key);
      if (diskEntry && this.isValid(diskEntry)) {
        // Restore to memory cache
        this.memoryCache.set(key, diskEntry);
        return diskEntry.data;
      }
    }

    // Cache miss or expired
    this.delete(key);
    return null;
  }

  /**
   * Set cache value
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    };

    // Store in memory cache
    this.memoryCache.set(key, entry);

    // Store in disk cache if enabled
    if (this.diskCachePath) {
      this.saveToDisk(key, entry);
    }
  }

  /**
   * Delete cache entry
   */
  delete(key: string): void {
    this.memoryCache.delete(key);

    if (this.diskCachePath) {
      try {
        const filePath = this.getCacheFilePath(key);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        console.warn(`Failed to delete cache file: ${error}`);
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.memoryCache.clear();

    if (this.diskCachePath) {
      try {
        if (fs.existsSync(this.diskCachePath)) {
          fs.rmSync(this.diskCachePath, { recursive: true, force: true });
          fs.mkdirSync(this.diskCachePath, { recursive: true });
        }
      } catch (error) {
        console.warn(`Failed to clear disk cache: ${error}`);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    memoryItems: number;
    diskItems: number;
    totalSize: number;
  } {
    const memoryItems = this.memoryCache.size;
    let diskItems = 0;
    let totalSize = 0;

    if (this.diskCachePath && fs.existsSync(this.diskCachePath)) {
      try {
        const files = fs.readdirSync(this.diskCachePath);
        diskItems = files.length;

        for (const file of files) {
          const filePath = path.join(this.diskCachePath, file);
          const stats = fs.statSync(filePath);
          totalSize += stats.size;
        }
      } catch (error) {
        console.warn(`Failed to get cache stats: ${error}`);
      }
    }

    return {
      memoryItems,
      diskItems,
      totalSize,
    };
  }

  /**
   * Get cache key for repository
   */
  static getRepositoryKey(owner: string, repo: string): string {
    return `repo:${owner}/${repo}`;
  }

  /**
   * Check if cache entry is valid (not expired)
   */
  private isValid(entry: CacheEntry<unknown>): boolean {
    const age = Date.now() - entry.timestamp;
    return age < entry.ttl;
  }

  /**
   * Get file path for disk cache
   */
  private getCacheFilePath(key: string): string {
    // Create a safe filename from the key
    const safeKey = key.replace(/[\/\\:*?"<>|]/g, '_');
    return path.join(this.diskCachePath!, `${safeKey}.json`);
  }

  /**
   * Save entry to disk
   */
  private saveToDisk<T>(key: string, entry: CacheEntry<T>): void {
    if (!this.diskCachePath) return;

    try {
      const filePath = this.getCacheFilePath(key);
      fs.writeFileSync(filePath, JSON.stringify(entry, null, 2));
    } catch (error) {
      console.warn(`Failed to save cache to disk: ${error}`);
    }
  }

  /**
   * Load entry from disk
   */
  private getFromDisk<T>(key: string): CacheEntry<T> | null {
    if (!this.diskCachePath) return null;

    try {
      const filePath = this.getCacheFilePath(key);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(content) as CacheEntry<T>;
      }
    } catch (error) {
      console.warn(`Failed to load cache from disk: ${error}`);
    }

    return null;
  }
}

export default CacheManager;
