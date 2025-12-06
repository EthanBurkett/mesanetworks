import { Errors, wrapper } from "@/lib/api-utils";
import { UserModel, UserQueries } from "@/lib/db/models/User.model";
import { Permission } from "@/lib/rbac";
import { Params } from "@/types/request";
import { NextRequest } from "next/server";
import z from "zod";
import { AuditLogger } from "@/lib/audit-logger";
import {
  sendAccountSuspendedEmail,
  sendAccountActivatedEmail,
} from "@/lib/email";
import { SessionMutations } from "@/lib/db/models/Session.model";
import { env } from "@/config/env";

/**
 * PATCH /api/v1/auth/users/[id]/suspend
 * Toggle user account suspension status
 */
export const PATCH = (request: NextRequest, context: Params<"id">) =>
  wrapper(
    {
      request,
      requirePermission: Permission.USER_UPDATE,
      params: context.params,
      parser: z.object({
        isActive: z.boolean(),
        reason: z.string().optional(),
      }),
    },
    async ({ body, params, auth }) => {
      const userId = params!.id;

      const user = await UserModel.findById(userId).exec();
      if (!user) {
        throw new Errors.NotFound("User not found");
      }

      // Prevent self-suspension
      if (auth!.user._id === userId) {
        throw new Errors.BadRequest("You cannot suspend your own account");
      }

      const wasSuspended = !user.isActive;
      const willBeSuspended = !body.isActive;

      user.isActive = body.isActive;
      await user.save();

      // Log the suspension/activation
      if (willBeSuspended && !wasSuspended) {
        // Account was just suspended
        await AuditLogger.logUserSuspend(
          {
            userId: user._id,
            userEmail: user.email,
            suspendedBy: auth!,
            reason: body.reason,
          },
          request
        );

        // Revoke all active sessions when suspending
        await SessionMutations.revokeAllUserSessions(user.auth0Id);

        // Send suspension email
        sendAccountSuspendedEmail(user.email, {
          reason: body.reason || "No reason provided",
          timestamp: new Date().toLocaleString("en-US", {
            dateStyle: "long",
            timeStyle: "short",
          }),
          accountId: user._id,
          supportUrl: `${env.APP_URL || "https://mesanet.works"}/contact`,
        }).catch((error) => {
          console.error("Failed to send account suspension email:", error);
        });
      } else if (!willBeSuspended && wasSuspended) {
        // Account was just activated
        await AuditLogger.logUserActivate(
          {
            userId: user._id,
            userEmail: user.email,
            activatedBy: auth!,
          },
          request
        );

        // Get admin info for email
        const adminUser = await UserQueries.findByIdentifier(auth!.identifier);
        const activatedBy = adminUser?.firstName
          ? `${adminUser.firstName} ${adminUser.lastName}`
          : adminUser?.email || "Administrator";

        // Send activation email
        sendAccountActivatedEmail(user.email, {
          activatedBy,
          timestamp: new Date().toLocaleString("en-US", {
            dateStyle: "long",
            timeStyle: "short",
          }),
          loginUrl: `${env.APP_URL || "https://mesanet.works"}/login`,
        }).catch((error) => {
          console.error("Failed to send account activation email:", error);
        });
      }

      return {
        user: await UserModel.findById(userId).populate("roles").exec(),
        message: body.isActive
          ? "User account activated successfully"
          : "User account suspended successfully",
      };
    }
  );
