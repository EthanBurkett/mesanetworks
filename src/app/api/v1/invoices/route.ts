import { type NextRequest } from "next/server";
import { wrapper, Errors } from "@/lib/api-utils";
import {
  createInvoiceSchema,
  updateInvoiceSchema,
} from "@/schemas/invoice.schema";
import { InvoiceQueries } from "@/lib/db/models/Invoice.model";
import { Permission } from "@/lib/rbac/permissions";
import { createAuditLog } from "@/lib/audit-logger";
import { AuditAction, AuditSeverity } from "@/lib/audit-types";
import { sendEmail } from "@/lib/email/email-service";
import { readFileSync } from "fs";
import { join } from "path";
import { env } from "@/config/env";

// GET /api/v1/invoices - Get all invoices
export const GET = (request: NextRequest) =>
  wrapper(
    {
      request,
      requireAuth: true, // Changed from requirePermission to allow users to view their own
    },
    async ({ auth }) => {
      if (!auth) throw new Errors.Unauthorized("Authentication required");

      const url = new URL(request.url);
      const status = url.searchParams.get("status") || undefined;
      let customerEmail = url.searchParams.get("customerEmail") || undefined;
      const page = parseInt(url.searchParams.get("page") || "1", 10);
      const limit = parseInt(url.searchParams.get("limit") || "50", 10);
      const sortBy = url.searchParams.get("sortBy") || "_createdAt";
      const sortOrder = (url.searchParams.get("sortOrder") || "desc") as
        | "asc"
        | "desc";

      // If user doesn't have INVOICE_READ permission, only show their own invoices
      const hasReadPermission = auth.permissions?.permissions.includes(
        Permission.INVOICE_READ
      );
      if (!hasReadPermission) {
        customerEmail = auth.user.email; // Force filter to their email
      }

      const result = await InvoiceQueries.findAll({
        status: status as any,
        customerEmail,
        page,
        limit,
        sortBy,
        sortOrder,
      });

      await createAuditLog(
        {
          action: AuditAction.INVOICE_CREATE,
          description: `Listed ${result.invoices.length} invoices`,
          resourceType: "invoice",
          severity: AuditSeverity.INFO,
          metadata: {
            filters: { status, customerEmail, page, limit },
            resultCount: result.invoices.length,
          },
        },
        { auth, request }
      );

      return result;
    }
  );

// POST /api/v1/invoices - Create new invoice
export const POST = (request: NextRequest) =>
  wrapper(
    {
      request,
      parser: createInvoiceSchema,
      requirePermission: Permission.INVOICE_CREATE,
    },
    async ({ auth, body }) => {
      if (!auth) throw new Errors.Unauthorized("Authentication required");

      // Calculate totals
      const subtotal = body.items.reduce((sum, item) => sum + item.amount, 0);
      const taxAmount = body.items.reduce((sum, item) => {
        if (item.taxRate) {
          return sum + (item.amount * item.taxRate) / 100;
        }
        return sum;
      }, 0);
      const total = subtotal + taxAmount - (body.discountAmount || 0);

      // Generate invoice number
      const invoiceNumber = await InvoiceQueries.generateInvoiceNumber();

      // Create invoice
      const invoice = await InvoiceQueries.create({
        ...body,
        invoiceNumber,
        subtotal,
        taxAmount,
        total,
        status: "draft",
        createdBy: auth.user._id,
        issueDate: new Date(body.issueDate),
        dueDate: new Date(body.dueDate),
      });

      // Send email notification
      try {
        const templatePath = join(
          process.cwd(),
          "public",
          "email-templates",
          "invoice-created.html"
        );
        let emailHtml = readFileSync(templatePath, "utf-8");

        // Format dates
        const formatDate = (date: Date) =>
          new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });

        // Build items HTML
        const itemsHtml = invoice.items
          .map(
            (item) => `
            <tr>
              <td style="padding: 12px; border: 1px solid #e5e7eb; color: #374151;">
                ${item.description}
              </td>
              <td style="padding: 12px; border: 1px solid #e5e7eb; text-align: center; color: #374151;">
                ${item.quantity}
              </td>
              <td style="padding: 12px; border: 1px solid #e5e7eb; text-align: right; font-family: 'Courier New', monospace; color: #374151;">
                $${(item.amount / 100).toFixed(2)}
              </td>
            </tr>
          `
          )
          .join("");

        // Build tax row
        const taxRow =
          invoice.taxAmount > 0
            ? `
            <tr>
              <td colspan="2" style="padding: 12px; text-align: right; border: 1px solid #e5e7eb; background-color: #fafafa; font-weight: 600;">Tax:</td>
              <td style="padding: 12px; text-align: right; border: 1px solid #e5e7eb; background-color: #fafafa; font-family: 'Courier New', monospace;">$${(
                invoice.taxAmount / 100
              ).toFixed(2)}</td>
            </tr>
          `
            : "";

        // Build discount row
        const discountRow =
          invoice.discountAmount > 0
            ? `
            <tr>
              <td colspan="2" style="padding: 12px; text-align: right; border: 1px solid #e5e7eb; background-color: #fafafa; font-weight: 600; color: #dc2626;">Discount:</td>
              <td style="padding: 12px; text-align: right; border: 1px solid #e5e7eb; background-color: #fafafa; font-family: 'Courier New', monospace; color: #dc2626;">-$${(
                invoice.discountAmount / 100
              ).toFixed(2)}</td>
            </tr>
          `
            : "";

        // Build notes section
        const notesHtml = invoice.notes
          ? `
            <div style="margin: 20px 0; padding: 15px; background-color: #f0f9ff; border-left: 4px solid #3b82f6; border-radius: 4px;">
              <p style="margin: 0; color: #1e40af; font-size: 14px;"><strong>Note:</strong> ${invoice.notes}</p>
            </div>
          `
          : "";

        // Replace placeholders
        emailHtml = emailHtml
          .replace(/{{INVOICE_NUMBER}}/g, invoice.invoiceNumber)
          .replace(/{{CUSTOMER_NAME}}/g, invoice.customerName)
          .replace(/{{ISSUE_DATE}}/g, formatDate(invoice.issueDate))
          .replace(/{{DUE_DATE}}/g, formatDate(invoice.dueDate))
          .replace(/{{SUBTOTAL}}/g, (invoice.subtotal / 100).toFixed(2))
          .replace(/{{TOTAL}}/g, (invoice.total / 100).toFixed(2))
          .replace(/{{ITEMS}}/g, itemsHtml)
          .replace(/{{TAX_ROW}}/g, taxRow)
          .replace(/{{DISCOUNT_ROW}}/g, discountRow)
          .replace(/{{NOTES}}/g, notesHtml)
          .replace(
            /{{INVOICE_URL}}/g,
            `${env.APP_URL}/invoices/${invoice._id}`
          );

        await sendEmail({
          to: invoice.customerEmail,
          subject: `New Invoice #${invoice.invoiceNumber} from Mesa Networks`,
          html: emailHtml,
        });
      } catch (emailError) {
        console.error("Failed to send invoice email:", emailError);
        // Don't fail invoice creation if email fails
      }

      await createAuditLog(
        {
          action: AuditAction.INVOICE_CREATE,
          description: `Created invoice ${invoice.invoiceNumber} for ${invoice.customerEmail}`,
          resourceType: "invoice",
          resourceId: invoice._id,
          resourceName: invoice.invoiceNumber,
          severity: AuditSeverity.INFO,
          metadata: {
            total: invoice.total,
            customerEmail: invoice.customerEmail,
          },
        },
        { auth, request }
      );

      return invoice;
    }
  );
