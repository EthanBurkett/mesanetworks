import { Errors, wrapper } from "@/lib/api-utils";
import { ShiftQueries } from "@/lib/db/models/Shift.model";
import { hasPermission, Permission } from "@/lib/rbac";
import { NextRequest } from "next/server";

export const GET = (request: NextRequest) =>
  wrapper(
    {
      request,
      requirePermission: Permission.EMPLOYEE_READ_SHIFT_OWN,
    },
    async ({ auth }) => {
      if (!auth) throw new Errors.Unauthorized("Authentication required");

      const url = new URL(request.url);
      const allParam = url.searchParams.get("all");
      const status = url.searchParams.get("status");

      const readAll =
        (allParam === "" || allParam === "1" || allParam === "true") &&
        hasPermission(auth.permissions, Permission.MANAGER_READ_SHIFT_ANY);

      if (readAll) {
        return ShiftQueries.findAll();
      }

      return ShiftQueries.findByUserId(
        auth.user._id,
        (status as any) || undefined
      );
    }
  );
