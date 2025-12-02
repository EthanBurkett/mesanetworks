import { Errors, wrapper } from "@/lib/api-utils";
import { Auth0, Auth0API } from "@/lib/auth0";
import { UserMutations, UserQueries } from "@/lib/db/models/User.model";
import { Role } from "@/lib/rbac";
import { registerSchema } from "@/schemas/auth.schema";
import { parseAuth0Error } from "@/utils/auth0-errors";
import { checkBreachedPassword } from "@/utils/password-validator";
import { NextRequest } from "next/server";
import z from "zod";

export const POST = (request: NextRequest) =>
  wrapper(
    {
      request,
      parser: registerSchema,
    },
    async ({ body }) => {
      try {
        const existingEmail = await UserQueries.findByEmail(body.email);
        if (existingEmail) {
          throw new Errors.Conflict(
            "An account with this email already exists"
          );
        }

        const isBreached = await checkBreachedPassword(body.password);
        if (isBreached) {
          throw new Errors.UnprocessableEntity(
            "This password has been found in a data breach. Please choose a different password."
          );
        }

        const auth0User = await Auth0API.signup({
          email: body.email,
          password: body.password,
          user_metadata: {
            firstName: body.firstName,
            lastName: body.lastName,
          },
        });

        const user = await UserMutations.createUser({
          auth0Id: auth0User.user_id || auth0User._id,
          email: body.email,
          firstName: body.firstName,
          lastName: body.lastName,
        });
        if (!user) {
          throw new Errors.InternalServer("Failed to create user");
        }

        return {
          message:
            "Registration successful. Please check your email to verify your account.",
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
          },
        };
      } catch (error: any) {
        if (error instanceof Errors.Conflict) {
          throw error;
        }

        let errorData = error.response?.data;
        if (typeof errorData === "string") {
          try {
            errorData = JSON.parse(errorData);
          } catch {}
        }

        console.error("Auth0 Registration Error - Full Details:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: errorData,
          message: error.message,
        });

        const errorMessage =
          errorData?.message ||
          errorData?.error_description ||
          errorData?.description ||
          errorData?.error ||
          parseAuth0Error(error);

        throw new Errors.BadRequest(errorMessage);
      }
    }
  );
