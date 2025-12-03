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

      const userId = searchParams.get("userId") || undefined;
      const action = searchParams.get("action") as any;
      const severity = searchParams.get("severity") as any;
      const resourceType = searchParams.get("resourceType") || undefined;
      const success = searchParams.get("success");
      const startDate = searchParams.get("startDate");
      const endDate = searchParams.get("endDate");
      const limit = Number.parseInt(searchParams.get("limit") || "100");
      const skip = Number.parseInt(searchParams.get("skip") || "0");

      const filters: any = {
        limit,
        skip,
      };

      if (userId) filters.userId = userId;
      if (action) filters.action = action;
      if (severity) filters.severity = severity;
      if (resourceType) filters.resourceType = resourceType;
      if (success !== null) filters.success = success === "true";
      if (startDate) filters.startDate = new Date(startDate);
      if (endDate) filters.endDate = new Date(endDate);

      const { logs, total } = await AuditLogQueries.search(filters);

      return {
        logs,
        total,
        limit,
        skip,
        hasMore: skip + limit < total,
      };
    }
  );
