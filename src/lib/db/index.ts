import "@/config/env";
import { connectDB } from "./odm";
import { initializeSystemRoles } from "./init-roles";

// Import all models to ensure they're registered with Mongoose
// This must happen before any populate() calls are made
import "./models/User.model";
import "./models/Role.model";
import "./models/Session.model";
import "./models/AuditLog.model";
import "./models/Settings.model";
import "./models/EmailTemplate.model";
import "./models/Location.model";
import "./models/Shift.model";
import "./models/Punch.model";

// Global connection promise to avoid multiple connection attempts
let connectionPromise: Promise<void> | null = null;
let rolesInitialized = false;

/**
 * Ensures database connection is established
 * Uses singleton pattern to avoid multiple connection attempts
 */
export async function ensureDBConnection(): Promise<void> {
  // If already connected, return immediately
  if (connectionPromise) {
    return connectionPromise;
  }

  // Create connection promise
  connectionPromise = connectDB()
    .then(async () => {
      console.log("✅ Database connected successfully");

      // Initialize system roles on first connection
      if (!rolesInitialized) {
        try {
          await initializeSystemRoles();
          rolesInitialized = true;
        } catch (error) {
          console.error("⚠️  Failed to initialize system roles:", error);
        }
      }
    })
    .catch((error) => {
      console.error("❌ Database connection failed:", error);
      connectionPromise = null; // Reset on failure
      throw error;
    });

  return connectionPromise;
}

/**
 * Safely executes a database operation with automatic connection handling
 */
export async function withDBConnection<T>(
  operation: () => Promise<T>
): Promise<T> {
  try {
    await ensureDBConnection();
    return await operation();
  } catch (error) {
    console.error("❌ Database operation failed:", error);
    throw error;
  }
}

/**
 * Health check function for database connectivity
 */
export async function checkDBHealth(): Promise<boolean> {
  try {
    await ensureDBConnection();
    // Add a simple query to verify connection
    const mongoose = (await import("mongoose")).default;

    // Check if connection is ready and database exists
    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      await mongoose.connection.db.admin().ping();
      return true;
    }

    return false;
  } catch (error) {
    console.error("❌ Database health check failed:", error);
    return false;
  }
}

// Export role initialization utilities
export {
  initializeSystemRoles,
  getDefaultUserRoleId,
  ensureUserHasDefaultRole,
} from "./init-roles";
