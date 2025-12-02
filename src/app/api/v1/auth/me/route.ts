import { Errors, wrapper } from "@/lib/api-utils";
import { UserQueries } from "@/lib/db/models/User.model";
import { Permission } from "@/lib/rbac";
import { NextRequest } from "next/server";

export const GET = (request: NextRequest) =>
  wrapper(
    {
      request,
      requirePermission: Permission.SESSION_READ_OWN,
    },
    async ({ auth }) => {
      if (!auth) {
        throw new Errors.Unauthorized("User not authenticated");
      }

      const identifier = auth.identifier;
      if (!identifier) {
        throw new Errors.Unauthorized("User not authenticated");
      }

      // Get fresh user data with populated roles
      const user = await UserQueries.findByIdentifier(identifier);
      if (!user) {
        throw new Errors.NotFound("User not found");
      }

      // Return user data with computed permissions from auth (already includes inheritance)
      return {
        _id: user._id,
        auth0Id: user.auth0Id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        roles: user.roles || [],
        // Computed permissions and roleIds from auth (includes inheritance)
        permissions: auth.permissions.permissions || [],
        roleIds: auth.permissions.roleIds || [],
      };
    }
  );
