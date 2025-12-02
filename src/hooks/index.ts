// Auth hooks
export {
  useUser,
  useLogin,
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
  useIsAdmin,
  useIsSuperAdmin,
  usePermissions,
  useRoleIds,
} from "./use-permissions";

// Auth context hook (re-exported for convenience)
export { useAuth } from "@/contexts";
