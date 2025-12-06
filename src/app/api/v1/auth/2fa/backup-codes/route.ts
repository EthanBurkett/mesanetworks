import { NextRequest } from "next/server";
import { wrapper, Errors } from "@/lib/api-utils";
import { UserMutations } from "@/lib/db/models/User.model";
import { z } from "zod";
import { sendBackupCodesGeneratedEmail } from "@/lib/email";
import { env } from "@/config/env";

const regenerateSchema = z.object({
  token: z.string().min(6).max(6).optional(),
  backupCode: z.string().optional(),
});

/**
 * POST /api/v1/auth/2fa/backup-codes
 * Regenerate backup codes (requires verification)
 */
export const POST = (request: NextRequest) =>
  wrapper(
    {
      request,
      requireAuth: true,
      parser: regenerateSchema,
    },
    async ({ auth, body }) => {
      if (!auth) {
        throw new Errors.Unauthorized("Authentication required");
      }

      // Verify with either TOTP token or existing backup code
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
          "Either token or backupCode must be provided for verification"
        );
      }

      if (!verified) {
        throw new Errors.Unauthorized("Invalid verification code");
      }

      // Generate new backup codes
      const backupCodes = await UserMutations.generateBackupCodes(
        auth.user._id
      );

      // Send backup codes regenerated email
      sendBackupCodesGeneratedEmail(
        auth.user.email,
        `${env.APP_URL || "https://mesanet.works"}/account/two-factor`
      ).catch((err) =>
        console.error("Failed to send backup codes email:", err)
      );

      return {
        message: "Backup codes regenerated successfully",
        backupCodes, // Show once - user should save these
      };
    }
  );
