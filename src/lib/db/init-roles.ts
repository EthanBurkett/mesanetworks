import { RoleModel, RoleMutations } from "./models/Role.model";
import { Permission, Role, RolePermissions } from "../rbac/permissions";

/**
 * Initialize default system roles in the database
 * This should be run on application startup
 * Note: This assumes DB connection is already established
 */
export async function initializeSystemRoles() {
  // Create SUPER_ADMIN role with all permissions
  const superAdminRole = await RoleModel.findOne({
    name: Role.SUPER_ADMIN,
  }).exec();

  if (!superAdminRole) {
    console.log("Creating SUPER_ADMIN role...");
    await RoleMutations.createRole({
      name: Role.SUPER_ADMIN,
      description: "Super Administrator with all permissions",
      permissions: Object.values(Permission),
      isSystem: true,
    });
    console.log("✓ SUPER_ADMIN role created");
  } else {
    // Update permissions to ensure it has all permissions
    superAdminRole.permissions = Object.values(Permission);
    await superAdminRole.save();
    console.log("✓ SUPER_ADMIN role updated with all permissions");
  }

  // Create default USER role
  const userRole = await RoleModel.findOne({ name: Role.USER }).exec();

  if (!userRole) {
    console.log("Creating USER role...");
    await RoleMutations.createRole({
      name: Role.USER,
      description: "Default user role",
      permissions: RolePermissions[Role.USER],
      isSystem: true,
    });
    console.log("✓ USER role created");
  }

  // Create ADMIN role
  const adminRole = await RoleModel.findOne({ name: Role.ADMIN }).exec();

  if (!adminRole) {
    console.log("Creating ADMIN role...");
    await RoleMutations.createRole({
      name: Role.ADMIN,
      description: "Administrator role",
      permissions: RolePermissions[Role.ADMIN],
      isSystem: true,
    });
    console.log("✓ ADMIN role created");
  }

  console.log("System roles initialization complete");
}

/**
 * Get the default USER role ID
 */
export async function getDefaultUserRoleId(): Promise<string> {
  const userRole = await RoleModel.findOne({ name: Role.USER }).exec();
  if (!userRole) {
    throw new Error(
      "Default USER role not found. Run initializeSystemRoles first."
    );
  }
  return userRole._id;
}

/**
 * Assign default USER role to a user if they have no roles
 */
export async function ensureUserHasDefaultRole(userId: string) {
  const { UserModel } = await import("./models/User.model");
  const user = await UserModel.findById(userId).exec();

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.roles || user.roles.length === 0) {
    const defaultRoleId = await getDefaultUserRoleId();
    user.roles = [defaultRoleId];
    await user.save();
  }
}
