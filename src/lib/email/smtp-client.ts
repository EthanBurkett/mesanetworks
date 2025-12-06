import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { env } from "@/config/env";
import { SettingsQueries } from "@/lib/db/models/Settings.model";

let transporter: Transporter | null = null;

/**
 * Get or create SMTP transporter instance
 * Uses database settings if available, falls back to env vars
 */
export async function getTransporter(): Promise<Transporter> {
  // Always recreate transporter to pick up latest settings
  // This ensures settings changes are reflected immediately
  transporter = null;

  // Try to get settings from database first
  let config: {
    host?: string;
    port: number;
    secure: boolean;
    user?: string;
    pass?: string;
  };

  try {
    const settings = await SettingsQueries.getSettings();
    if (
      settings.email.smtpHost &&
      settings.email.smtpUser &&
      settings.email.smtpPassword
    ) {
      config = {
        host: settings.email.smtpHost,
        port: settings.email.smtpPort,
        secure: settings.email.smtpSecure,
        user: settings.email.smtpUser,
        pass: settings.email.smtpPassword,
      };
    } else {
      // Fall back to env vars
      if (
        !env.SMTP_HOST ||
        !env.SMTP_USER ||
        !env.SMTP_PASSWORD ||
        !env.SMTP_FROM_EMAIL
      ) {
        throw new Error(
          "SMTP configuration is incomplete. Please configure email settings in admin panel or set environment variables."
        );
      }

      config = {
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_SECURE,
        user: env.SMTP_USER,
        pass: env.SMTP_PASSWORD,
      };
    }
  } catch (error) {
    // If database is not available, fall back to env vars
    if (
      !env.SMTP_HOST ||
      !env.SMTP_USER ||
      !env.SMTP_PASSWORD ||
      !env.SMTP_FROM_EMAIL
    ) {
      throw new Error(
        "SMTP configuration is incomplete. Please configure email settings in admin panel or set environment variables."
      );
    }

    config = {
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      user: env.SMTP_USER,
      pass: env.SMTP_PASSWORD,
    };
  }

  transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  return transporter;
}

/**
 * Verify SMTP connection
 */
export async function verifySmtpConnection(): Promise<boolean> {
  try {
    const transporter = await getTransporter();
    await transporter.verify();
    console.log("✅ SMTP connection verified successfully");
    return true;
  } catch (error) {
    console.error("❌ SMTP connection failed:", error);
    return false;
  }
}

/**
 * Close SMTP connection
 */
export function closeSmtpConnection(): void {
  if (transporter) {
    transporter.close();
    transporter = null;
  }
}
