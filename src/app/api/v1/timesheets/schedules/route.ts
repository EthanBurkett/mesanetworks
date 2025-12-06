import { wrapper } from "@/lib/api-utils";
import { Permission } from "@/lib/rbac";
import { NextRequest } from "next/server";

export const GET = (request: NextRequest) =>
  wrapper(
    {
      request,
      requirePermission: Permission.MANAGER_READ_SHIFT_ANY,
    },
    async () => {}
  );

export const POST = (request: NextRequest) =>
  wrapper(
    {
      request,
      requirePermission: Permission.MANAGER_CREATE_SHIFT_ANY,
    },
    async () => {}
  );
