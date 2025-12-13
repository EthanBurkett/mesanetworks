import { wrapper } from "@/lib/api-utils";
import { RoleQueries, RoleMutations } from "@/lib/db/models/Role.model";
import { Permission } from "@/lib/rbac";
import { NextRequest } from "next/server";
import z from "zod";
import { AuditLogger } from "@/lib/audit-logger";
import { withCache, invalidateCache, CacheKeys } from "@/lib/cache";

export const GET = (request: NextRequest) =>
  wrapper(
    {
      request,
    },
    async () => {
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

export const POST = (request: NextRequest) =>
  wrapper(
    {
      request,
      requirePermission: Permission.ROLE_CREATE,
      parser: z.object({
        name: z.string().min(3).max(50),
        description: z.string().max(250).optional(),
        permissions: z.array(z.string()),
        hierarchyLevel: z.number().min(0).default(0),
        inherits: z.boolean().default(false),
        inheritsFrom: z.array(z.string()).default([]),
      }),
    },
    async ({ body, auth }) => {
      const role = await RoleMutations.createRole({
        name: body.name as any,
        description: body.description,
        permissions: body.permissions as Permission[],
        hierarchyLevel: body.hierarchyLevel,
        inherits: body.inherits,
        inheritsFrom: body.inheritsFrom,
        isSystem: false,
      });

      // Invalidate roles cache after creation
      await invalidateCache(CacheKeys.roles.all());

      // Log role creation
      await AuditLogger.logRoleCreate(
        { roleName: body.name, createdBy: auth! },
        role._id,
        request
      );

      return role;
    }
  );
