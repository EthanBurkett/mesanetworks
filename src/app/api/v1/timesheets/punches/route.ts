import { Errors, wrapper } from "@/lib/api-utils";
import { PunchQueries, PunchMutations } from "@/lib/db/models/Punch.model";
import { ShiftQueries, ShiftMutations } from "@/lib/db/models/Shift.model";
import { LocationQueries } from "@/lib/db/models/Location.model";
import { hasPermission, Permission } from "@/lib/rbac";
import { NextRequest } from "next/server";
import { createPunchSchema } from "@/schemas/timesheet.schema";
import { PunchType, ShiftStatus } from "@/types/scheduling";

export const GET = (request: NextRequest) =>
  wrapper(
    {
      request,
      requirePermission: Permission.EMPLOYEE_READ_TIMESHEET_OWN,
    },
    async ({ auth }) => {
      if (!auth) throw new Errors.Unauthorized("Authentication required");

      const url = new URL(request.url);
      const allParam = url.searchParams.get("all");
      const shiftId = url.searchParams.get("shiftId");
      const startDate = url.searchParams.get("startDate");
      const endDate = url.searchParams.get("endDate");

      const readAll =
        (allParam === "" || allParam === "1" || allParam === "true") &&
        hasPermission(auth.permissions, Permission.MANAGER_READ_TIMESHEET_ANY);

      if (readAll) {
        return PunchQueries.findAll();
      }

      if (shiftId) {
        return PunchQueries.findByShiftId(shiftId);
      }

      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return PunchQueries.findByUserIdAndDateRange(auth.user._id, start, end);
      }

      return PunchQueries.findByUserId(auth.user._id);
    }
  );

export const POST = (request: NextRequest) =>
  wrapper(
    {
      request,
      requirePermission: Permission.EMPLOYEE_CLOCK_SHIFT_OWN,
      parser: createPunchSchema,
    },
    async ({ auth, body }) => {
      if (!auth) throw new Errors.Unauthorized("Authentication required");

      // Verify shift exists and user has access
      const shift = await ShiftQueries.findById(body.shiftId);
      if (!shift) {
        throw new Errors.NotFound("Shift not found");
      }

      // Verify location exists
      const location = await LocationQueries.findById(body.locationId);
      if (!location) {
        throw new Errors.NotFound("Location not found");
      }

      // Check ownership unless has manager permissions
      const canPunchAny = hasPermission(
        auth.permissions,
        Permission.MANAGER_CREATE_SHIFT_ANY
      );

      // Handle populated userId (object) or string ID
      let shiftUserId: string;
      if (typeof shift.userId === "string") {
        shiftUserId = shift.userId;
      } else if (shift.userId && typeof shift.userId === "object") {
        shiftUserId =
          (shift.userId as any)._id?.toString() || (shift.userId as any)._id;
      } else {
        shiftUserId = String(shift.userId);
      }

      // Convert auth.user._id to string for comparison (it may be an ObjectId)
      const authUserId = auth.user._id.toString();

      if (!canPunchAny && shiftUserId !== authUserId) {
        throw new Errors.Forbidden(
          "Cannot create punch for another user's shift"
        );
      }

      const timestamp = body.timestamp ? new Date(body.timestamp) : new Date();

      // Get actual user ID for punch creation
      const userId =
        typeof shift.userId === "string"
          ? shift.userId
          : (shift.userId as any)._id?.toString() || (shift.userId as any)._id;

      // Call appropriate mutation based on punch type
      let punch;
      switch (body.type) {
        case PunchType.CLOCK_IN:
          punch = await PunchMutations.clockIn(
            userId,
            body.shiftId,
            body.locationId,
            timestamp,
            {
              ipAddress: request.headers.get("x-forwarded-for") || undefined,
              geolocation: body.geolocation,
            }
          );
          break;

        case PunchType.CLOCK_OUT:
          punch = await PunchMutations.clockOut(
            userId,
            body.shiftId,
            body.locationId,
            timestamp,
            {
              ipAddress: request.headers.get("x-forwarded-for") || undefined,
              geolocation: body.geolocation,
            }
          );
          break;

        case PunchType.BREAK_START:
          punch = await PunchMutations.startBreak(
            userId,
            body.shiftId,
            body.locationId,
            timestamp,
            body.notes
          );
          break;

        case PunchType.BREAK_END:
          punch = await PunchMutations.endBreak(
            userId,
            body.shiftId,
            body.locationId,
            timestamp,
            body.notes
          );
          break;

        default:
          throw new Errors.BadRequest(`Invalid punch type: ${body.type}`);
      }

      // Update shift based on punch type
      switch (body.type) {
        case PunchType.CLOCK_IN:
          // Set actualStart and change status to IN_PROGRESS
          await ShiftMutations.startShift(body.shiftId, timestamp);
          break;

        case PunchType.CLOCK_OUT:
          // Set actualEnd, calculate break minutes, and change status to COMPLETED
          const breakMinutes = await PunchQueries.calculateBreakMinutesForShift(
            body.shiftId
          );
          await ShiftMutations.completeShift(
            body.shiftId,
            timestamp,
            breakMinutes
          );
          break;

        case PunchType.BREAK_END:
          // Update break minutes in the shift
          const updatedBreakMinutes =
            await PunchQueries.calculateBreakMinutesForShift(body.shiftId);
          const shiftToUpdate = await ShiftQueries.findById(body.shiftId);
          if (shiftToUpdate) {
            shiftToUpdate.breakMinutes = updatedBreakMinutes;
            await shiftToUpdate.save();
          }
          break;
      }

      return punch;
    }
  );
