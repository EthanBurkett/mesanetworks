import { type NextRequest } from "next/server";
import { wrapper, Errors } from "@/lib/api-utils";
import { InvoiceQueries } from "@/lib/db/models/Invoice.model";
import { createAuditLog } from "@/lib/audit-logger";
import { AuditAction, AuditSeverity } from "@/lib/audit-types";
import { stripeService } from "@/app/services/Stripe.service";
import { Permission } from "@/lib/rbac";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// POST /api/v1/invoices/[id]/pay - Process payment for invoice
export const POST = (request: NextRequest, context: RouteContext) =>
  wrapper(
    {
      request,
      requireAuth: true, // Allow any authenticated user to pay their own invoices
    },
    async ({ auth }) => {
      if (!auth) throw new Errors.Unauthorized("Authentication required");

      const { id } = await context.params;

      const invoice = await InvoiceQueries.findById(id);
      if (!invoice) {
        throw new Errors.NotFound("Invoice not found");
      }

      // Verify user owns this invoice (unless they have permission)
      const hasPayPermission = auth.permissions.permissions.includes(
        Permission.INVOICE_UPDATE
      );
      if (!hasPayPermission && invoice.customerEmail !== auth.user.email) {
        throw new Errors.Forbidden(
          "You don't have permission to pay this invoice"
        );
      }

      // Check if invoice is already paid
      if (invoice.status === "paid") {
        throw new Errors.BadRequest("Invoice is already paid");
      }

      // Check if invoice is cancelled
      if (invoice.status === "cancelled") {
        throw new Errors.BadRequest("Cannot pay a cancelled invoice");
      }

      // Create or retrieve Stripe invoice
      let stripeInvoiceId = invoice.stripeInvoiceId;
      if (!stripeInvoiceId) {
        const stripeInvoice = await stripeService.createInvoice(invoice);
        stripeInvoiceId = stripeInvoice.id;

        // Update invoice with Stripe info
        await InvoiceQueries.update(id, {
          stripeInvoiceId,
          stripeCustomerId: stripeInvoice.customer as string,
        });
      }

      // Finalize the Stripe invoice (makes it payable)
      await stripeService.finalizeAndSendInvoice(stripeInvoiceId);

      // Get payment URL from Stripe
      const stripeInvoice = await stripeService.retrieveInvoice(
        stripeInvoiceId
      );

      await createAuditLog(
        {
          action: AuditAction.INVOICE_PAYMENT,
          description: `Initiated payment for invoice ${invoice.invoiceNumber}`,
          resourceType: "invoice",
          resourceId: invoice._id,
          resourceName: invoice.invoiceNumber,
          severity: AuditSeverity.INFO,
          metadata: {
            customerEmail: invoice.customerEmail,
            stripeInvoiceId,
            total: invoice.total,
          },
        },
        { auth, request }
      );

      return {
        stripeInvoiceId,
        paymentUrl: stripeInvoice.hosted_invoice_url,
      };
    }
  );
