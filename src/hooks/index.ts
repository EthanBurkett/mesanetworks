// Auth hooks
export {
  useUser,
  useLogin,
  useVerify2FA,
  useRegister,
  useLogout,
  useSendVerificationCode,
  useVerifyEmail,
  useSendPasswordResetCode,
  useResetPassword,
} from "./use-auth";

// Session hooks
export { useSessions, useRevokeSession } from "./use-sessions";

// Role hooks
export {
  useRoles,
  useCreateRole,
  useUpdateRole,
  useUpdateRoleHierarchy,
} from "./use-roles";

// Permission hooks
export {
  useHasPermission,
  useHasAnyPermission,
  useHasAllPermissions,
  useHasRoleId,
  useHasAnyRoleId,
  useHasAllRoleIds,
  useHasRoleHierarchy,
  useIsAdmin,
  useIsSuperAdmin,
  usePermissions,
  useRoleIds,
  usePermissionChecker,
  usePermissionGuard,
  useAnyPermissionGuard,
  useAllPermissionsGuard,
  useCanManageUser,
} from "./use-permissions";

// Auth context hook (re-exported for convenience)
export { useAuth } from "@/contexts";

// Two-Factor Authentication hooks
export {
  useTwoFactorStatus,
  useSetupTwoFactor,
  useVerifyTwoFactor,
  useDisableTwoFactor,
  useRegenerateBackupCodes,
  useValidateTwoFactor,
  type TwoFactorStatus,
  type SetupResponse,
  type VerifyResponse,
} from "./use-two-factor";
