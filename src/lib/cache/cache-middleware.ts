import { NextRequest } from "next/server";
import { cacheService } from "./cache-service";

export interface CacheConfig {
  enabled?: boolean;
  ttl?: number; // Override default TTL
  key?: string; // Custom cache key
  keyGenerator?: (request: NextRequest, context?: any) => string;
  invalidatePatterns?: string[]; // Patterns to invalidate on mutation
}

/**
 * Cache wrapper for GET requests
 * Use this to cache the response of GET endpoints
 */
export async function withCache<T>(
  config: CacheConfig,
  handler: () => Promise<T>,
  request?: NextRequest
): Promise<T> {
  // Skip cache if disabled or not a GET request
  if (config.enabled === false || (request && request.method !== "GET")) {
    return handler();
  }

  // Ensure cache is initialized
  if (!cacheService.isEnabled()) {
    await cacheService.initialize();
  }

  // If still not enabled (e.g., Redis down), skip cache
  if (!cacheService.isEnabled()) {
    return handler();
  }

  // Generate cache key
  let cacheKey: string;
  if (config.key) {
    cacheKey = config.key;
  } else if (config.keyGenerator && request) {
    cacheKey = config.keyGenerator(request);
  } else if (request) {
    // Default: use URL as cache key
    cacheKey = cacheService.generateCacheKey("api", request.url);
  } else {
    // No request and no custom key, skip cache
    return handler();
  }

  // Try to get from cache
  const cached = await cacheService.get<T>(cacheKey);
  if (cached !== null) {
    console.log(`Cache HIT for key: ${cacheKey}`);
    return cached;
  }

  console.log(`Cache MISS for key: ${cacheKey}`);

  // Execute handler and cache result
  const result = await handler();
  await cacheService.set(cacheKey, result, { ttl: config.ttl });

  return result;
}

/**
 * Invalidate cache patterns after mutation
 * Use this in POST, PUT, PATCH, DELETE endpoints
 */
export async function invalidateCache(
  patterns: string | string[]
): Promise<void> {
  if (!cacheService.isEnabled()) {
    return;
  }

  const patternArray = Array.isArray(patterns) ? patterns : [patterns];

  for (const pattern of patternArray) {
    await cacheService.deletePattern(pattern);
    console.log(`Cache invalidated for pattern: ${pattern}`);
  }
}

/**
 * Helper to generate cache keys for common patterns
 */
export const CacheKeys = {
  users: {
    list: (filters?: any) =>
      cacheService.generateCacheKey("users:list", filters || {}),
    detail: (id: string) => `users:detail:${id}`,
    all: () => "users:*",
  },
  roles: {
    list: () => "roles:list",
    detail: (id: string) => `roles:detail:${id}`,
    all: () => "roles:*",
  },
  auditLogs: {
    list: (filters?: any) =>
      cacheService.generateCacheKey("audit:list", filters || {}),
    stats: () => "audit:stats",
    all: () => "audit:*",
  },
  settings: {
    get: () => "settings:config",
    all: () => "settings:*",
  },
};
