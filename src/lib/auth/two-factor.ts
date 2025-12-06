import { authenticator } from "otplib";
import QRCode from "qrcode";
import crypto from "crypto";
import { env } from "@/config/env";

// Convert the encryption key to a 32-byte buffer
// If it's base64, decode it; if it's hex, parse it; otherwise hash it to get 32 bytes
function getEncryptionKey(): Buffer {
  const key = env.TWO_FACTOR_ENCRYPTION_KEY;

  // If it's already 64 hex characters (32 bytes), use it directly
  if (/^[0-9a-fA-F]{64}$/.test(key)) {
    return Buffer.from(key, "hex");
  }

  // If it's base64, decode it
  try {
    const decoded = Buffer.from(key, "base64");
    if (decoded.length === 32) {
      return decoded;
    }
  } catch (e) {
    // Not valid base64, continue
  }

  // Otherwise, hash it to get exactly 32 bytes
  return crypto.createHash("sha256").update(key).digest();
}

const ENCRYPTION_KEY = getEncryptionKey();
const ALGORITHM = "aes-256-gcm";

/**
 * Generate a new TOTP secret for a user
 */
export function generateTOTPSecret(): string {
  return authenticator.generateSecret();
}

/**
 * Generate QR code data URL for TOTP setup
 */
export async function generateQRCode(
  email: string,
  secret: string,
  issuer = "Mesa Networks"
): Promise<string> {
  const otpauth = authenticator.keyuri(email, issuer, secret);
  return await QRCode.toDataURL(otpauth);
}

/**
 * Verify a TOTP token
 */
export function verifyTOTPToken(token: string, secret: string): boolean {
  try {
    return authenticator.verify({ token, secret });
  } catch (error) {
    return false;
  }
}

/**
 * Generate backup codes (one-time use recovery codes)
 */
export function generateBackupCodes(count = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric codes
    const code = crypto.randomBytes(4).toString("hex").toUpperCase();
    codes.push(code);
  }
  return codes;
}

/**
 * Hash a backup code for storage
 */
export function hashBackupCode(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}

/**
 * Verify a backup code against a hashed code
 */
export function verifyBackupCode(code: string, hashedCode: string): boolean {
  const inputHash = hashBackupCode(code);
  return crypto.timingSafeEqual(
    Buffer.from(inputHash),
    Buffer.from(hashedCode)
  );
}

/**
 * Encrypt TOTP secret for database storage
 */
export function encryptSecret(secret: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);

  let encrypted = cipher.update(secret, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  // Return format: iv:authTag:encrypted
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

/**
 * Decrypt TOTP secret from database
 */
export function decryptSecret(encryptedData: string): string {
  const parts = encryptedData.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted data format");
  }

  const [ivHex, authTagHex, encrypted] = parts;
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * Generate a time-limited email OTP (6 digits, valid for 10 minutes)
 */
export function generateEmailOTP(): {
  code: string;
  expiresAt: Date;
} {
  const code = crypto.randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  return { code, expiresAt };
}

/**
 * Verify email OTP
 */
export function verifyEmailOTP(
  inputCode: string,
  storedCode: string,
  expiresAt: Date
): boolean {
  if (new Date() > expiresAt) {
    return false; // Expired
  }

  return inputCode === storedCode;
}
