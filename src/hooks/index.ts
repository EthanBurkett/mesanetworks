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

// User management hooks
export { useUsers, useUpdateUserRoles, useSuspendUser } from "./use-users";

// Location hooks
export {
  useLocations,
  useActiveLocations,
  useLocation,
  useCreateLocation,
  useUpdateLocation,
  useDeleteLocation,
} from "./use-locations";

// Audit logs hooks
export { useAuditLogs } from "./use-audit-logs";

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

// Timesheet hooks
export {
  useSchedules,
  useSchedule,
  useCreateSchedule,
  useUpdateSchedule,
  useDeleteSchedule,
  useShifts,
  useShift,
  useUpdateShift,
  useDeleteShift,
  usePunches,
  usePunch,
  useCreatePunch,
  useUpdatePunchNotes,
  useDeletePunch,
  useMyShifts,
  useMyPunches,
  useShiftPunches,
} from "./use-timesheets";

// Network design hooks
export {
  useNetworks,
  useNetwork,
  useCreateNetwork,
  useUpdateNetwork,
  useDeleteNetwork,
  useShareNetwork,
} from "./use-networks";
