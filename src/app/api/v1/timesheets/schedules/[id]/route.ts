import { wrapper } from "@/lib/api-utils";
import { Permission } from "@/lib/rbac";
import { Params } from "@/types/request";
import { NextRequest } from "next/server";

export const GET = (request: NextRequest, { params }: Params<"id">) =>
  wrapper(
    {
      request,
      requirePermission: Permission.MANAGER_READ_SHIFT_ANY,
      params,
    },
    async ({ params }) => {}
  );

export const PATCH = (request: NextRequest, { params }: Params<"id">) =>
  wrapper(
    {
      request,
      requirePermission: Permission.MANAGER_UPDATE_SHIFT_ANY,
      params,
    },
    async ({ params }) => {}
  );

export const DELETE = (request: NextRequest, { params }: Params<"id">) =>
  wrapper(
    {
      request,
      requirePermission: Permission.ADMIN_DELETE_SHIFT_ANY,
      params,
    },
    async ({ params }) => {}
  );
