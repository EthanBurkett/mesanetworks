import { NextRequest } from "next/server";
import { wrapper, Errors } from "@/lib/api-utils";
import {
  LocationMutations,
  LocationQueries,
} from "@/lib/db/models/Location.model";
import { z } from "zod";
import { createAuditLog } from "@/lib/audit-logger";
import { AuditAction, AuditSeverity } from "@/lib/audit-types";
import { Permission } from "@/lib/rbac";

// GET /api/v1/locations/:id - Get a specific location
export const GET = (
  request: NextRequest,
  context: { params: { id: string } }
) =>
  wrapper(
    {
      request,
      requirePermission: Permission.EMPLOYEE_READ_SHIFT_OWN,
    },
    async () => {
      const location = await LocationQueries.findById(context.params.id);

      if (!location) {
        throw new Errors.NotFound("Location not found");
      }

      return location;
    }
  );

const updateLocationSchema = z.object({
  name: z.string().min(1).optional(),
  addressLine1: z.string().min(1).optional(),
  addressLine2: z.string().optional(),
  city: z.string().min(1).optional(),
  state: z.string().min(1).optional(),
  postalCode: z.string().min(1).optional(),
  country: z.string().min(1).optional(),
  contact: z.string().optional(),
  isActive: z.boolean().optional(),
});

// PATCH /api/v1/locations/:id - Update a location
export const PATCH = (
  request: NextRequest,
  context: { params: { id: string } }
) =>
  wrapper(
    {
      request,
      requirePermission: Permission.MANAGER_UPDATE_SHIFT_ANY,
      parser: updateLocationSchema,
    },
    async ({ body, auth }) => {
      // Handle isActive separately
      let location;
      if (body.isActive !== undefined) {
        const { isActive, ...updateData } = body;

        // Update location details if any
        if (Object.keys(updateData).length > 0) {
          location = await LocationMutations.updateLocation(
            context.params.id,
            updateData
          );
        }

        // Update active status
        if (isActive) {
          location = await LocationMutations.reactivateLocation(
            context.params.id
          );
        } else {
          location = await LocationMutations.deactivateLocation(
            context.params.id
          );
        }
      } else {
        location = await LocationMutations.updateLocation(
          context.params.id,
          body
        );
      }

      await createAuditLog(
        {
          action: AuditAction.USER_UPDATE,
          description: `Updated location: ${location.name}`,
          resourceType: "location",
          resourceId: location._id,
          resourceName: location.name,
          metadata: { changes: body },
          severity: AuditSeverity.INFO,
        },
        { auth, request }
      );

      return location;
    }
  );

// DELETE /api/v1/locations/:id - Delete a location
export const DELETE = (
  request: NextRequest,
  context: { params: { id: string } }
) =>
  wrapper(
    {
      request,
      requirePermission: Permission.ADMIN_DELETE_SHIFT_ANY,
    },
    async ({ auth }) => {
      const location = await LocationMutations.deleteLocation(
        context.params.id
      );

      await createAuditLog(
        {
          action: AuditAction.USER_DELETE,
          description: `Deleted location: ${location.name}`,
          resourceType: "location",
          resourceId: location._id,
          resourceName: location.name,
          severity: AuditSeverity.WARNING,
        },
        { auth, request }
      );

      return { message: "Location deleted successfully" };
    }
  );
