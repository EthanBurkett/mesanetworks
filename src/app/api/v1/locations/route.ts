import { NextRequest, NextResponse } from "next/server";
import { wrapper } from "@/lib/api-utils";
import {
  LocationMutations,
  LocationQueries,
} from "@/lib/db/models/Location.model";
import { z } from "zod";
import { createAuditLog } from "@/lib/audit-logger";
import { AuditAction, AuditSeverity } from "@/lib/audit-types";
import { Permission } from "@/lib/rbac";

// GET /api/v1/locations - Get all locations
export const GET = (request: NextRequest) =>
  wrapper(
    {
      request,
      requirePermission: Permission.EMPLOYEE_READ_SHIFT_OWN,
    },
    async () => {
      const { searchParams } = new URL(request.url);
      const activeOnly = searchParams.get("activeOnly") === "true";
      const search = searchParams.get("search");
      const city = searchParams.get("city");
      const state = searchParams.get("state");

      let locations;

      if (search) {
        locations = await LocationQueries.searchByName(search);
      } else if (city) {
        locations = await LocationQueries.findByCity(city);
      } else if (state) {
        locations = await LocationQueries.findByState(state);
      } else {
        locations = await LocationQueries.findAll(activeOnly);
      }

      return locations;
    }
  );

const createLocationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  addressLine1: z.string().min(1, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  contact: z.string().optional(),
});

// POST /api/v1/locations - Create a new location
export const POST = (request: NextRequest) =>
  wrapper(
    {
      request,
      requirePermission: Permission.MANAGER_CREATE_SHIFT_ANY,
      parser: createLocationSchema,
    },
    async ({ body, auth }) => {
      const location = await LocationMutations.createLocation(body);

      await createAuditLog(
        {
          action: AuditAction.USER_CREATE,
          description: `Created location: ${location.name}`,
          resourceType: "location",
          resourceId: location._id,
          resourceName: location.name,
          severity: AuditSeverity.INFO,
        },
        { auth, request }
      );

      return location;
    }
  );
