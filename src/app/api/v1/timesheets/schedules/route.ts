import { wrapper, Errors } from "@/lib/api-utils";
import { Permission } from "@/lib/rbac";
import { NextRequest } from "next/server";
import { ShiftQueries, ShiftMutations } from "@/lib/db/models/Shift.model";
import { LocationQueries } from "@/lib/db/models/Location.model";
import { UserQueries } from "@/lib/db/models/User.model";
import { ShiftStatus } from "@/types/scheduling";
import { createScheduleSchema } from "@/schemas/timesheet.schema";
import { z } from "zod";

export const GET = (request: NextRequest) =>
  wrapper(
    {
      request,
      requirePermission: Permission.MANAGER_READ_SHIFT_ANY,
    },
    async ({ auth }) => {
      const { searchParams } = new URL(request.url);

      const userId = searchParams.get("userId");
      const locationId = searchParams.get("locationId");
      const status = searchParams.get("status") as ShiftStatus | null;
      const startDate = searchParams.get("startDate");
      const endDate = searchParams.get("endDate");

      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (userId) {
          const shifts = await ShiftQueries.findByUserIdAndDateRange(
            userId,
            start,
            end
          );
          return shifts;
        }

        const shifts = await ShiftQueries.findByDateRange(start, end);
        return shifts;
      }

      if (userId) {
        const shifts = await ShiftQueries.findByUserId(
          userId,
          status || undefined
        );
        return shifts;
      }

      if (locationId) {
        const shifts = await ShiftQueries.findByLocationId(
          locationId,
          status || undefined
        );
        return shifts;
      }

      if (status) {
        const shifts = await ShiftQueries.findByStatus(status);
        return shifts;
      }

      const shifts = await ShiftQueries.findByManagerId(auth!.identifier);
      return shifts;
    }
  );

export const POST = (request: NextRequest) =>
  wrapper(
    {
      request,
      requirePermission: Permission.MANAGER_CREATE_SHIFT_ANY,
      parser: createScheduleSchema,
    },
    async ({ auth, body }) => {
      // Verify location exists
      const location = await LocationQueries.findById(body.locationId);
      if (!location) {
        throw new Error("Location not found");
      }

      // Verify user exists
      const targetUser = await UserQueries.findById(body.userId);
      if (!targetUser) {
        throw new Error("User not found");
      }

      // Validate date range
      const scheduledStart = new Date(body.scheduledStart);
      const scheduledEnd = new Date(body.scheduledEnd);

      if (scheduledEnd <= scheduledStart) {
        throw new Error("Scheduled end time must be after start time");
      }

      // Check for overlapping shifts
      const existingShifts = await ShiftQueries.findByUserIdAndDateRange(
        body.userId,
        scheduledStart,
        scheduledEnd
      );

      const overlapping = existingShifts.filter(
        (shift) =>
          shift.status !== ShiftStatus.CANCELLED &&
          shift.status !== ShiftStatus.COMPLETED &&
          shift.status !== ShiftStatus.APPROVED
      );

      if (overlapping.length > 0) {
        throw new Error("User already has a scheduled shift during this time");
      }

      const shift = await ShiftMutations.createShift({
        userId: body.userId,
        managerId: auth!.identifier,
        locationId: body.locationId,
        scheduledStart,
        scheduledEnd,
        notes: body.notes,
        overrideAllowed: body.overrideAllowed,
      });

      return shift;
    }
  );
