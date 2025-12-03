import { getRedisClient, initRedisClient, connectRedis } from "./redis-client";
import { SettingsQueries } from "../db/models/Settings.model";
import { createHash } from "crypto";

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  compress?: boolean;
}

export class CacheService {
  private static instance: CacheService;
  private enabled = false;
  private defaultTTL = 300; // 5 minutes

  private constructor() {}

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  async initialize(): Promise<void> {
    try {
      const settings = await SettingsQueries.getSettings();
      this.enabled = settings.cache.enabled;
      this.defaultTTL = settings.cache.ttl;

      if (this.enabled) {
        const redisUrl = settings.cache.redisUrl || process.env.REDIS_URL;
        const client = initRedisClient(redisUrl);

        // Only connect if not already connected/connecting
        if (client.status !== "ready" && client.status !== "connecting") {
          const connected = await connectRedis();
          if (!connected) {
            console.warn("Redis connection failed, cache will be disabled");
            this.enabled = false;
          } else {
            console.log("Cache service initialized successfully");
          }
        } else {
          console.log("Redis already connected, cache service ready");
        }
      }
    } catch (error) {
      console.error("Failed to initialize cache service:", error);
      this.enabled = false;
    }
  }

  async reinitialize(): Promise<void> {
    // Disconnect existing client if any
    const redis = getRedisClient();
    if (redis && redis.status === "ready") {
      try {
        await redis.quit();
      } catch (err) {
        console.error("Error disconnecting Redis:", err);
      }
    }

    // Re-initialize
    await this.initialize();
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  async get<T = any>(key: string): Promise<T | null> {
    if (!this.enabled) {
      return null;
    }

    const redis = getRedisClient();
    if (!redis) {
      return null;
    }

    try {
      const value = await redis.get(key);
      if (!value) {
        return null;
      }

      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: any, options?: CacheOptions): Promise<void> {
    if (!this.enabled) {
      return;
    }

    const redis = getRedisClient();
    if (!redis) {
      return;
    }

    try {
      const ttl = options?.ttl || this.defaultTTL;
      const serialized = JSON.stringify(value);
      await redis.setex(key, ttl, serialized);
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.enabled) {
      return;
    }

    const redis = getRedisClient();
    if (!redis) {
      return;
    }

    try {
      await redis.del(key);
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
    }
  }

  async deletePattern(pattern: string): Promise<void> {
    if (!this.enabled) {
      return;
    }

    const redis = getRedisClient();
    if (!redis) {
      return;
    }

    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error(`Cache delete pattern error for ${pattern}:`, error);
    }
  }

  async clear(): Promise<void> {
    if (!this.enabled) {
      return;
    }

    const redis = getRedisClient();
    if (!redis) {
      return;
    }

    try {
      await redis.flushdb();
    } catch (error) {
      console.error("Cache clear error:", error);
    }
  }

  async getStats(): Promise<{
    enabled: boolean;
    connected: boolean;
    keys: number;
    memory: string;
  }> {
    const redis = getRedisClient();

    if (!this.enabled || !redis) {
      return {
        enabled: this.enabled,
        connected: false,
        keys: 0,
        memory: "0 MB",
      };
    }

    // Check Redis status first
    const isConnected = redis.status === "ready";

    if (!isConnected) {
      return {
        enabled: this.enabled,
        connected: false,
        keys: 0,
        memory: "0 MB",
      };
    }

    try {
      const [info, dbSize] = await Promise.all([
        redis.info("memory"),
        redis.dbsize(),
      ]);

      // Parse memory usage from info
      const memoryMatch = info.match(/used_memory_human:([^\r\n]+)/);
      const memory = memoryMatch ? memoryMatch[1] : "Unknown";

      return {
        enabled: this.enabled,
        connected: true,
        keys: dbSize,
        memory,
      };
    } catch (error) {
      console.error("Failed to get cache stats:", error);
      return {
        enabled: this.enabled,
        connected: false,
        keys: 0,
        memory: "Unknown",
      };
    }
  }

  generateCacheKey(prefix: string, ...args: any[]): string {
    const normalized = args.map((arg) =>
      typeof arg === "object" ? JSON.stringify(arg) : String(arg)
    );
    const input = normalized.join(":");
    const hash = createHash("md5").update(input).digest("hex");
    return `${prefix}:${hash}`;
  }
}

// Export singleton instance
export const cacheService = CacheService.getInstance();
