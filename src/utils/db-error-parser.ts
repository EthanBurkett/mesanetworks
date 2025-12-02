import { Errors } from "@/lib/api-utils";

/**
 * Parses MongoDB errors and converts them to user-friendly error messages
 */
export function parseDbError(error: any): never {
  // MongoDB duplicate key error (E11000)
  if (error.code === 11000 || error.message?.includes("E11000")) {
    const field = extractDuplicateField(error);

    if (field === "email") {
      throw new Errors.Conflict("An account with this email already exists");
    }
    if (field === "username") {
      throw new Errors.Conflict("This username is already taken");
    }
    if (field === "auth0Id") {
      throw new Errors.Conflict("This account already exists");
    }

    throw new Errors.Conflict(`A record with this ${field} already exists`);
  }

  // MongoDB validation errors
  if (error.name === "ValidationError") {
    const messages = Object.values(error.errors || {})
      .map((err: any) => err.message)
      .join(", ");
    throw new Errors.BadRequest(messages || "Validation failed");
  }

  // MongoDB cast errors (invalid ObjectId, etc)
  if (error.name === "CastError") {
    throw new Errors.BadRequest(`Invalid ${error.path}: ${error.value}`);
  }

  // Generic database error
  console.error("Database error:", error);
  throw new Errors.InternalServer("A database error occurred");
}

/**
 * Extracts the field name from a MongoDB duplicate key error
 */
function extractDuplicateField(error: any): string {
  // Try to extract from error message
  // Format: "E11000 duplicate key error collection: db.collection index: field_1 dup key: { field: "value" }"
  const match = error.message?.match(/index: (\w+)_\d+/);
  if (match) {
    return match[1];
  }

  // Try to extract from keyPattern
  if (error.keyPattern) {
    return Object.keys(error.keyPattern)[0];
  }

  // Try to extract from keyValue
  if (error.keyValue) {
    return Object.keys(error.keyValue)[0];
  }

  return "field";
}
