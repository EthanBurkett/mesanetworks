import { type NextRequest } from "next/server";
import { wrapper, Errors } from "@/lib/api-utils";
import { InvoiceQueries } from "@/lib/db/models/Invoice.model";
import { Permission } from "@/lib/rbac/permissions";

// GET /api/v1/invoices/statistics - Get invoice statistics
export const GET = (request: NextRequest) =>
  wrapper(
    {
      request,
      requirePermission: Permission.INVOICE_READ,
    },
    async ({ auth }) => {
      if (!auth) throw new Errors.Unauthorized("Authentication required");

      const statistics = await InvoiceQueries.getStatistics();

      return statistics;
    }
  );
