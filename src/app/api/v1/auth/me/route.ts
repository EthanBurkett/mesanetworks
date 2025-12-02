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

      const user = await UserQueries.findByAuth0Id(identifier);
      if (!user) {
        return auth.user;
      }

      return {
        sub: user.auth0Id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
        roles: auth.permissions.roles || [],
        permissions: auth.permissions.permissions || [],
        createdAt: user.createdAt,
      };
    }
  );
