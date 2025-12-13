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
import { Params } from "@/types/request";

// GET /api/v1/locations/:id - Get a specific location
export const GET = async (
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  const params = context.params;
  return wrapper(
    {
      request,
      params,
      requirePermission: Permission.EMPLOYEE_READ_SHIFT_OWN,
    },
    async ({ params }) => {
      const location = await LocationQueries.findById(params!.id);

      if (!location) {
        throw new Errors.NotFound("Location not found");
      }

      return location;
    }
  );
};

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
export const PATCH = async (
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  const params = await context.params;
  return wrapper(
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
            params.id,
            updateData
          );
        }

        // Update active status
        if (isActive) {
          location = await LocationMutations.reactivateLocation(params.id);
        } else {
          location = await LocationMutations.deactivateLocation(params.id);
        }
      } else {
        location = await LocationMutations.updateLocation(params.id, body);
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
};

// DELETE /api/v1/locations/:id - Delete a location
export const DELETE = async (
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  const params = await context.params;
  return wrapper(
    {
      request,
      requirePermission: Permission.ADMIN_DELETE_SHIFT_ANY,
    },
    async ({ auth }) => {
      const location = await LocationMutations.deleteLocation(params.id);

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
};
