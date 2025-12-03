# Cache Middleware Usage

The cache middleware provides `withCache` and `invalidateCache` functions to add caching to API routes.

## Basic Usage

### GET Requests (with caching)

```typescript
import { wrapper } from "@/lib/api-utils";
import { withCache, CacheKeys, invalidateCache } from "@/lib/cache";
import { RoleQueries } from "@/lib/db/models/Role.model";
import { Permission } from "@/lib/rbac";
import { NextRequest } from "next/server";

export const GET = (request: NextRequest) =>
  wrapper(
    {
      request,
      requirePermission: Permission.ROLE_READ,
    },
    async () => {
      // Wrap the database query with cache
      return withCache(
        {
          key: CacheKeys.roles.list(),
          ttl: 300, // 5 minutes
        },
        async () => {
          return (await RoleQueries.listAll()).sort(
            (a, b) => b.hierarchyLevel - a.hierarchyLevel
          );
        },
        request
      );
    }
  );
```

### POST/PUT/DELETE Requests (with cache invalidation)

```typescript
export const POST = (request: NextRequest) =>
  wrapper(
    {
      request,
      requirePermission: Permission.ROLE_CREATE,
      parser: roleSchema,
    },
    async ({ body, auth }) => {
      const role = await RoleMutations.createRole(body);

      // Invalidate cache after mutation
      await invalidateCache([
        CacheKeys.roles.all(), // Invalidate all role cache keys
      ]);

      await AuditLogger.logRoleCreate(
        { roleName: body.name, createdBy: auth! },
        role._id,
        request
      );

      return role;
    }
  );
```

## Cache Key Patterns

Pre-defined cache key generators are available in `CacheKeys`:

```typescript
CacheKeys.users.list(filters); // "users:list:hash"
CacheKeys.users.detail(id); // "users:detail:123"
CacheKeys.users.all(); // "users:*"

CacheKeys.roles.list(); // "roles:list"
CacheKeys.roles.detail(id); // "roles:detail:456"
CacheKeys.roles.all(); // "roles:*"

CacheKeys.auditLogs.list(filters); // "audit:list:hash"
CacheKeys.auditLogs.stats(); // "audit:stats"
CacheKeys.auditLogs.all(); // "audit:*"

CacheKeys.settings.get(); // "settings:config"
CacheKeys.settings.all(); // "settings:*"
```

## Advanced Usage

### Custom Cache Key Generator

```typescript
export const GET = (request: NextRequest) =>
  wrapper(
    {
      request,
      requirePermission: Permission.USER_READ,
    },
    async () => {
      const url = new URL(request.url);
      const page = url.searchParams.get("page") || "1";
      const limit = url.searchParams.get("limit") || "10";

      return withCache(
        {
          keyGenerator: (req) => {
            const params = new URL(req.url).searchParams;
            return `users:list:${params.toString()}`;
          },
          ttl: 600, // 10 minutes
        },
        async () => {
          return UserQueries.paginate({ page, limit });
        },
        request
      );
    }
  );
```

### Conditional Caching

```typescript
export const GET = (request: NextRequest) =>
  wrapper(
    {
      request,
      requirePermission: Permission.AUDIT_READ,
    },
    async () => {
      const url = new URL(request.url);
      const realtime = url.searchParams.get("realtime") === "true";

      return withCache(
        {
          enabled: !realtime, // Only cache if not realtime
          key: CacheKeys.auditLogs.list({ realtime }),
          ttl: 120,
        },
        async () => {
          return AuditLogQueries.getRecentLogs();
        },
        request
      );
    }
  );
```

### Multiple Pattern Invalidation

```typescript
export const PUT = (request: NextRequest, { params }: RouteParams) =>
  wrapper(
    {
      request,
      requirePermission: Permission.USER_UPDATE,
      parser: userUpdateSchema,
    },
    async ({ body }) => {
      const user = await UserMutations.updateUser(params.id, body);

      // Invalidate multiple cache patterns
      await invalidateCache([
        CacheKeys.users.detail(params.id), // Specific user
        CacheKeys.users.list(), // User lists
        `users:stats:*`, // User stats
      ]);

      return user;
    }
  );
```

## How It Works

1. **GET Request Flow**:

   - `withCache` checks if cache is enabled
   - Generates cache key from config
   - Tries to retrieve from Redis
   - On cache hit: returns cached value immediately
   - On cache miss: executes handler, stores result, returns value

2. **Mutation Flow**:

   - Execute mutation (POST/PUT/DELETE)
   - Call `invalidateCache` with patterns
   - Deletes matching keys from Redis
   - Next GET request will fetch fresh data

3. **Cache Key Generation**:
   - Uses MD5 hash of request URL or custom data
   - Supports wildcard patterns for bulk invalidation
   - Namespaced by resource type (users:_, roles:_, etc.)

## Best Practices

1. **Cache GET endpoints only**: POST/PUT/DELETE should not be cached
2. **Use appropriate TTL**: Short TTL (1-5 min) for frequently changing data, longer (10-60 min) for stable data
3. **Invalidate on mutations**: Always invalidate related cache keys after mutations
4. **Use wildcard patterns**: Invalidate entire resource cache (e.g., `users:*`) when structure changes
5. **Monitor cache stats**: Check cache hit rate in Advanced Settings to tune TTL values

## Example: Complete CRUD with Caching

```typescript
// GET /api/v1/users
export const GET = (request: NextRequest) =>
  wrapper({ request, requirePermission: Permission.USER_READ }, async () => {
    return withCache(
      {
        key: CacheKeys.users.list(),
        ttl: 300,
      },
      async () => UserQueries.listAll(),
      request
    );
  });

// POST /api/v1/users
export const POST = (request: NextRequest) =>
  wrapper(
    { request, requirePermission: Permission.USER_CREATE, parser: userSchema },
    async ({ body }) => {
      const user = await UserMutations.createUser(body);
      await invalidateCache(CacheKeys.users.all());
      return user;
    }
  );

// GET /api/v1/users/[id]
export const GET = (request: NextRequest, { params }: RouteParams) =>
  wrapper({ request, requirePermission: Permission.USER_READ }, async () => {
    return withCache(
      {
        key: CacheKeys.users.detail(params.id),
        ttl: 600,
      },
      async () => UserQueries.getById(params.id),
      request
    );
  });

// PUT /api/v1/users/[id]
export const PUT = (request: NextRequest, { params }: RouteParams) =>
  wrapper(
    { request, requirePermission: Permission.USER_UPDATE, parser: userSchema },
    async ({ body }) => {
      const user = await UserMutations.updateUser(params.id, body);
      await invalidateCache([
        CacheKeys.users.detail(params.id),
        CacheKeys.users.list(),
      ]);
      return user;
    }
  );

// DELETE /api/v1/users/[id]
export const DELETE = (request: NextRequest, { params }: RouteParams) =>
  wrapper({ request, requirePermission: Permission.USER_DELETE }, async () => {
    await UserMutations.deleteUser(params.id);
    await invalidateCache(CacheKeys.users.all());
    return { success: true };
  });
```
