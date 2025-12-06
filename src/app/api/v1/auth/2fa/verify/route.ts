import { NextRequest } from "next/server";
import { wrapper, Errors } from "@/lib/api-utils";
import { UserMutations } from "@/lib/db/models/User.model";
import { z } from "zod";
import { send2FAEnabledEmail } from "@/lib/email";
import { env } from "@/config/env";

const verifySchema = z.object({
  token: z.string().min(6).max(6),
});

/**
 * POST /api/v1/auth/2fa/verify
 * Verify TOTP token and enable 2FA
 */
export const POST = (request: NextRequest) =>
  wrapper(
    {
      request,
      requireAuth: true,
      parser: verifySchema,
    },
    async ({ auth, body }) => {
      if (!auth) {
        throw new Errors.Unauthorized("Authentication required");
      }

      // Verify token and enable 2FA
      await UserMutations.verifyAndEnableTwoFactor(auth.user._id, body.token);

      // Generate backup codes
      const backupCodes = await UserMutations.generateBackupCodes(
        auth.user._id
      );

      // Send 2FA enabled confirmation email
      send2FAEnabledEmail(
        auth.user.email,
        `${env.APP_URL || "https://mesanet.works"}/support`
      ).catch((err) => console.error("Failed to send 2FA enabled email:", err));

      return {
        message: "Two-factor authentication enabled successfully",
        backupCodes, // Show once - user should save these
      };
    }
  );
