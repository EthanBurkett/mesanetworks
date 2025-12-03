import { Errors, wrapper } from "@/lib/api-utils";
import { Auth0API } from "@/lib/auth0";
import { verifyCodeSchema } from "@/schemas/auth.schema";
import { NextRequest } from "next/server";
import z from "zod";
import { UserQueries } from "@/lib/db/models/User.model";
import { AuditAction, AuditSeverity } from "@/lib/audit-types";
import { createAuditLog } from "@/lib/audit-logger";

export const POST = async (request: NextRequest) =>
  wrapper(
    {
      request,
      parser: verifyCodeSchema,
    },
    async ({ body }) => {
      try {
        await Auth0API.verifyEmailCode(body.email, body.code);

        // Get user ID for logging
        const user = await UserQueries.findByEmail(body.email);

        // Log email verification
        await createAuditLog(
          {
            action: AuditAction.SECURITY_EMAIL_VERIFY,
            description: `Email verified for ${body.email}`,
            severity: AuditSeverity.INFO,
            resourceType: "User",
            resourceId: user?._id,
            resourceName: body.email,
            metadata: { email: body.email },
          },
          { request }
        );

        return {
          message: "Email verified successfully.",
        };
      } catch (error: any) {
        console.error("Email verification error:", error);
        console.error("Error response:", error.response?.data);

        if (error.response?.data?.error === "invalid_grant") {
          throw new Errors.BadRequest("Invalid or expired verification code");
        }

        if (error.response?.data) {
          throw new Errors.BadRequest(
            error.response.data.error_description ||
              error.response.data.message ||
              "Failed to verify email. Please try again."
          );
        }

        throw new Errors.BadRequest(
          error.message || "Failed to verify email. Please try again."
        );
      }
    }
  );
