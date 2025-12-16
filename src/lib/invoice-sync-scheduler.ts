import cron from "node-cron";
import { InvoiceQueries } from "@/lib/db/models/Invoice.model";
import { stripeService } from "@/app/services/Stripe.service";

let isRunning = false;
let lastRunTime: Date | null = null;
let lastSyncResult: {
  syncedCount: number;
  updatedCount: number;
  errorCount: number;
} | null = null;

async function syncInvoiceStatuses() {
  if (isRunning) {
    console.log("[Invoice Sync] Already running, skipping...");
    return;
  }

  isRunning = true;
  console.log("[Invoice Sync] Starting sync at", new Date().toISOString());

  try {
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
    let errorCount = 0;

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

          console.log(
            `[Invoice Sync] Updated ${invoice.invoiceNumber}: ${invoice.status} → ${newStatus}`
          );
        }
      } catch (error: any) {
        errorCount++;
        console.error(
          `[Invoice Sync] Error syncing invoice ${invoice._id}:`,
          error.message
        );
      }
    }

    lastRunTime = new Date();
    lastSyncResult = { syncedCount, updatedCount, errorCount };

    console.log(
      `[Invoice Sync] Completed: ${syncedCount} synced, ${updatedCount} updated, ${errorCount} errors`
    );
  } catch (error: any) {
    console.error("[Invoice Sync] Fatal error:", error.message);
  } finally {
    isRunning = false;
  }
}

// Schedule sync every minute
export const invoiceSyncScheduler = cron.schedule(
  "*/1 * * * *",
  syncInvoiceStatuses,
  {
    scheduled: false, // Don't start automatically
    timezone: "America/Chicago", // Adjust to your timezone
  }
);

// Export status info
export function getSchedulerStatus() {
  return {
    isRunning,
    lastRunTime,
    lastSyncResult,
    isScheduled: invoiceSyncScheduler.getStatus() === "scheduled",
  };
}

// Start the scheduler
export function startInvoiceSync() {
  console.log("[Invoice Sync] Starting scheduler...");
  invoiceSyncScheduler.start();
}

// Stop the scheduler
export function stopInvoiceSync() {
  console.log("[Invoice Sync] Stopping scheduler...");
  invoiceSyncScheduler.stop();
}

// Manually trigger sync
export async function triggerManualSync() {
  await syncInvoiceStatuses();
}
