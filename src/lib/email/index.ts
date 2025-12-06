export {
  getTransporter,
  verifySmtpConnection,
  closeSmtpConnection,
} from "./smtp-client";
export {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendAdminNotification,
  type EmailOptions,
  type EmailResult,
} from "./email-service";
export {
  sendWelcomeEmail as sendWelcomeTemplateEmail,
  sendPasswordResetEmail as sendPasswordResetTemplateEmail,
  sendPasswordChangedEmail,
  sendEmailVerificationEmail,
  send2FAEnabledEmail,
  sendBackupCodesGeneratedEmail,
  sendSecurityAlertEmail,
  sendSessionExpiredEmail,
  sendAccountSuspendedEmail,
  sendRoleChangedEmail,
  sendTemplateEmail,
  type TemplateVariables,
  extractVariables,
  validateTemplate,
} from "./template-mailer";
export { getRenderedTemplate } from "./template-renderer";
