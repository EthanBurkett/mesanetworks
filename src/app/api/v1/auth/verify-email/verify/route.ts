import { Errors, wrapper } from "@/lib/api-utils";
import { Auth0API } from "@/lib/auth0";
import { verifyCodeSchema } from "@/schemas/auth.schema";
import { NextRequest } from "next/server";
import z from "zod";

export const POST = async (request: NextRequest) =>
  wrapper(
    {
      request,
      parser: verifyCodeSchema,
    },
    async ({ body }) => {
      try {
        await Auth0API.verifyEmailCode(body.email, body.code);

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
