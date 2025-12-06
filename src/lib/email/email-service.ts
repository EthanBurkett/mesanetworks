import type { SendMailOptions } from "nodemailer";
import { getTransporter } from "./smtp-client";
import { env } from "@/config/env";
import { SettingsQueries } from "@/lib/db/models/Settings.model";

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content?: string | Buffer;
    path?: string;
    contentType?: string;
  }>;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send an email using SMTP
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  try {
    const transporter = await getTransporter();

    // Get from email/name from database settings
    let fromEmail = env.SMTP_FROM_EMAIL;
    let fromName = env.SMTP_FROM_NAME;

    try {
      const settings = await SettingsQueries.getSettings();
      if (settings.email.fromEmail) {
        fromEmail = settings.email.fromEmail;
      }
      if (settings.email.fromName) {
        fromName = settings.email.fromName;
      }
    } catch (error) {
      // Fall back to env vars if database query fails
      console.warn(
        "Failed to get email settings from database, using env vars"
      );
    }

    const mailOptions: SendMailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      cc: options.cc,
      bcc: options.bcc,
      replyTo: options.replyTo,
      attachments: options.attachments,
    };

    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("Failed to send email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send a welcome email to a new user
 */
export async function sendWelcomeEmail(
  to: string,
  userName: string
): Promise<EmailResult> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          .button { display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Mesa Networks!</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName},</h2>
            <p>Thank you for joining Mesa Networks. We're excited to have you on board!</p>
            <p>Your account has been successfully created and you can now access all our services.</p>
            <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
            <p style="text-align: center;">
              <a href="${
                env.NODE_ENV === "production"
                  ? "https://mesanet.works"
                  : "http://localhost:3000"
              }" class="button">Get Started</a>
            </p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Mesa Networks. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
Welcome to Mesa Networks!

Hello ${userName},

Thank you for joining Mesa Networks. We're excited to have you on board!

Your account has been successfully created and you can now access all our services.

If you have any questions or need assistance, feel free to reach out to our support team.

© ${new Date().getFullYear()} Mesa Networks. All rights reserved.
  `;

  return sendEmail({
    to,
    subject: "Welcome to Mesa Networks!",
    html,
    text,
  });
}

/**
 * Send a password reset email
 */
export async function sendPasswordResetEmail(
  to: string,
  resetToken: string,
  userName: string
): Promise<EmailResult> {
  const resetUrl = `${
    env.NODE_ENV === "production"
      ? "https://mesanet.works"
      : "http://localhost:3000"
  }/reset-password?token=${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          .button { display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .warning { background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 12px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName},</h2>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #4F46E5;">${resetUrl}</p>
            <div class="warning">
              <strong>⚠️ Security Notice:</strong> This link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact support if you have concerns.
            </div>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Mesa Networks. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
Password Reset Request

Hello ${userName},

We received a request to reset your password. Click the link below to create a new password:

${resetUrl}

⚠️ Security Notice: This link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact support if you have concerns.

© ${new Date().getFullYear()} Mesa Networks. All rights reserved.
  `;

  return sendEmail({
    to,
    subject: "Password Reset Request - Mesa Networks",
    html,
    text,
  });
}

/**
 * Send a notification email to admin
 */
export async function sendAdminNotification(
  subject: string,
  message: string,
  adminEmail: string
): Promise<EmailResult> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #DC2626; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 Admin Notification</h1>
          </div>
          <div class="content">
            <h2>${subject}</h2>
            <p>${message}</p>
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
              <em>Timestamp: ${new Date().toLocaleString()}</em>
            </p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Mesa Networks. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: adminEmail,
    subject: `[Admin] ${subject}`,
    html,
    text: `${subject}\n\n${message}\n\nTimestamp: ${new Date().toLocaleString()}`,
  });
}
