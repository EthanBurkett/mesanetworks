import { type NextRequest } from "next/server";
import { wrapper, Errors } from "@/lib/api-utils";
import { InvoiceQueries } from "@/lib/db/models/Invoice.model";
import { Permission } from "@/lib/rbac/permissions";
import { createAuditLog } from "@/lib/audit-logger";
import { AuditAction, AuditSeverity } from "@/lib/audit-types";
import { stripeService } from "@/app/services/Stripe.service";
import { sendEmail } from "@/lib/email/email-service";
import { readFileSync } from "fs";
import { join } from "path";
import { getTransporter } from "@/lib/email";
import { env } from "@/config/env";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// POST /api/v1/invoices/[id]/send - Send invoice to customer
export const POST = (request: NextRequest, context: RouteContext) =>
  wrapper(
    {
      request,
      requirePermission: Permission.INVOICE_UPDATE,
    },
    async ({ auth }) => {
      if (!auth) throw new Errors.Unauthorized("Authentication required");

      const { id } = await context.params;

      const invoice = await InvoiceQueries.findById(id);
      if (!invoice) {
        throw new Errors.NotFound("Invoice not found");
      }

      // Create Stripe invoice if not already created
      let stripeInvoiceId = invoice.stripeInvoiceId;
      if (!stripeInvoiceId) {
        const stripeInvoice = await stripeService.createInvoice(invoice);
        stripeInvoiceId = stripeInvoice.id;

        // Finalize and send via Stripe
        await stripeService.finalizeAndSendInvoice(stripeInvoiceId);

        // Update invoice with Stripe info
        await InvoiceQueries.update(id, {
          stripeInvoiceId,
          stripeCustomerId: stripeInvoice.customer as string,
          status: "pending",
        });
      } else {
        // Already has Stripe invoice, just send it
        await stripeService.finalizeAndSendInvoice(stripeInvoiceId);
      }

      // Also send email notification
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
        .replace(/{{INVOICE_URL}}/g, `${env.APP_URL}/invoices/${invoice._id}`);

      await sendEmail({
        to: invoice.customerEmail,
        subject: `Invoice ${invoice.invoiceNumber} from Mesa Networks`,
        html: emailHtml,
      });

      await createAuditLog(
        {
          action: AuditAction.INVOICE_SEND,
          description: `Sent invoice ${invoice.invoiceNumber} to ${invoice.customerEmail}`,
          resourceType: "invoice",
          resourceId: invoice._id,
          resourceName: invoice.invoiceNumber,
          severity: AuditSeverity.INFO,
          metadata: {
            customerEmail: invoice.customerEmail,
            stripeInvoiceId,
          },
        },
        { auth, request }
      );

      return { stripeInvoiceId };
    }
  );
