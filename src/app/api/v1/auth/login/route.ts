import { Errors, wrapper } from "@/lib/api-utils";
import { Auth0 } from "@/lib/auth0";
import { loginSchema } from "@/schemas/auth.schema";
import { parseAuth0Error } from "@/utils/auth0-errors";
import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { UserMutations } from "@/lib/db/models/User.model";
import { issueSession } from "@/utils/jwt";
import { parseUserAgent } from "@/utils/device-parser";
import { getLocationFromIP } from "@/utils/geo-location";
import { SessionMutations } from "@/lib/db/models/Session.model";
import { cookies } from "next/headers";

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

        const sessionToken = issueSession({
          sub: decoded.sub,
          email: decoded.email,
          firstName,
          lastName,
        });

        const ipAddress =
          request.headers.get("x-forwarded-for") ||
          (request as any).ip ||
          "Unknown";
        const userAgent = request.headers.get("user-agent") || "Unknown";
        const deviceInfo = parseUserAgent(userAgent);

        const location = await getLocationFromIP(ipAddress).catch(
          () => undefined
        );

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

        (await cookies()).set("session", sessionToken, {
          httpOnly: true,
          secure: true,
          sameSite: "strict",
          maxAge: 1000 * 60 * 60 * 24,
          path: "/",
        });

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
        throw new Errors.Unauthorized(parseAuth0Error(error));
      }
    }
  );
