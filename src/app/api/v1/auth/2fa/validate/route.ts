import { NextRequest } from "next/server";
import { wrapper, Errors } from "@/lib/api-utils";
import { UserMutations } from "@/lib/db/models/User.model";
import { z } from "zod";

const validateSchema = z.object({
  token: z.string().optional(),
  backupCode: z.string().optional(),
});

/**
 * POST /api/v1/auth/2fa/validate
 * Validate TOTP token or backup code during login
 */
export const POST = (request: NextRequest) =>
  wrapper(
    {
      request,
      requireAuth: true,
      parser: validateSchema,
    },
    async ({ auth, body }) => {
      if (!auth) {
        throw new Errors.Unauthorized("Authentication required");
      }

      let verified = false;

      if (body.token) {
        // Verify TOTP token
        verified = await UserMutations.verifyTwoFactorToken(
          auth.user._id,
          body.token
        );
      } else if (body.backupCode) {
        // Verify and consume backup code
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

      return {
        verified: true,
        message: "Two-factor authentication successful",
      };
    }
  );
