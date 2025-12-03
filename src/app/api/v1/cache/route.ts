import { NextRequest } from "next/server";
import { wrapper } from "@/lib/api-utils";
import { cacheService } from "@/lib/cache";
import { Permission } from "@/lib/rbac";

// GET /api/v1/cache/stats - Get cache statistics
export async function GET(request: NextRequest) {
  return wrapper(
    {
      request,
      requirePermission: Permission.SETTINGS_READ,
    },
    async () => {
      // Ensure cache is initialized before getting stats
      if (!cacheService.isEnabled()) {
        await cacheService.initialize();
      }
      const stats = await cacheService.getStats();
      return stats;
    }
  );
}

// DELETE /api/v1/cache - Clear all cache
export async function DELETE(request: NextRequest) {
  return wrapper(
    {
      request,
      requirePermission: Permission.SETTINGS_WRITE,
    },
    async () => {
      await cacheService.clear();
      return { message: "Cache cleared successfully" };
    }
  );
}
