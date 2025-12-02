import { Errors, wrapper } from "@/lib/api-utils";
import { UserQueries } from "@/lib/db/models/User.model";
import { Permission, hasPermission } from "@/lib/rbac";
import { NextRequest } from "next/server";

export const GET = (request: NextRequest) =>
  wrapper(request, async ({ auth }) => {
    if (!auth) {
      throw new Errors.Unauthorized("User not authenticated");
    }

    if (!hasPermission(auth.permissions, Permission.USER_LIST_LIMITED)) {
      throw new Errors.Forbidden("Insufficient permissions to list users");
    }

    const allUsers = await UserQueries.findAll();

    if (hasPermission(auth.permissions, Permission.USER_LIST)) {
      return allUsers.map((user) => {
        const object = user.toObject();
        return {
          ...object,
          _id: object._id || object.auth0Id,
          displayName: `${object.firstName} ${object.lastName}`,
        };
      });
    }

    return allUsers.map((user) => ({
      _id: user._id || user.auth0Id,
      displayName: `${user.firstName} ${user.lastName}`,
    }));
  });
