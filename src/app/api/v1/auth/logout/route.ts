import { wrapper } from "@/lib/api-utils";
import { SessionMutations } from "@/lib/db/models/Session.model";
import { Permission } from "@/lib/rbac";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { AuditLogger } from "@/lib/audit-logger";

export const POST = (request: NextRequest) =>
  wrapper(request, async ({ auth }) => {
    const c = await cookies();
    const sessionToken = c.get("session")?.value;
    console.log({ auth });
    if (sessionToken && auth) {
      try {
        await SessionMutations.revokeSession(sessionToken);
      } catch (error) {
        console.error("Logout error:", error);
        throw new Error("Failed to logout. Please try again.");
      }

      c.delete({
        name: "session",
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });

      // Log logout
      if (auth) {
        await AuditLogger.logLogout(auth, request);
      }

      return { message: "Successfully logged out." };
    }

    return { message: "No active session found." };
  });
