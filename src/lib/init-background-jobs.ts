// This file initializes background jobs when the server starts
import { startInvoiceSync } from "./invoice-sync-scheduler";

// Only run on server-side
if (typeof window === "undefined") {
  // Start invoice sync scheduler
  startInvoiceSync();
  console.log("[Background Jobs] Invoice sync scheduler started");
}

export {};
