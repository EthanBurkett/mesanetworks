import { wrapper } from "@/lib/api-utils";
import { Auth0API } from "@/lib/auth0";
import { UserQueries } from "@/lib/db/models/User.model";
import { sendCodeSchema } from "@/schemas/auth.schema";
import { NextRequest } from "next/server";
import z from "zod";

export const POST = async (request: NextRequest) =>
  wrapper(
    {
      request,
      parser: sendCodeSchema,
    },
    async ({ body }) => {
      const user = await UserQueries.findByEmail(body.email);
      if (!user) {
        return {
          message:
            "If an account with that email exists, a verification code has been sent.",
        };
      }

      try {
        await Auth0API.sendEmailVerificationCode(body.email);
      } catch (error: any) {}

      return {
        message:
          "If an account with that email exists, a verification code has been sent.",
      };
    }
  );
