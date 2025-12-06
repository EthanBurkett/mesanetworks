import { NextRequest } from "next/server";
import { wrapper } from "@/lib/api-utils";
import { UserMutations } from "@/lib/db/models/User.model";
import { generateQRCode } from "@/lib/auth/two-factor";

/**
 * POST /api/v1/auth/2fa/setup
 * Generate TOTP secret and QR code for 2FA setup
 */
export const POST = (request: NextRequest) =>
  wrapper(
    {
      request,
      requireAuth: true, // User must be authenticated
    },
    async ({ auth }) => {
      if (!auth) {
        throw new Error("Authentication required");
      }

      // Generate and store encrypted secret
      const secret = await UserMutations.setupTwoFactor(auth.user._id);

      // Generate QR code for authenticator app
      const qrCodeUrl = await generateQRCode(auth.user.email, secret);

      return {
        secret, // Show once for manual entry
        qrCode: qrCodeUrl,
        message: "Scan the QR code with your authenticator app",
      };
    }
  );
