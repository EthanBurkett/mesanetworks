import { Errors, wrapper } from "@/lib/api-utils";
import { SessionMutations } from "@/lib/db/models/Session.model";
import { Permission } from "@/lib/rbac";
import { Params } from "@/types/request";
import { isValidObjectId } from "@/utils/validation";
import { NextRequest } from "next/server";
import { AuditLogger } from "@/lib/audit-logger";

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

      // Log session revocation
      await AuditLogger.logSessionRevoke(
        { sessionId: params!.id, revokedBy: auth! },
        request
      );

      return { message: "Session revoked successfully" };
    }
  );
