import { Errors, wrapper } from "@/lib/api-utils";
import { PunchQueries } from "@/lib/db/models/Punch.model";
import { hasPermission, Permission } from "@/lib/rbac";
import { NextRequest } from "next/server";

export const GET = (request: NextRequest) =>
  wrapper(
    {
      request,
      requirePermission: Permission.EMPLOYEE_READ_TIMESHEET_OWN,
    },
    async ({ auth }) => {
      if (!auth) throw new Errors.Unauthorized("Authentication required");

      const readAll = hasPermission(
        auth.permissions,
        Permission.MANAGER_READ_TIMESHEET_ANY
      );

      if (readAll) {
        return PunchQueries.findAll();
      }
    }
  );

export const POST = (request: NextRequest) =>
  wrapper(
    {
      request,
      requirePermission: Permission.EMPLOYEE_CLOCK_SHIFT_OWN,
    },
    async () => {}
  );
