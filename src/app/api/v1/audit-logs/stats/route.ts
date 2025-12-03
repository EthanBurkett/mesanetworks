import { wrapper } from "@/lib/api-utils";
import { AuditLogQueries } from "@/lib/db/models/AuditLog.model";
import { Permission } from "@/lib/rbac";
import { NextRequest } from "next/server";

export const GET = (request: NextRequest) =>
  wrapper(
    {
      request,
      requirePermission: Permission.AUDIT_LOG_READ,
    },
    async () => {
      const { searchParams } = new URL(request.url);

      const startDate = searchParams.get("startDate");
      const endDate = searchParams.get("endDate");

      const options: any = {};
      if (startDate) options.startDate = new Date(startDate);
      if (endDate) options.endDate = new Date(endDate);

      const stats = await AuditLogQueries.getStats(options);

      return stats;
    }
  );
