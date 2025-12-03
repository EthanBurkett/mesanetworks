import { env } from "@/config/env";
import Redis from "ioredis";

let redisClient: Redis | null = null;

export function getRedisClient(): Redis | null {
  return redisClient;
}

export function initRedisClient(url?: string): Redis {
  if (redisClient) {
    return redisClient;
  }

  try {
    const redisUrl = url || env.REDIS_URI || "redis://localhost:6379";

    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 3) {
          console.error("Redis connection failed after 3 retries");
          return null; // Stop retrying
        }
        return Math.min(times * 200, 2000); // Exponential backoff
      },
      lazyConnect: true, // Don't connect immediately
    });

    redisClient.on("error", (err) => {
      console.error("Redis connection error:", err);
    });

    redisClient.on("connect", () => {
      console.log("Redis connected successfully");
    });

    return redisClient;
  } catch (error) {
    console.error("Failed to initialize Redis client:", error);
    throw error;
  }
}

export async function connectRedis(): Promise<boolean> {
  if (!redisClient) {
    console.error("Redis client not initialized");
    return false;
  }

  try {
    // Check if already connected
    if (redisClient.status === "ready" || redisClient.status === "connect") {
      console.log("Redis already connected");
      return true;
    }

    // Check if already connecting
    if (redisClient.status === "connecting") {
      console.log("Redis is already connecting, waiting...");
      // Wait for connection to complete
      await new Promise((resolve) => {
        redisClient!.once("ready", resolve);
      });
      return true;
    }

    await redisClient.connect();
    return true;
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
    return false;
  }
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}

export async function isRedisConnected(): Promise<boolean> {
  if (!redisClient) {
    return false;
  }

  try {
    await redisClient.ping();
    return true;
  } catch (error) {
    return false;
  }
}
