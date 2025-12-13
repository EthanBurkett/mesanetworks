import { Errors, wrapper } from "@/lib/api-utils";
import { NextRequest } from "next/server";
import { UserMutations, UserQueries } from "@/lib/db/models/User.model";
import { issueSession } from "@/utils/jwt";
import { parseUserAgent } from "@/utils/device-parser";
import { getLocationFromIP } from "@/utils/geo-location";
import {
  SessionMutations,
  SessionQueries,
} from "@/lib/db/models/Session.model";
import { cookies } from "next/headers";
import { AuditLogger } from "@/lib/audit-logger";
import jwt from "jsonwebtoken";
import { env } from "@/config/env";
import { z } from "zod";
import { sendSecurityAlertEmail } from "@/lib/email";

const verify2FASchema = z.object({
  token: z.string().optional(),
  backupCode: z.string().optional(),
});

export const POST = (request: NextRequest) =>
  wrapper(
    {
      request,
      parser: verify2FASchema,
    },
    async ({ body }) => {
      const cookieStore = await cookies();
      const pendingToken = cookieStore.get("pending_session")?.value;

      if (!pendingToken) {
        throw new Errors.Unauthorized("No pending authentication session");
      }

      // Verify pending token
      let decoded: any;
      try {
        decoded = jwt.verify(pendingToken, env.JWT_SECRET);
      } catch (error) {
        throw new Errors.Unauthorized("Invalid or expired session");
      }

      if (!decoded.pending2FA || !decoded.userId) {
        throw new Errors.Unauthorized("Invalid pending session");
      }

      // Check if user account is still active before verifying 2FA
      const user = await UserQueries.findById(decoded.userId);
      if (!user) {
        throw new Errors.NotFound("User not found");
      }

      if (!user.isActive) {
        // Clear pending session cookie
        cookieStore.delete("pending_session");

        await AuditLogger.logLogin(decoded.email, false, {
          request,
          errorMessage: "Account is suspended",
        });
        throw new Errors.Forbidden(
          "Your account has been suspended. Please contact support for assistance."
        );
      }

      // Verify 2FA code
      let verified = false;

      if (body.token) {
        // Verify TOTP token
        verified = await UserMutations.verifyTwoFactorToken(
          decoded.userId,
          body.token
        );
      } else if (body.backupCode) {
        // Verify and consume backup code
        verified = await UserMutations.verifyBackupCode(
          decoded.userId,
          body.backupCode
        );
      } else {
        throw new Errors.BadRequest(
          "Either token or backupCode must be provided"
        );
      }

      if (!verified) {
        // Log failed 2FA attempt
        await AuditLogger.logLogin(decoded.email, false, {
          request,
          errorMessage: "Invalid 2FA code",
        });
        throw new Errors.Unauthorized("Invalid verification code");
      }

      // 2FA verified - create actual session
      const ipAddress =
        request.headers.get("x-forwarded-for") ||
        (request as any).ip ||
        "Unknown";
      const userAgent = request.headers.get("user-agent") || "Unknown";
      const deviceInfo = parseUserAgent(userAgent);

      const location = await getLocationFromIP(ipAddress).catch(
        () => undefined
      );

      // Check for existing sessions from this device
      const existingSessions = await SessionQueries.findActiveSessionsByUser(
        decoded.userId
      );
      const existingSession = existingSessions.find(
        (session) =>
          session.browser === deviceInfo.browser &&
          session.os === deviceInfo.os &&
          session.ipAddress === ipAddress
      );

      let sessionToken: string;

      if (existingSession) {
        // Reuse existing session token
        sessionToken = existingSession.sessionToken;
        // Update last active time
        await SessionMutations.updateSessionActivity(existingSession._id);
      } else {
        // Check if this is a new device (for security alert)
        const isNewDevice = !existingSessions.some(
          (session) =>
            session.browser === deviceInfo.browser &&
            session.os === deviceInfo.os
        );

        if (isNewDevice && existingSessions.length > 0) {
          // Send security alert for new device login
          const user = await UserQueries.findById(decoded.userId);
          if (user) {
            sendSecurityAlertEmail(user.email, {
              timestamp: new Date().toLocaleString(),
              location:
                location?.city && location?.country
                  ? `${location.city}, ${location.country}`
                  : ipAddress,
              device: `${deviceInfo.browser || "Unknown Browser"} on ${
                deviceInfo.os || "Unknown OS"
              }`,
              ipAddress,
              securityUrl: `${
                env.APP_URL || "https://mesanet.works"
              }/account/security`,
            }).catch((err) =>
              console.error("Failed to send security alert email:", err)
            );
          }
        }

        // Create new session for new device
        sessionToken = issueSession({
          sub: decoded.sub,
          email: decoded.email,
          firstName: decoded.firstName,
          lastName: decoded.lastName,
        });

        const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

        await SessionMutations.createSession({
          userId: decoded.userId,
          auth0Id: decoded.sub,
          sessionToken,
          ipAddress,
          userAgent,
          deviceInfo,
          location,
          expiresAt,
        });
      }

      // Set actual session cookie
      cookieStore.set("session", sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24, // 24 hours in seconds
        path: "/",
      });

      // Clear pending session
      cookieStore.delete("pending_session");

      // Log successful 2FA login
      await AuditLogger.logLogin(decoded.email, true, { request });

      return {
        message: "Two-factor authentication successful",
        user: {
          id: decoded.userId,
          sub: decoded.sub,
          email: decoded.email,
          firstName: decoded.firstName,
          lastName: decoded.lastName,
        },
      };
    }
  );
