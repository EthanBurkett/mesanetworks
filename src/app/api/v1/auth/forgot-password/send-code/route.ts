import { wrapper } from "@/lib/api-utils";
import { Auth0API } from "@/lib/auth0";
import { UserQueries } from "@/lib/db/models/User.model";
import { sendCodeSchema } from "@/schemas/auth.schema";
import { NextRequest } from "next/server";

export const POST = (request: NextRequest) =>
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
            "If an account with that email exists, a reset code has been sent.",
        };
      }

      try {
        await Auth0API.sendPasswordResetCode(body.email);
      } catch (error) {
        console.error("Error sending password reset code:", error);
      }

      return {
        message:
          "If an account with that email exists, a reset code has been sent.",
      };
    }
  );
