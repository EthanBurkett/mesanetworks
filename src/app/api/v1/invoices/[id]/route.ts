import { type NextRequest } from "next/server";
import { wrapper, Errors } from "@/lib/api-utils";
import { updateInvoiceSchema } from "@/schemas/invoice.schema";
import { InvoiceQueries } from "@/lib/db/models/Invoice.model";
import { Permission } from "@/lib/rbac/permissions";
import { createAuditLog } from "@/lib/audit-logger";
import { AuditAction, AuditSeverity } from "@/lib/audit-types";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET /api/v1/invoices/[id] - Get invoice by ID
export const GET = (request: NextRequest, context: RouteContext) =>
  wrapper(
    {
      request,
      requireAuth: true, // Changed to allow users to view their own invoices
    },
    async ({ auth }) => {
      if (!auth) throw new Errors.Unauthorized("Authentication required");

      const { id } = await context.params;
      const invoice = await InvoiceQueries.findById(id);

      if (!invoice) {
        throw new Errors.NotFound("Invoice not found");
      }

      // If user doesn't have INVOICE_READ permission, verify they own this invoice
      const hasReadPermission = auth.permissions?.permissions.includes(
        Permission.INVOICE_READ
      );
      if (!hasReadPermission && invoice.customerEmail !== auth.user.email) {
        throw new Errors.Forbidden(
          "You don't have permission to view this invoice"
        );
      }

      await createAuditLog(
        {
          action: AuditAction.INVOICE_CREATE,
          description: `Viewed invoice ${invoice.invoiceNumber}`,
          resourceType: "invoice",
          resourceId: invoice._id,
          resourceName: invoice.invoiceNumber,
          severity: AuditSeverity.INFO,
        },
        { auth, request }
      );

      return invoice;
    }
  );

// PUT /api/v1/invoices/[id] - Update invoice
export const PUT = (request: NextRequest, context: RouteContext) =>
  wrapper(
    {
      request,
      parser: updateInvoiceSchema,
      requirePermission: Permission.INVOICE_UPDATE,
    },
    async ({ auth, body }) => {
      if (!auth) throw new Errors.Unauthorized("Authentication required");

      const { id } = await context.params;

      // If items are updated, recalculate totals
      let updateData: any = { ...body };

      if (body.items) {
        const subtotal = body.items.reduce((sum, item) => sum + item.amount, 0);
        const taxAmount = body.items.reduce((sum, item) => {
          if (item.taxRate) {
            return sum + (item.amount * item.taxRate) / 100;
          }
          return sum;
        }, 0);
        const total = subtotal + taxAmount - (body.discountAmount || 0);

        updateData = {
          ...updateData,
          subtotal,
          taxAmount,
          total,
        };
      }

      // Convert date strings to Date objects
      if (body.issueDate) {
        updateData.issueDate = new Date(body.issueDate);
      }
      if (body.dueDate) {
        updateData.dueDate = new Date(body.dueDate);
      }

      const invoice = await InvoiceQueries.update(id, updateData);

      await createAuditLog(
        {
          action: AuditAction.INVOICE_UPDATE,
          description: `Updated invoice ${invoice.invoiceNumber}`,
          resourceType: "invoice",
          resourceId: invoice._id,
          resourceName: invoice.invoiceNumber,
          severity: AuditSeverity.INFO,
          metadata: { changes: body },
        },
        { auth, request }
      );

      return invoice;
    }
  );

// DELETE /api/v1/invoices/[id] - Delete invoice
export const DELETE = (request: NextRequest, context: RouteContext) =>
  wrapper(
    {
      request,
      requirePermission: Permission.INVOICE_DELETE,
    },
    async ({ auth }) => {
      if (!auth) throw new Errors.Unauthorized("Authentication required");

      const { id } = await context.params;
      const invoice = await InvoiceQueries.delete(id);

      await createAuditLog(
        {
          action: AuditAction.INVOICE_DELETE,
          description: `Deleted invoice ${invoice.invoiceNumber}`,
          resourceType: "invoice",
          resourceId: invoice._id,
          resourceName: invoice.invoiceNumber,
          severity: AuditSeverity.WARNING,
        },
        { auth, request }
      );

      return { message: "Invoice deleted successfully" };
    }
  );
