# SMTP Email Service

This module provides SMTP email functionality for Mesa Networks using Nodemailer.

## Configuration

Add the following environment variables to your `.env.local` file:

```env
# SMTP Configuration
SMTP_HOST=smtp.example.com          # Your SMTP server hostname
SMTP_PORT=587                        # SMTP port (587 for TLS, 465 for SSL)
SMTP_SECURE=false                    # true for port 465, false for other ports
SMTP_USER=your-email@example.com    # SMTP username
SMTP_PASSWORD=your-password          # SMTP password
SMTP_FROM_NAME=Mesa Networks         # Display name for outgoing emails
SMTP_FROM_EMAIL=noreply@example.com # Email address for outgoing emails
```

### Common SMTP Providers

#### Gmail

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password  # Use App Password, not regular password
SMTP_FROM_EMAIL=your-email@gmail.com
```

#### SendGrid

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
SMTP_FROM_EMAIL=noreply@yourdomain.com
```

#### AWS SES

```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-ses-smtp-username
SMTP_PASSWORD=your-ses-smtp-password
SMTP_FROM_EMAIL=verified@yourdomain.com
```

#### Mailgun

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASSWORD=your-mailgun-password
SMTP_FROM_EMAIL=noreply@yourdomain.com
```

## Usage

### Basic Email Sending

```typescript
import { sendEmail } from "@/lib/email";

// Send a simple email
const result = await sendEmail({
  to: "user@example.com",
  subject: "Test Email",
  text: "This is a plain text email",
  html: "<p>This is an <strong>HTML</strong> email</p>",
});

if (result.success) {
  console.log("Email sent:", result.messageId);
} else {
  console.error("Failed to send email:", result.error);
}
```

### Send to Multiple Recipients

```typescript
import { sendEmail } from "@/lib/email";

await sendEmail({
  to: ["user1@example.com", "user2@example.com"],
  cc: "manager@example.com",
  bcc: "admin@example.com",
  subject: "Team Announcement",
  html: "<p>Important team update!</p>",
});
```

### Pre-built Email Templates

#### Welcome Email

```typescript
import { sendWelcomeEmail } from "@/lib/email";

await sendWelcomeEmail("newuser@example.com", "John Doe");
```

#### Password Reset Email

```typescript
import { sendPasswordResetEmail } from "@/lib/email";

await sendPasswordResetEmail("user@example.com", "reset-token-123", "John Doe");
```

#### Admin Notification

```typescript
import { sendAdminNotification } from "@/lib/email";

await sendAdminNotification(
  "New User Registration",
  "A new user has registered: john@example.com",
  "admin@mesanet.works"
);
```

### Email with Attachments

```typescript
import { sendEmail } from "@/lib/email";

await sendEmail({
  to: "user@example.com",
  subject: "Invoice",
  html: "<p>Please find your invoice attached.</p>",
  attachments: [
    {
      filename: "invoice.pdf",
      path: "/path/to/invoice.pdf",
    },
    {
      filename: "logo.png",
      content: Buffer.from("base64content", "base64"),
      contentType: "image/png",
    },
  ],
});
```

## API Routes

### Send Email

**POST** `/api/v1/email/send`

Send an email via the API:

```bash
curl -X POST http://localhost:3000/api/v1/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@example.com",
    "subject": "Test Email",
    "html": "<p>Hello World!</p>"
  }'
```

Request body schema:

```typescript
{
  to: string | string[];        // Recipient(s)
  subject: string;               // Email subject
  text?: string;                 // Plain text content
  html?: string;                 // HTML content
  cc?: string | string[];        // CC recipients
  bcc?: string | string[];       // BCC recipients
  replyTo?: string;              // Reply-to address
}
```

### Verify SMTP Connection

**GET** `/api/v1/email/send`

Verify that the SMTP connection is working:

```bash
curl http://localhost:3000/api/v1/email/send
```

## Utility Functions

### Verify Connection

```typescript
import { verifySmtpConnection } from "@/lib/email";

const isConnected = await verifySmtpConnection();
console.log("SMTP connected:", isConnected);
```

### Close Connection

```typescript
import { closeSmtpConnection } from "@/lib/email";

// Close the SMTP connection when done
closeSmtpConnection();
```

## Error Handling

All email functions return an `EmailResult` object:

```typescript
interface EmailResult {
  success: boolean;
  messageId?: string; // Present if success is true
  error?: string; // Present if success is false
}
```

Example error handling:

```typescript
const result = await sendEmail({
  to: "user@example.com",
  subject: "Test",
  html: "<p>Test</p>",
});

if (!result.success) {
  console.error("Email failed:", result.error);
  // Handle error (log, retry, notify admin, etc.)
}
```

## Best Practices

1. **Use HTML and Text**: Always provide both HTML and plain text versions for better compatibility
2. **Validate Emails**: Use Zod schemas to validate email addresses before sending
3. **Rate Limiting**: Implement rate limiting for email APIs to prevent abuse
4. **Error Logging**: Log email failures for monitoring and debugging
5. **Template Management**: Consider using a template engine for complex emails
6. **Testing**: Use a service like Mailtrap for testing in development

## Development Testing

For development, you can use [Mailtrap](https://mailtrap.io/) or [Ethereal Email](https://ethereal.email/):

```env
# Ethereal Email (auto-generated test account)
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-ethereal-username
SMTP_PASSWORD=your-ethereal-password
SMTP_FROM_EMAIL=test@ethereal.email
```

## Security Considerations

- Never commit SMTP credentials to version control
- Use environment variables for all sensitive data
- Consider using App Passwords for Gmail/Google Workspace
- Implement rate limiting on email endpoints
- Validate and sanitize all user input before sending emails
- Use authenticated SMTP servers to prevent spam classification

## Troubleshooting

### "A required privilege is not held by the client"

This is unrelated to email - it's a Windows symlink issue with pnpm. Enable Developer Mode in Windows Settings.

### Connection Timeout

- Check firewall settings
- Verify SMTP host and port are correct
- Ensure your IP is not blocked by the SMTP provider

### Authentication Failed

- Verify username and password are correct
- For Gmail, use App Password instead of regular password
- Check if 2FA is enabled and generating the correct credentials

### Emails Going to Spam

- Set up SPF, DKIM, and DMARC records for your domain
- Use a reputable SMTP provider
- Avoid spam trigger words in subject lines
- Include an unsubscribe link for marketing emails
