"use server";

import { revalidatePath } from "next/cache";
import {
  SettingsQueries,
  SettingsMutations,
} from "@/lib/db/models/Settings.model";
import { verifySmtpConnection } from "@/lib/email";
import { ensureDBConnection } from "@/lib/db";

export interface EmailSettingsFormData {
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPassword?: string;
  fromEmail: string;
  fromName: string;
}

export async function getEmailSettings() {
  try {
    await ensureDBConnection();
    const settings = await SettingsQueries.getSettings();

    return {
      success: true,
      data: {
        smtpHost: settings.email.smtpHost || "",
        smtpPort: settings.email.smtpPort,
        smtpSecure: settings.email.smtpSecure,
        smtpUser: settings.email.smtpUser || "",
        fromEmail: settings.email.fromEmail || "",
        fromName: settings.email.fromName,
        // Don't return password for security
      },
    };
  } catch (error) {
    console.error("Failed to get email settings:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get settings",
    };
  }
}

export async function updateEmailSettings(data: EmailSettingsFormData) {
  try {
    await ensureDBConnection();

    // Only update password if provided
    const updates: any = {
      smtpHost: data.smtpHost,
      smtpPort: data.smtpPort,
      smtpSecure: data.smtpSecure,
      smtpUser: data.smtpUser,
      fromEmail: data.fromEmail,
      fromName: data.fromName,
    };

    if (data.smtpPassword) {
      updates.smtpPassword = data.smtpPassword;
    }

    await SettingsMutations.updateEmailSettings(updates);

    revalidatePath("/admin/settings");

    return {
      success: true,
      message: "Email settings updated successfully",
    };
  } catch (error) {
    console.error("Failed to update email settings:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update settings",
    };
  }
}

export async function testEmailConnection() {
  try {
    await ensureDBConnection();
    const isConnected = await verifySmtpConnection();

    return {
      success: isConnected,
      message: isConnected
        ? "SMTP connection successful"
        : "SMTP connection failed. Please check your settings.",
    };
  } catch (error) {
    console.error("Failed to test email connection:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Connection test failed",
    };
  }
}

export async function sendTestEmail(to: string) {
  try {
    await ensureDBConnection();

    const { sendEmail } = await import("@/lib/email");

    const result = await sendEmail({
      to,
      subject: "Test Email from Mesa Networks",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Email Configuration Test</h2>
          <p>This is a test email sent from your Mesa Networks application.</p>
          <p>If you received this email, your SMTP configuration is working correctly!</p>
          <hr style="border: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="color: #6b7280; font-size: 14px;">
            Sent at: ${new Date().toLocaleString()}
          </p>
        </div>
      `,
      text: `
Email Configuration Test

This is a test email sent from your Mesa Networks application.

If you received this email, your SMTP configuration is working correctly!

Sent at: ${new Date().toLocaleString()}
      `,
    });

    if (!result.success) {
      return {
        success: false,
        error: result.error || "Failed to send test email",
      };
    }

    return {
      success: true,
      message: `Test email sent successfully to ${to}`,
      messageId: result.messageId,
    };
  } catch (error) {
    console.error("Failed to send test email:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to send test email",
    };
  }
}
