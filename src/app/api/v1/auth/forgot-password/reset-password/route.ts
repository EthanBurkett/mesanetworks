import { Errors, wrapper } from "@/lib/api-utils";
import { Auth0API } from "@/lib/auth0";
import { UserQueries } from "@/lib/db/models/User.model";
import { resetPasswordSchema } from "@/schemas/auth.schema";
import {
  checkBreachedPassword,
  validatePasswordStrength,
} from "@/utils/password-validator";
import { NextRequest } from "next/server";
import { AuditLogger } from "@/lib/audit-logger";

export const POST = (request: NextRequest) =>
  wrapper(
    {
      request,
      parser: resetPasswordSchema,
    },
    async ({ body }) => {
      const strengthValidation = await validatePasswordStrength(
        body.newPassword
      );
      if (!strengthValidation.isValid) {
        throw new Errors.BadRequest(
          strengthValidation.errors?.join(", ") || "Password is too weak"
        );
      }

      const isBreached = await checkBreachedPassword(body.newPassword);
      if (isBreached) {
        throw new Errors.UnprocessableEntity(
          "This password has been found in a data breach. Please choose a different password."
        );
      }

      try {
        await Auth0API.verifyPasswordResetCode(body.email, body.code);
        await Auth0API.updateUserPassword(body.email, body.newPassword);

        // Get user ID for logging
        const user = await UserQueries.findByEmail(body.email);

        // Log password reset
        await AuditLogger.logPasswordReset(
          { email: body.email, userId: user?._id },
          request
        );

        return {
          message: "Password has been successfully reset.",
        };
      } catch (error: any) {
        console.error("Password reset error:", error);
        console.error("Error response:", error.response?.data);
        console.error("Error stack:", error.stack);

        if (error instanceof Errors.BadRequest) {
          throw error;
        }

        if (error.response?.data?.error === "invalid_grant") {
          throw new Errors.BadRequest("Invalid or expired verification code");
        }

        if (error.response?.data) {
          throw new Errors.BadRequest(
            error.response.data.error_description ||
              error.response.data.message ||
              "Failed to reset password. Please try again."
          );
        }

        throw new Errors.BadRequest(
          error.message || "Failed to reset password. Please try again."
        );
      }
    }
  );
