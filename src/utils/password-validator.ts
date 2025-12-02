import crypto from "crypto";
import axios from "axios";

/**
 * Validates password strength requirements:
 * - At least 8 characters
 * - One uppercase letter
 * - One lowercase letter
 * - One number
 * - One special character
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Checks if password appears in the HaveIBeenPwned breached password database
 * using k-anonymity (only sends first 5 chars of SHA-1 hash)
 */
export async function checkBreachedPassword(
  password: string
): Promise<boolean> {
  try {
    // Hash the password using SHA-1
    const hash = crypto
      .createHash("sha1")
      .update(password)
      .digest("hex")
      .toUpperCase();

    // Take first 5 characters (k-anonymity)
    const prefix = hash.substring(0, 5);
    const suffix = hash.substring(5);

    // Query HaveIBeenPwned API
    const response = await axios.get(
      `https://api.pwnedpasswords.com/range/${prefix}`,
      {
        timeout: 3000, // 3 second timeout
        headers: {
          "User-Agent": "Hylandia-API",
        },
      }
    );

    // Check if our hash suffix appears in the response
    const hashes = response.data.split("\r\n");
    for (const line of hashes) {
      const [hashSuffix] = line.split(":");
      if (hashSuffix === suffix) {
        return true; // Password is breached
      }
    }

    return false; // Password is safe
  } catch (error) {
    // If the API is down or times out, allow the password
    // (better to let users in than block legitimate passwords)
    console.warn("Failed to check breached password database:", error);
    return false;
  }
}

/**
 * Validates password meets all requirements:
 * - Strength requirements (uppercase, lowercase, number, special char)
 * - Not in breached password database
 */
export async function validatePassword(password: string): Promise<{
  isValid: boolean;
  errors: string[];
}> {
  const strengthCheck = validatePasswordStrength(password);

  if (!strengthCheck.isValid) {
    return strengthCheck;
  }

  const isBreached = await checkBreachedPassword(password);

  if (isBreached) {
    return {
      isValid: false,
      errors: [
        "This password has been exposed in a data breach and cannot be used. Please choose a different password.",
      ],
    };
  }

  return {
    isValid: true,
    errors: [],
  };
}
