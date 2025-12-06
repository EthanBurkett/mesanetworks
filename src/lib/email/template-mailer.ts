import { readFile } from "fs/promises";
import { join } from "path";
import { sendEmail, type EmailOptions } from "./email-service";

export interface TemplateVariables {
  [key: string]: string | number;
}

/**
 * Load an email template from the public directory
 */
async function loadTemplate(templateName: string): Promise<string> {
  const templatePath = join(
    process.cwd(),
    "public",
    "email-templates",
    `${templateName}.html`
  );
  return await readFile(templatePath, "utf-8");
}

/**
 * Replace template variables in HTML content
 */
function renderTemplate(html: string, variables: TemplateVariables): string {
  let rendered = html;

  for (const [key, value] of Object.entries(variables)) {
    // Support both {{key}} and {{ key }} formats
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
    rendered = rendered.replace(regex, String(value));
  }

  return rendered;
}

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(
  to: string,
  name: string,
  loginUrl: string
) {
  const html = await loadTemplate("welcome");
  const rendered = renderTemplate(html, { name, loginUrl });

  return sendEmail({
    to,
    subject: "Welcome to Mesa Networks! 🎉",
    html: rendered,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const html = await loadTemplate("password-reset");
  const rendered = renderTemplate(html, { resetUrl });

  return sendEmail({
    to,
    subject: "Reset Your Password - Mesa Networks",
    html: rendered,
  });
}

/**
 * Send password changed confirmation email
 */
export async function sendPasswordChangedEmail(to: string, timestamp: string) {
  const html = await loadTemplate("password-changed");
  const rendered = renderTemplate(html, { timestamp });

  return sendEmail({
    to,
    subject: "Password Changed - Mesa Networks",
    html: rendered,
  });
}

/**
 * Send email verification email
 */
export async function sendEmailVerificationEmail(
  to: string,
  name: string,
  verifyUrl: string
) {
  const html = await loadTemplate("verify-email");
  const rendered = renderTemplate(html, { name, verifyUrl });

  return sendEmail({
    to,
    subject: "Verify Your Email - Mesa Networks",
    html: rendered,
  });
}

/**
 * Send 2FA enabled confirmation email
 */
export async function send2FAEnabledEmail(to: string, supportUrl: string) {
  const html = await loadTemplate("2fa-enabled");
  const rendered = renderTemplate(html, { supportUrl });

  return sendEmail({
    to,
    subject: "Two-Factor Authentication Enabled - Mesa Networks",
    html: rendered,
  });
}

/**
 * Send backup codes generated email
 */
export async function sendBackupCodesGeneratedEmail(
  to: string,
  viewCodesUrl: string
) {
  const html = await loadTemplate("backup-codes-generated");
  const rendered = renderTemplate(html, { viewCodesUrl });

  return sendEmail({
    to,
    subject: "New Backup Codes Generated - Mesa Networks",
    html: rendered,
  });
}

/**
 * Send security alert email for new device login
 */
export async function sendSecurityAlertEmail(
  to: string,
  options: {
    timestamp: string;
    location: string;
    device: string;
    ipAddress: string;
    securityUrl: string;
  }
) {
  const html = await loadTemplate("security-alert");
  const rendered = renderTemplate(html, options);

  return sendEmail({
    to,
    subject: "Security Alert: New Sign-In Detected - Mesa Networks",
    html: rendered,
  });
}

/**
 * Send session expired notification
 */
export async function sendSessionExpiredEmail(to: string, loginUrl: string) {
  const html = await loadTemplate("session-expired");
  const rendered = renderTemplate(html, { loginUrl });

  return sendEmail({
    to,
    subject: "Your Session Has Expired - Mesa Networks",
    html: rendered,
  });
}

/**
 * Send account suspended notification
 */
export async function sendAccountSuspendedEmail(
  to: string,
  options: {
    reason: string;
    timestamp: string;
    accountId: string;
    supportUrl: string;
  }
) {
  const html = await loadTemplate("account-suspended");
  const rendered = renderTemplate(html, options);

  return sendEmail({
    to,
    subject: "Account Suspended - Mesa Networks",
    html: rendered,
  });
}

/**
 * Send account activated notification
 */
export async function sendAccountActivatedEmail(
  to: string,
  options: {
    activatedBy: string;
    timestamp: string;
    loginUrl: string;
  }
) {
  const html = await loadTemplate("account-activated");
  const rendered = renderTemplate(html, options);

  return sendEmail({
    to,
    subject: "Account Activated - Mesa Networks",
    html: rendered,
  });
}

/**
 * Send role changed notification
 */
export async function sendRoleChangedEmail(
  to: string,
  options: {
    newRole: string;
    updatedBy: string;
    timestamp: string;
  }
) {
  const html = await loadTemplate("role-changed");
  const rendered = renderTemplate(html, options);

  return sendEmail({
    to,
    subject: "Your Role Has Been Updated - Mesa Networks",
    html: rendered,
  });
}

/**
 * Generic template sender - use for custom templates
 */
export async function sendTemplateEmail(
  to: string,
  templateName: string,
  subject: string,
  variables: TemplateVariables
) {
  const html = await loadTemplate(templateName);
  const rendered = renderTemplate(html, variables);

  return sendEmail({
    to,
    subject,
    html: rendered,
  });
}

/**
 * Extract all variable names from a template string
 * Variables use {{variableName}} syntax
 */
export function extractVariables(content: string): string[] {
  const regex = /{{(\w+)}}/g;
  const variables = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    variables.add(match[1]);
  }

  return Array.from(variables);
}

/**
 * Validate template syntax and extract variables
 */
export function validateTemplate(
  subject: string,
  htmlContent: string,
  textContent: string
): {
  isValid: boolean;
  variables: string[];
  errors: string[];
} {
  const errors: string[] = [];

  // Extract variables from all content
  const subjectVars = extractVariables(subject);
  const htmlVars = extractVariables(htmlContent);
  const textVars = extractVariables(textContent);

  // Combine all unique variables
  const allVariables = Array.from(
    new Set([...subjectVars, ...htmlVars, ...textVars])
  );

  // Check if text content has variables that HTML doesn't (inconsistency warning)
  const textOnlyVars = textVars.filter((v) => !htmlVars.includes(v));
  if (textOnlyVars.length > 0) {
    errors.push(
      `Variables in text but not in HTML: ${textOnlyVars.join(", ")}`
    );
  }

  // Check if HTML has variables that text doesn't
  const htmlOnlyVars = htmlVars.filter((v) => !textVars.includes(v));
  if (htmlOnlyVars.length > 0) {
    errors.push(
      `Variables in HTML but not in text: ${htmlOnlyVars.join(", ")}`
    );
  }

  return {
    isValid: errors.length === 0,
    variables: allVariables,
    errors,
  };
}
