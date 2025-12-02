import { Errors, wrapper } from "@/lib/api-utils";
import { SessionQueries } from "@/lib/db/models/Session.model";
import { Permission } from "@/lib/rbac";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export const GET = (request: NextRequest) =>
  wrapper(
    {
      request,
      requirePermission: Permission.SESSION_READ_OWN,
    },
    async ({ auth }) => {
      const identifier = auth?.identifier;
      if (!identifier) {
        throw new Errors.Unauthorized("User not authenticated");
      }

      const sessions = await SessionQueries.findActiveSessionsByUser(
        identifier
      );

      const currentSessionToken = (await cookies()).get("session")?.value;

      return sessions.map((session) => ({
        id: session._id,
        deviceType: session.deviceType,
        deviceName: session.deviceName,
        browser: session.browser,
        os: session.os,
        location: session.location,
        ipAddress: session.ipAddress,
        lastActiveAt: session.lastActiveAt,
        createdAt: session.createdAt,
        isCurrent: session.sessionToken === currentSessionToken,
      }));
    }
  );
