# Two-Factor Authentication (2FA) Implementation

## Overview

This implementation adds TOTP-based two-factor authentication to the login flow, providing an additional security layer for user accounts.

## Login Flow

### Without 2FA

1. User enters email and password
2. Auth0 validates credentials
3. Session is created immediately
4. User is redirected to dashboard

### With 2FA Enabled

1. User enters email and password
2. Auth0 validates credentials
3. System checks if user has 2FA enabled
4. If enabled:
   - Temporary pending session token is created (10-minute expiry)
   - User is shown 2FA verification screen
   - User enters TOTP code from authenticator app OR backup code
   - Code is verified
   - Actual session is created
   - Pending session is cleared
   - User is redirected to dashboard

## API Endpoints

### POST `/api/v1/auth/login`

**Initial login endpoint**

Response when 2FA is required:

```json
{
  "success": true,
  "data": {
    "requires2FA": true,
    "message": "Two-factor authentication required"
  }
}
```

Response when 2FA is not required:

```json
{
  "success": true,
  "data": {
    "message": "Login successful",
    "user": {
      "id": "...",
      "email": "...",
      "firstName": "...",
      "lastName": "..."
    }
  }
}
```

### POST `/api/v1/auth/login/verify-2fa`

**2FA verification endpoint**

Request body:

```json
{
  "token": "123456" // OR
  // "backupCode": "ABCD1234"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "message": "Two-factor authentication successful",
    "user": {
      "id": "...",
      "email": "...",
      "firstName": "...",
      "lastName": "..."
    }
  }
}
```

## Components

### `TwoFactorVerify`

Location: `src/components/auth/two-factor-verify.tsx`

A full-page component that handles 2FA verification during login:

- TOTP code input (6 digits)
- Backup code input (alternative)
- Switch between TOTP and backup codes
- Back to login button
- Error display

Props:

- `onVerify: (code: string) => void` - Called when user submits TOTP
- `onUseBackupCode: (code: string) => void` - Called when user submits backup code
- `onBack: () => void` - Called when user wants to go back to login
- `isVerifying: boolean` - Loading state
- `error?: string` - Error message to display

## Hooks

### `useVerify2FA()`

Location: `src/hooks/use-auth.ts`

Hook for verifying 2FA during login.

```typescript
const verify2FAMutation = useVerify2FA();

verify2FAMutation.mutate(
  { token: "123456" }, // or { backupCode: "ABCD1234" }
  {
    onSuccess: () => {
      // User is logged in, router.push("/") is called automatically
    },
    onError: (error) => {
      // Handle error
    },
  }
);
```

## Security Features

### Pending Session Token

- Short-lived JWT (10 minutes)
- Contains `pending2FA: true` flag
- Cannot be used for actual authentication
- Stored in httpOnly cookie
- Automatically cleared after successful 2FA or expiry

### Rate Limiting

⚠️ **TODO**: Add rate limiting to `/api/v1/auth/login/verify-2fa` to prevent brute force attacks

- Recommended: 5 attempts per 15 minutes per IP
- Lock account after 10 failed attempts

### Audit Logging

- Failed 2FA attempts are logged
- Successful 2FA logins are logged
- All logs include IP address and device information

## Usage Example

```tsx
import { useState } from "react";
import { useLogin, useVerify2FA } from "@/hooks";
import { TwoFactorVerify } from "@/components/auth/two-factor-verify";

export default function LoginPage() {
  const [requires2FA, setRequires2FA] = useState(false);
  const [verifyError, setVerifyError] = useState<string>();

  const loginMutation = useLogin();
  const verify2FAMutation = useVerify2FA();

  const handleLogin = (data: LoginSchema) => {
    loginMutation.mutate(data, {
      onSuccess: (response) => {
        if (response.requires2FA) {
          setRequires2FA(true);
        }
      },
    });
  };

  const handleVerify = (code: string) => {
    verify2FAMutation.mutate(
      { token: code },
      {
        onError: (error) => setVerifyError(error.message),
      }
    );
  };

  if (requires2FA) {
    return (
      <TwoFactorVerify
        onVerify={handleVerify}
        onUseBackupCode={(code) =>
          verify2FAMutation.mutate({ backupCode: code })
        }
        onBack={() => setRequires2FA(false)}
        isVerifying={verify2FAMutation.isPending}
        error={verifyError}
      />
    );
  }

  // ... normal login form
}
```

## Future Enhancements

1. **Rate Limiting**: Implement rate limiting on 2FA verification endpoint
2. **Remember Device**: Option to skip 2FA for trusted devices (30 days)
3. **Email Fallback**: Send OTP via email as fallback option
4. **SMS Support**: Add SMS-based 2FA as alternative
5. **Recovery Flow**: Special flow for users who lost their authenticator device
6. **Admin Override**: Allow admins to disable 2FA for locked-out users
