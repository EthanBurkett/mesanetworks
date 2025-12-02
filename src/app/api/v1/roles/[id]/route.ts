import { Errors, wrapper } from "@/lib/api-utils";
import { RoleModel } from "@/lib/db/models/Role.model";
import { Permission } from "@/lib/rbac";
import { Params } from "@/types/request";
import { NextRequest } from "next/server";
import z from "zod";

export const PATCH = (request: NextRequest, context: Params<"id">) =>
  wrapper(
    {
      request,
      requirePermission: Permission.ROLE_UPDATE,
      params: context.params,
      parser: z.object({
        name: z.string().min(3).max(50).optional(),
        description: z.string().max(250).optional(),
        permissions: z.array(z.string()).optional(),
        isActive: z.boolean().optional(),
        hierarchyLevel: z.number().min(0).optional(),
      }),
    },
    async ({ body, params, auth }) => {
      const roleId = params!.id;

      const role = await RoleModel.findById(roleId);
      if (!role) {
        throw new Errors.NotFound("Role not found");
      }

      // Prevent updating system roles EXCEPT for hierarchyLevel
      if (role.isSystem) {
        const invalidKeys = Object.keys(body).filter(
          (key) => key !== "hierarchyLevel"
        );
        if (invalidKeys.length > 0) {
          throw new Errors.Forbidden(
            "Cannot modify a system role (except hierarchy level)"
          );
        }
      }

      if (body.name !== undefined) role.name = body.name;
      if (body.description !== undefined) role.description = body.description;
      if (body.permissions !== undefined)
        role.permissions = body.permissions as Permission[];
      if (body.isActive !== undefined) role.isActive = body.isActive;
      if (body.hierarchyLevel !== undefined)
        role.hierarchyLevel = body.hierarchyLevel;
      await role.save();

      return role;
    }
  );
