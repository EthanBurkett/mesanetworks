import { NextRequest } from "next/server";
import { wrapper } from "@/lib/api-utils";
import { cacheService } from "@/lib/cache";
import { Permission } from "@/lib/rbac";

// POST /api/v1/cache/init - Initialize cache service
export async function POST(request: NextRequest) {
  return wrapper(
    {
      request,
      requirePermission: Permission.SETTINGS_READ,
    },
    async () => {
      await cacheService.initialize();
      const stats = await cacheService.getStats();
      return stats;
    }
  );
}
