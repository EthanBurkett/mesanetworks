# Cache Setup

This application uses Redis for caching API responses and improving performance.

## Prerequisites

### Local Development with Docker

The easiest way to run Redis locally is using Docker:

```bash
# Run Redis in a Docker container
docker run -d --name redis -p 6379:6379 redis:alpine

# Or using docker-compose (create docker-compose.yml):
version: '3.8'
services:
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

volumes:
  redis-data:
```

### Without Docker

Install Redis on your system:

- **Windows**: Use WSL2 or install Redis from https://github.com/microsoftarchive/redis/releases
- **macOS**: `brew install redis && brew services start redis`
- **Linux**: `sudo apt-get install redis-server && sudo systemctl start redis`

## Configuration

Add Redis URL to your `.env.local` file:

```env
# Optional - defaults to redis://localhost:6379
REDIS_URL=redis://localhost:6379

# For Redis Cloud or other hosted services:
# REDIS_URL=redis://username:password@hostname:port
```

## Verify Connection

1. Navigate to `/admin/settings` in your application
2. Click on the "Advanced" tab
3. Check the "Cache Status" - it should show "Connected" with a green badge
4. View cache statistics including:
   - Cached Keys count
   - Memory usage

## Managing Cache

### Enable/Disable Cache

Toggle the "Enable Caching" switch in the Advanced settings tab.

### Adjust Cache TTL

Set how long cached data should be kept (10 seconds to 24 hours).

### Clear Cache

Use the "Clear All Cache" button in the Danger Zone to flush all cached data.

## Usage in Code

The cache service is automatically initialized when settings are loaded. To use caching in your API routes:

```typescript
import { cacheService } from "@/lib/cache";

// Get from cache
const cachedData = await cacheService.get("my-key");

// Set cache with custom TTL
await cacheService.set("my-key", data, { ttl: 600 }); // 10 minutes

// Delete specific key
await cacheService.delete("my-key");

// Delete keys by pattern
await cacheService.deletePattern("user:*");

// Clear all cache
await cacheService.clear();
```

## Production Deployment

For production, consider using a managed Redis service:

- **Upstash Redis** (Serverless, free tier available)
- **Redis Cloud** (Redis Labs)
- **AWS ElastiCache**
- **Azure Cache for Redis**
- **Google Cloud Memorystore**

Set your production Redis URL in environment variables.
