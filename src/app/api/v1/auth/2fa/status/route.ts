import { NextRequest } from "next/server";
import { wrapper, Errors } from "@/lib/api-utils";
import { UserQueries } from "@/lib/db/models/User.model";

/**
 * GET /api/v1/auth/2fa/status
 * Get user's 2FA status
 */
export const GET = (request: NextRequest) =>
  wrapper(
    {
      request,
      requireAuth: true,
    },
    async ({ auth }) => {
      if (!auth) {
        throw new Errors.Unauthorized("Authentication required");
      }

      const status = await UserQueries.getTwoFactorStatus(auth.user._id);

      return status;
    }
  );
