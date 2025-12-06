import { Errors, wrapper } from "@/lib/api-utils";
import { UserModel, UserQueries } from "@/lib/db/models/User.model";
import { Permission } from "@/lib/rbac";
import { Params } from "@/types/request";
import { NextRequest } from "next/server";
import z from "zod";
import { AuditLogger } from "@/lib/audit-logger";
import { RoleModel } from "@/lib/db/models/Role.model";
import { sendRoleChangedEmail } from "@/lib/email";

export const PATCH = (request: NextRequest, context: Params<"id">) =>
  wrapper(
    {
      request,
      requirePermission: Permission.ROLE_ASSIGN,
      params: context.params,
      parser: z.object({
        roles: z.array(z.string()),
      }),
    },
    async ({ body, params, auth }) => {
      const userId = params!.id;

      const user = await UserModel.findById(userId).exec();
      if (!user) {
        throw new Errors.NotFound("User not found");
      }

      // Verify all roles exist
      const roles = await RoleModel.find({ _id: { $in: body.roles } }).exec();
      if (roles.length !== body.roles.length) {
        throw new Errors.BadRequest("One or more roles not found");
      }

      const previousRoles = user.roles;
      user.roles = body.roles;
      await user.save();

      // Log role assignments
      for (const roleId of body.roles) {
        if (!previousRoles.includes(roleId)) {
          const role = roles.find((r) => r._id === roleId);
          if (role) {
            await AuditLogger.logRoleAssign(
              {
                userId: user._id,
                userEmail: user.email,
                roleId: role._id,
                roleName: role.name,
                assignedBy: auth!,
              },
              request
            );
          }
        }
      }

      // Log role removals
      for (const roleId of previousRoles) {
        if (!body.roles.includes(roleId)) {
          const role = await RoleModel.findById(roleId).exec();
          if (role) {
            await AuditLogger.logRoleAssign(
              {
                userId: user._id,
                userEmail: user.email,
                roleId: role._id,
                roleName: `[REMOVED] ${role.name}`,
                assignedBy: auth!,
              },
              request
            );
          }
        }
      }

      // Send role change notification email
      const roleNames = roles.map((r) => r.name).join(", ");
      const adminUser = await UserQueries.findByIdentifier(auth!.identifier);
      const updatedBy = adminUser?.firstName
        ? `${adminUser?.firstName} ${adminUser?.lastName}`
        : adminUser?.email || "Administrator";

      sendRoleChangedEmail(user.email, {
        newRole: roleNames,
        updatedBy,
        timestamp: new Date().toLocaleString("en-US", {
          dateStyle: "long",
          timeStyle: "short",
        }),
      }).catch((error) => {
        console.error("Failed to send role change email:", error);
      });

      return await UserModel.findById(userId).populate("roles").exec();
    }
  );
