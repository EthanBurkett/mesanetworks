import { Errors, wrapper } from "@/lib/api-utils";
import { Auth0 } from "@/lib/auth0";
import { loginSchema } from "@/schemas/auth.schema";
import { parseAuth0Error } from "@/utils/auth0-errors";
import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
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
import { env } from "@/config/env";
import { sendSecurityAlertEmail } from "@/lib/email";

export const POST = (request: NextRequest) =>
  wrapper(
    {
      request,
      parser: loginSchema,
    },
    async ({ body }) => {
      try {
        const { data: grant } = await Auth0.authentication.oauth.passwordGrant({
          username: body.identifier,
          password: body.password,
          realm: "Username-Password-Authentication",
          scope: "openid profile email offline_access",
        });

        const idToken = grant.id_token;
        if (!idToken) {
          throw new Errors.Unauthorized("Failed to obtain ID token");
        }

        const decoded = await jwt.decode(idToken);
        if (
          !decoded ||
          typeof decoded === "string" ||
          !("sub" in decoded) ||
          !decoded.sub
        ) {
          throw new Errors.Unauthorized("Failed to decode ID token");
        }

        if (!decoded.email_verified) {
          throw new Errors.Forbidden(
            "Email not verified. Please verify your email before logging in."
          );
        }

        const firstName =
          (decoded as any).user_metadata?.firstName ||
          decoded.given_name ||
          (decoded as any)["https://hylandia.net/firstName"] ||
          null;
        const lastName =
          (decoded as any).user_metadata?.lastName ||
          decoded.family_name ||
          (decoded as any)["https://hylandia.net/lastName"] ||
          null;
        const avatarUrl = decoded.picture || null;

        const user = await UserMutations.createUser({
          auth0Id: decoded.sub,
          email: decoded.email!,
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          avatarUrl: avatarUrl || undefined,
        });

        if (!user) {
          throw new Errors.InternalServer(
            "Failed to create or update user in database"
          );
        }

        // Check if user account is active
        if (!user.isActive) {
          await AuditLogger.logLogin(decoded.email!, false, {
            request,
            errorMessage: "Account is suspended",
          });
          throw new Errors.Forbidden(
            "Your account has been suspended. Please contact support for assistance."
          );
        }

        // Check if user has 2FA enabled
        const requires2FA = await UserQueries.hasTwoFactorEnabled(user._id);

        if (requires2FA) {
          // Create a temporary pending session token (short-lived)
          const pendingToken = jwt.sign(
            {
              sub: decoded.sub,
              email: decoded.email,
              firstName,
              lastName,
              pending2FA: true,
              userId: user._id,
            },
            env.JWT_SECRET,
            { expiresIn: "10m" } // 10 minutes to complete 2FA
          );

          (await cookies()).set("pending_session", pendingToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 600, // 10 minutes
            path: "/",
          });

          // Return that 2FA is required
          return {
            requires2FA: true,
            message: "Two-factor authentication required",
          };
        }

        // No 2FA required - proceed with normal login

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
          user._id
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

          // Create new session for new device
          sessionToken = issueSession({
            sub: decoded.sub,
            email: decoded.email,
            firstName,
            lastName,
          });

          const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

          await SessionMutations.createSession({
            userId: user._id,
            auth0Id: decoded.sub,
            sessionToken,
            ipAddress,
            userAgent,
            deviceInfo,
            location,
            expiresAt,
          });
        }

        (await cookies()).set("session", sessionToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 60 * 60 * 24, // 24 hours in seconds
          path: "/",
        });

        // Log successful login
        await AuditLogger.logLogin(decoded.email!, true, { request });

        return {
          access_token: grant.access_token,
          refresh_token: grant.refresh_token,
          id_token: grant.id_token,
          user: {
            id: user._id,
            sub: decoded.sub,
            email: decoded.email,
            firstName,
            lastName,
            avatarUrl,
          },
        };
      } catch (error: any) {
        // Log failed login attempt
        await AuditLogger.logLogin(body.identifier, false, {
          request,
          errorMessage: parseAuth0Error(error),
        });
        throw new Errors.Unauthorized(parseAuth0Error(error));
      }
    }
  );
