import { Errors, wrapper } from "@/lib/api-utils";
import { ShiftQueries, ShiftMutations } from "@/lib/db/models/Shift.model";
import { LocationQueries } from "@/lib/db/models/Location.model";
import { UserQueries } from "@/lib/db/models/User.model";
import { hasPermission, Permission } from "@/lib/rbac";
import { Params } from "@/types/request";
import { NextRequest } from "next/server";
import {
  updateScheduleSchema,
  approveShiftSchema,
} from "@/schemas/timesheet.schema";
import { ShiftStatus } from "@/types/scheduling";
import { z } from "zod";

export const GET = (request: NextRequest, { params }: Params<"id">) =>
  wrapper(
    {
      request,
      requirePermission: Permission.EMPLOYEE_READ_SHIFT_OWN,
      params,
    },
    async ({ params, auth }) => {
      if (!auth) throw new Errors.Unauthorized("Authentication required");
      if (!params) throw new Errors.BadRequest("Shift ID is required");

      const readAny = hasPermission(
        auth.permissions,
        Permission.MANAGER_READ_SHIFT_ANY
      );

      if (readAny) {
        const shift = await ShiftQueries.findByIdPopulated(params.id);
        if (!shift) {
          throw new Errors.NotFound("Shift not found");
        }
        return shift;
      }

      const shift = await ShiftQueries.findByUserIdAndShiftId(
        auth.user._id,
        params.id
      );

      if (!shift) {
        throw new Errors.NotFound("Shift not found or access denied");
      }

      return shift;
    }
  );

export const PATCH = (request: NextRequest, { params }: Params<"id">) =>
  wrapper(
    {
      request,
      requirePermission: Permission.MANAGER_UPDATE_SHIFT_ANY,
      params,
      parser: z.union([approveShiftSchema, updateScheduleSchema]),
    },
    async ({ params, body, auth }) => {
      if (!auth) throw new Errors.Unauthorized("Authentication required");
      if (!params) throw new Errors.BadRequest("Shift ID is required");

      // Check if this is an approval action
      if ("approve" in body) {
        const shift = await ShiftQueries.findById(params.id);
        if (!shift) {
          throw new Errors.NotFound("Shift not found");
        }

        if (shift.status !== ShiftStatus.COMPLETED) {
          throw new Errors.BadRequest("Only completed shifts can be approved");
        }

        const updatedShift = (body as { approve: boolean }).approve
          ? await ShiftMutations.approveShift(params.id, auth.identifier)
          : await ShiftMutations.cancelShift(params.id);

        return updatedShift;
      }

      // Otherwise, treat as schedule update
      const updateBody = body as z.infer<typeof updateScheduleSchema>;

      const shift = await ShiftQueries.findById(params.id);
      if (!shift) {
        throw new Errors.NotFound("Shift not found");
      }

      // Only allow updating scheduled shifts
      if (shift.status !== ShiftStatus.SCHEDULED) {
        throw new Errors.BadRequest(
          "Only scheduled shifts can be updated. Use approval endpoint for completed shifts."
        );
      }

      // Verify location if provided
      if (updateBody.locationId) {
        const location = await LocationQueries.findById(updateBody.locationId);
        if (!location) {
          throw new Errors.NotFound("Location not found");
        }
      }

      // Verify user if provided
      if (updateBody.userId) {
        const targetUser = await UserQueries.findById(updateBody.userId);
        if (!targetUser) {
          throw new Errors.NotFound("User not found");
        }
      }

      // Validate date range if both dates provided
      if (updateBody.scheduledStart && updateBody.scheduledEnd) {
        const scheduledStart = new Date(updateBody.scheduledStart);
        const scheduledEnd = new Date(updateBody.scheduledEnd);

        if (scheduledEnd <= scheduledStart) {
          throw new Errors.BadRequest(
            "Scheduled end time must be after start time"
          );
        }
      }

      const updates: Record<string, unknown> = {};
      if (updateBody.userId) updates.userId = updateBody.userId;
      if (updateBody.locationId) updates.locationId = updateBody.locationId;
      if (updateBody.scheduledStart)
        updates.scheduledStart = new Date(updateBody.scheduledStart);
      if (updateBody.scheduledEnd)
        updates.scheduledEnd = new Date(updateBody.scheduledEnd);
      if (updateBody.notes !== undefined) updates.notes = updateBody.notes;
      if (updateBody.overrideAllowed !== undefined)
        updates.overrideAllowed = updateBody.overrideAllowed;

      const updatedShift = await ShiftMutations.updateShift(params.id, updates);

      return updatedShift;
    }
  );

export const DELETE = (request: NextRequest, { params }: Params<"id">) =>
  wrapper(
    {
      request,
      requirePermission: Permission.ADMIN_DELETE_SHIFT_ANY,
      params,
    },
    async ({ params }) => {
      if (!params) throw new Errors.BadRequest("Shift ID is required");

      const shift = await ShiftQueries.findById(params.id);
      if (!shift) {
        throw new Errors.NotFound("Shift not found");
      }

      // Only allow deleting scheduled shifts
      if (shift.status !== ShiftStatus.SCHEDULED) {
        throw new Errors.BadRequest(
          "Only scheduled shifts can be deleted. Use cancel for active shifts."
        );
      }

      await ShiftMutations.deleteShift(params.id);

      return { message: "Shift deleted successfully" };
    }
  );
