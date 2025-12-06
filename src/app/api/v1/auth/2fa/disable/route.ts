import { NextRequest } from "next/server";
import { wrapper, Errors } from "@/lib/api-utils";
import { UserMutations } from "@/lib/db/models/User.model";
import { z } from "zod";

const disableSchema = z.object({
  token: z.string().min(6).max(6).optional(),
  backupCode: z.string().optional(),
});

/**
 * POST /api/v1/auth/2fa/disable
 * Disable two-factor authentication (requires verification)
 */
export const POST = (request: NextRequest) =>
  wrapper(
    {
      request,
      requireAuth: true,
      parser: disableSchema,
    },
    async ({ auth, body }) => {
      if (!auth) {
        throw new Errors.Unauthorized("Authentication required");
      }

      // Verify with either TOTP token or backup code
      let verified = false;

      if (body.token) {
        verified = await UserMutations.verifyTwoFactorToken(
          auth.user._id,
          body.token
        );
      } else if (body.backupCode) {
        verified = await UserMutations.verifyBackupCode(
          auth.user._id,
          body.backupCode
        );
      } else {
        throw new Errors.BadRequest(
          "Either token or backupCode must be provided"
        );
      }

      if (!verified) {
        throw new Errors.Unauthorized("Invalid verification code");
      }

      // Disable 2FA
      await UserMutations.disableTwoFactor(auth.user._id);

      return {
        message: "Two-factor authentication disabled successfully",
      };
    }
  );
