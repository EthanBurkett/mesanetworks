import { type NextRequest } from "next/server";
import { wrapper, Errors } from "@/lib/api-utils";
import { markAsPaidSchema } from "@/schemas/invoice.schema";
import { InvoiceQueries } from "@/lib/db/models/Invoice.model";
import { Permission } from "@/lib/rbac/permissions";
import { createAuditLog } from "@/lib/audit-logger";
import { AuditAction, AuditSeverity } from "@/lib/audit-types";
import { stripeService } from "@/app/services/Stripe.service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// POST /api/v1/invoices/[id]/mark-paid - Mark invoice as paid
export const POST = (request: NextRequest, context: RouteContext) =>
  wrapper(
    {
      request,
      parser: markAsPaidSchema,
      requirePermission: Permission.INVOICE_UPDATE,
    },
    async ({ auth, body }) => {
      if (!auth) throw new Errors.Unauthorized("Authentication required");

      const { id } = await context.params;

      const invoice = await InvoiceQueries.findById(id);
      if (!invoice) {
        throw new Errors.NotFound("Invoice not found");
      }

      // If payment was made via Stripe invoice, mark it as paid in Stripe
      if (body.paymentMethod === "stripe" && invoice.stripeInvoiceId) {
        await stripeService.markInvoiceAsPaid(invoice.stripeInvoiceId);
      }

      const updatedInvoice = await InvoiceQueries.markAsPaid(id, body);

      await createAuditLog(
        {
          action: AuditAction.INVOICE_MARK_PAID,
          description: `Marked invoice ${invoice.invoiceNumber} as paid`,
          resourceType: "invoice",
          resourceId: invoice._id,
          resourceName: invoice.invoiceNumber,
          severity: AuditSeverity.INFO,
          metadata: {
            paymentMethod: body.paymentMethod,
            amount: invoice.total,
          },
        },
        { auth, request }
      );

      return updatedInvoice;
    }
  );
