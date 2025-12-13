import { Errors, wrapper } from "@/lib/api-utils";
import { PunchQueries, PunchMutations } from "@/lib/db/models/Punch.model";
import { hasPermission, Permission } from "@/lib/rbac";
import { Params } from "@/types/request";
import { NextRequest } from "next/server";
import { updatePunchNotesSchema } from "@/schemas/timesheet.schema";

export const GET = (request: NextRequest, { params }: Params<"id">) =>
  wrapper(
    {
      request,
      requirePermission: Permission.EMPLOYEE_READ_TIMESHEET_OWN,
      params,
    },
    async ({ params, auth }) => {
      if (!auth) throw new Errors.Unauthorized("Authentication required");
      if (!params) throw new Errors.BadRequest("Punch ID is required");

      const punch = await PunchQueries.findByIdPopulated(params.id);

      if (!punch) {
        throw new Errors.NotFound("Punch not found");
      }

      const readAny = hasPermission(
        auth.permissions,
        Permission.MANAGER_READ_TIMESHEET_ANY
      );

      if (!readAny && punch.userId.toString() !== auth.user._id) {
        throw new Errors.Forbidden("Access denied to this punch record");
      }

      return punch;
    }
  );

export const PATCH = (request: NextRequest, { params }: Params<"id">) =>
  wrapper(
    {
      request,
      requirePermission: Permission.MANAGER_UPDATE_SHIFT_ANY,
      params,
      parser: updatePunchNotesSchema,
    },
    async ({ params, body }) => {
      if (!params) throw new Errors.BadRequest("Punch ID is required");

      const punch = await PunchQueries.findById(params.id);
      if (!punch) {
        throw new Errors.NotFound("Punch not found");
      }

      // Punches are immutable - only allow adding notes
      const updatedPunch = await PunchMutations.addNotes(params.id, body.notes);

      return updatedPunch;
    }
  );

export const DELETE = (request: NextRequest, { params }: Params<"id">) =>
  wrapper(
    {
      request,
      requirePermission: Permission.ADMIN_DELETE_TIMESHEET_ANY,
      params,
    },
    async ({ params }) => {
      if (!params) throw new Errors.BadRequest("Punch ID is required");

      const punch = await PunchQueries.findById(params.id);
      if (!punch) {
        throw new Errors.NotFound("Punch not found");
      }

      await PunchMutations.deletePunch(params.id);

      return { message: "Punch deleted successfully" };
    }
  );
