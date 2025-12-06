# Email Template Integration

## Overview

All email templates have been integrated into their respective API routes and actions. Emails are sent asynchronously (non-blocking) to avoid delaying API responses.

## Implemented Email Triggers

### 1. Welcome Email

**Template:** `welcome.html`
**Trigger:** User registration
**Location:** `src/app/api/v1/auth/register/route.ts`
**Variables:**

- `{{name}}` - User's full name
- `{{loginUrl}}` - Login page URL

### 2. Password Reset

**Template:** `password-reset.html`
**Trigger:** Auth0 passwordless flow (handled by Auth0)
**Note:** Auth0 sends this automatically using the template uploaded to their dashboard

### 3. Password Changed

**Template:** `password-changed.html`
**Trigger:** Successful password reset
**Location:** `src/app/api/v1/auth/forgot-password/reset-password/route.ts`
**Variables:**

- `{{timestamp}}` - When the password was changed

### 4. Email Verification

**Template:** `verify-email.html`
**Trigger:** Auth0 email verification flow (handled by Auth0)
**Note:** Auth0 sends this automatically
**Variables:**

- `{{name}}` - User's name
- `{{verifyUrl}}` - Verification link

### 5. 2FA Enabled

**Template:** `2fa-enabled.html`
**Trigger:** User successfully enables 2FA
**Location:** `src/app/api/v1/auth/2fa/verify/route.ts`
**Variables:**

- `{{supportUrl}}` - Support page URL

### 6. Backup Codes Generated

**Template:** `backup-codes-generated.html`
**Trigger:** User regenerates backup codes
**Location:** `src/app/api/v1/auth/2fa/backup-codes/route.ts`
**Variables:**

- `{{viewCodesUrl}}` - Link to view backup codes page

### 7. Security Alert

**Template:** `security-alert.html`
**Trigger:** Login from new device detected
**Location:** `src/app/api/v1/auth/login/route.ts`
**Variables:**

- `{{timestamp}}` - Login time
- `{{location}}` - City, Country or IP address
- `{{device}}` - Browser and OS information
- `{{ipAddress}}` - IP address
- `{{securityUrl}}` - Security settings page URL

### 8. Session Expired

**Template:** `session-expired.html`
**Trigger:** Manual notification (not auto-implemented)
**Use Case:** Can be sent when cleaning up expired sessions
**Variables:**

- `{{loginUrl}}` - Login page URL

### 9. Account Suspended

**Template:** `account-suspended.html`
**Trigger:** Manual admin action (not auto-implemented)
**Use Case:** Admin suspends user account
**Variables:**

- `{{reason}}` - Suspension reason
- `{{timestamp}}` - Suspension date/time
- `{{accountId}}` - User account ID
- `{{supportUrl}}` - Support page URL

### 10. Role Changed

**Template:** `role-changed.html`
**Trigger:** Manual admin action (not auto-implemented)
**Use Case:** Admin changes user's role
**Variables:**

- `{{newRole}}` - New role name
- `{{updatedBy}}` - Admin who made the change
- `{{timestamp}}` - Change date/time

### 11. Auth0 OTP

**Template:** `auth0-otp.html`
**Trigger:** Auth0 passwordless authentication
**Note:** Upload this template to Auth0 dashboard for OTP emails
**Variables:**

- `{{ application.name }}` - Application name
- `{{ code }}` - Verification code
- `{{ link }}` - Magic link URL

## Email Service Functions

All email functions are available in `src/lib/email/template-mailer.ts`:

```typescript
// Implemented functions
sendWelcomeTemplateEmail(to, name, loginUrl);
sendPasswordChangedEmail(to, timestamp);
send2FAEnabledEmail(to, supportUrl);
sendBackupCodesGeneratedEmail(to, viewCodesUrl);
sendSecurityAlertEmail(to, {
  timestamp,
  location,
  device,
  ipAddress,
  securityUrl,
});

// Available for future use
sendEmailVerificationEmail(to, name, verifyUrl);
sendSessionExpiredEmail(to, loginUrl);
sendAccountSuspendedEmail(to, { reason, timestamp, accountId, supportUrl });
sendRoleChangedEmail(to, { newRole, updatedBy, timestamp });
sendTemplateEmail(to, templateName, subject, variables); // Generic sender
```

## Configuration

Emails use SMTP settings from:

1. Database settings (Admin Settings > Email > SMTP Configuration)
2. Fallback to environment variables if DB query fails

Required environment variables:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASSWORD`
- `SMTP_FROM_EMAIL`
- `SMTP_FROM_NAME`
- `NEXT_PUBLIC_APP_URL` (for generating links)

## Error Handling

All email sends are non-blocking and use `.catch()` to log errors without disrupting the main flow:

```typescript
sendWelcomeTemplateEmail(email, name, url).catch((err) =>
  console.error("Failed to send welcome email:", err)
);
```

This ensures that email failures don't break critical operations like user registration or login.

## Testing

Test emails via:

1. **Admin Settings** > Email > SMTP Configuration > "Send Test Email"
2. **API Routes** - Each integration point automatically sends emails on the respective actions
3. **Template Editor** - Admin Settings > Email > Email Templates (preview only, doesn't send)

## Future Enhancements

To implement the remaining templates:

1. **Role Changed** - Add to admin user update route when implemented
2. **Account Suspended** - Add to admin user suspension route when implemented
3. **Session Expired** - Add to session cleanup job/cron when implemented
