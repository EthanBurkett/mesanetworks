import { type NextRequest } from "next/server";
import { wrapper, Errors } from "@/lib/api-utils";
import { InvoiceQueries } from "@/lib/db/models/Invoice.model";
import { Permission } from "@/lib/rbac/permissions";
import { createAuditLog } from "@/lib/audit-logger";
import { AuditAction, AuditSeverity } from "@/lib/audit-types";
import { stripeService } from "@/app/services/Stripe.service";

// POST /api/v1/invoices/sync - Sync invoice statuses with Stripe
export const POST = (request: NextRequest) =>
  wrapper(
    {
      request,
      requirePermission: Permission.INVOICE_UPDATE,
    },
    async ({ auth }) => {
      if (!auth) throw new Errors.Unauthorized("Authentication required");

      // Get all invoices with Stripe invoice IDs that aren't already paid/cancelled
      const result = await InvoiceQueries.findAll({
        limit: 1000, // Adjust as needed
      });

      const invoicesToSync = result.invoices.filter(
        (inv) =>
          inv.stripeInvoiceId &&
          inv.status !== "paid" &&
          inv.status !== "cancelled" &&
          inv.status !== "refunded"
      );

      let syncedCount = 0;
      let updatedCount = 0;
      const errors: Array<{ invoiceId: string; error: string }> = [];

      for (const invoice of invoicesToSync) {
        try {
          const stripeInvoice = await stripeService.retrieveInvoice(
            invoice.stripeInvoiceId!
          );

          syncedCount++;

          // Map Stripe status to our status
          let newStatus = invoice.status;
          if (stripeInvoice.status === "paid") {
            newStatus = "paid";
          } else if (stripeInvoice.status === "void") {
            newStatus = "cancelled";
          } else if (stripeInvoice.status === "uncollectible") {
            newStatus = "cancelled";
          } else if (stripeInvoice.status === "open") {
            // Check if overdue
            const dueDate = new Date(invoice.dueDate);
            if (dueDate < new Date()) {
              newStatus = "overdue";
            } else {
              newStatus = "pending";
            }
          }

          // Only update if status changed
          if (newStatus !== invoice.status) {
            const updateData: any = { status: newStatus };

            // If paid, record payment date
            if (
              newStatus === "paid" &&
              stripeInvoice.status_transitions?.paid_at
            ) {
              updateData.paidDate = new Date(
                stripeInvoice.status_transitions.paid_at * 1000
              );
            }

            await InvoiceQueries.update(invoice._id, updateData);
            updatedCount++;

            await createAuditLog(
              {
                action: AuditAction.INVOICE_UPDATE,
                description: `Synced invoice ${invoice.invoiceNumber} status from Stripe: ${invoice.status} → ${newStatus}`,
                resourceType: "invoice",
                resourceId: invoice._id,
                resourceName: invoice.invoiceNumber,
                severity: AuditSeverity.INFO,
                metadata: {
                  oldStatus: invoice.status,
                  newStatus,
                  stripeInvoiceId: invoice.stripeInvoiceId,
                },
              },
              { auth, request }
            );
          }
        } catch (error: any) {
          errors.push({
            invoiceId: invoice._id,
            error: error.message || "Unknown error",
          });
        }
      }

      await createAuditLog(
        {
          action: AuditAction.INVOICE_UPDATE,
          description: `Synced ${syncedCount} invoices with Stripe, updated ${updatedCount}`,
          resourceType: "invoice",
          severity: AuditSeverity.INFO,
          metadata: {
            totalInvoices: invoicesToSync.length,
            syncedCount,
            updatedCount,
            errorCount: errors.length,
          },
        },
        { auth, request }
      );

      return {
        success: true,
        totalInvoices: invoicesToSync.length,
        syncedCount,
        updatedCount,
        errorCount: errors.length,
        errors: errors.length > 0 ? errors : undefined,
      };
    }
  );

// GET /api/v1/invoices/sync - Trigger sync (for cron jobs without auth)
export const GET = async (request: NextRequest) => {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return Response.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    // Get all invoices with Stripe invoice IDs that aren't already paid/cancelled
    const result = await InvoiceQueries.findAll({
      limit: 1000,
    });

    const invoicesToSync = result.invoices.filter(
      (inv) =>
        inv.stripeInvoiceId &&
        inv.status !== "paid" &&
        inv.status !== "cancelled" &&
        inv.status !== "refunded"
    );

    let syncedCount = 0;
    let updatedCount = 0;
    const errors: Array<{ invoiceId: string; error: string }> = [];

    for (const invoice of invoicesToSync) {
      try {
        const stripeInvoice = await stripeService.retrieveInvoice(
          invoice.stripeInvoiceId!
        );

        syncedCount++;

        // Map Stripe status to our status
        let newStatus = invoice.status;
        if (stripeInvoice.status === "paid") {
          newStatus = "paid";
        } else if (stripeInvoice.status === "void") {
          newStatus = "cancelled";
        } else if (stripeInvoice.status === "uncollectible") {
          newStatus = "cancelled";
        } else if (stripeInvoice.status === "open") {
          // Check if overdue
          const dueDate = new Date(invoice.dueDate);
          if (dueDate < new Date()) {
            newStatus = "overdue";
          } else {
            newStatus = "pending";
          }
        }

        // Only update if status changed
        if (newStatus !== invoice.status) {
          const updateData: any = { status: newStatus };

          // If paid, record payment date
          if (
            newStatus === "paid" &&
            stripeInvoice.status_transitions?.paid_at
          ) {
            updateData.paidDate = new Date(
              stripeInvoice.status_transitions.paid_at * 1000
            );
          }

          await InvoiceQueries.update(invoice._id, updateData);
          updatedCount++;
        }
      } catch (error: any) {
        errors.push({
          invoiceId: invoice._id,
          error: error.message || "Unknown error",
        });
      }
    }

    return Response.json({
      success: true,
      totalInvoices: invoicesToSync.length,
      syncedCount,
      updatedCount,
      errorCount: errors.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    return Response.json(
      {
        success: false,
        message: error.message || "Sync failed",
      },
      { status: 500 }
    );
  }
};
