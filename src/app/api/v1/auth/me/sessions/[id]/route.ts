import { Errors, wrapper } from "@/lib/api-utils";
import { SessionMutations } from "@/lib/db/models/Session.model";
import { Permission } from "@/lib/rbac";
import { isValidObjectId } from "@/utils/validation";
import { NextRequest } from "next/server";

export const DELETE = (
  request: NextRequest,
  { params }: { params: { id: string } }
) =>
  wrapper(
    {
      request,
      requirePermission: Permission.SESSION_READ_OWN,
    },
    async ({ auth }) => {
      const identifier = auth?.identifier;
      const p = await params;
      if (!identifier) {
        throw new Errors.Unauthorized("User not authenticated");
      }

      if (!isValidObjectId(p.id)) {
        throw new Errors.BadRequest("Invalid session ID format");
      }

      await SessionMutations.revokeSessionById(p.id);

      return { message: "Session revoked successfully" };
    }
  );
