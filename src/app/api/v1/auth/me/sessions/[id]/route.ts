import { Errors, wrapper } from "@/lib/api-utils";
import { SessionMutations } from "@/lib/db/models/Session.model";
import { Permission } from "@/lib/rbac";
import { Params } from "@/types/request";
import { isValidObjectId } from "@/utils/validation";
import { NextRequest } from "next/server";

export const DELETE = (request: NextRequest, context: Params<"id">) =>
  wrapper(
    {
      request,
      params: context.params,
      requirePermission: Permission.SESSION_READ_OWN,
    },
    async ({ auth, params }) => {
      const identifier = auth?.identifier;
      if (!identifier) {
        throw new Errors.Unauthorized("User not authenticated");
      }

      if (!isValidObjectId(params!.id)) {
        throw new Errors.BadRequest("Invalid session ID format");
      }

      await SessionMutations.revokeSessionById(params!.id);

      return { message: "Session revoked successfully" };
    }
  );
