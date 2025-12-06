import { Errors, wrapper } from "@/lib/api-utils";
import { hasPermission, Permission } from "@/lib/rbac";
import { Params } from "@/types/request";
import { NextRequest } from "next/server";

export const GET = (request: NextRequest, { params }: Params<"id">) =>
  wrapper(
    {
      request,
      requirePermission: Permission.EMPLOYEE_READ_SHIFT_OWN,
      params,
    },
    async ({ params, auth }) => {
      if (!auth) throw new Errors.Unauthorized("Authentication required");

      const readAll = hasPermission(
        auth.permissions,
        Permission.MANAGER_READ_SHIFT_ANY
      );
    }
  );

export const PATCH = (request: NextRequest, { params }: Params<"id">) =>
  wrapper(
    {
      request,
      requirePermission: Permission.MANAGER_UPDATE_SHIFT_ANY,
      params,
    },
    async ({ params, auth }) => {
      if (!auth) throw new Errors.Unauthorized("Authentication required");

      const readAll = hasPermission(
        auth.permissions,
        Permission.MANAGER_READ_SHIFT_ANY
      );
    }
  );

export const DELETE = (request: NextRequest, { params }: Params<"id">) =>
  wrapper(
    {
      request,
      requirePermission: Permission.ADMIN_DELETE_SHIFT_ANY,
      params,
    },
    async ({ params, auth }) => {
      if (!auth) throw new Errors.Unauthorized("Authentication required");

      const readAll = hasPermission(
        auth.permissions,
        Permission.MANAGER_READ_SHIFT_ANY
      );
    }
  );
