import { RoleModel, RoleQueries } from "@/lib/db/models/Role.model";
import { Permission } from "./permissions";

/**
 * Get all permissions for user's role IDs (with inheritance resolved)
 */
export async function getUserPermissions(
  roleIds: string[]
): Promise<Permission[]> {
  const permissions = new Set<Permission>();

  for (const roleId of roleIds) {
    const rolePermissions = await RoleQueries.getPermissionsForRole(roleId);
    rolePermissions.forEach((p) => permissions.add(p));
  }

  return Array.from(permissions);
}

/**
 * Get a role's effective hierarchy level
 * Lower number = lower privilege (for drag-and-drop UI)
 */
export async function getRoleHierarchyLevel(roleId: string): Promise<number> {
  const role = await RoleModel.findById(roleId).exec();
  if (!role) return 0;
  return role.hierarchyLevel;
}

/**
 * Check if roleA has higher or equal privilege than roleB based on hierarchy
 */
export async function roleIsAtLeast(
  roleAId: string,
  roleBId: string
): Promise<boolean> {
  const [levelA, levelB] = await Promise.all([
    getRoleHierarchyLevel(roleAId),
    getRoleHierarchyLevel(roleBId),
  ]);
  return levelA >= levelB;
}

/**
 * Update role hierarchy levels (for drag-and-drop reordering)
 * @param updates Array of { roleId, hierarchyLevel } objects
 */
export async function updateRoleHierarchy(
  updates: { roleId: string; hierarchyLevel: number }[]
): Promise<void> {
  const updatePromises = updates.map(({ roleId, hierarchyLevel }) =>
    RoleModel.findByIdAndUpdate(roleId, { hierarchyLevel }).exec()
  );
  await Promise.all(updatePromises);
}

/**
 * Get all roles sorted by hierarchy (highest privilege first)
 */
export async function getRolesByHierarchy(includeInactive = false): Promise<
  Array<{
    _id: string;
    name: string;
    hierarchyLevel: number;
    permissions: Permission[];
    inherits: boolean;
    inheritsFrom: string[];
  }>
> {
  const query = includeInactive ? {} : { isActive: true };
  const roles = await RoleModel.find(query).sort({ hierarchyLevel: -1 }).exec();

  return roles.map((role) => ({
    _id: role._id,
    name: role.name,
    hierarchyLevel: role.hierarchyLevel,
    permissions: role.permissions,
    inherits: role.inherits,
    inheritsFrom: role.inheritsFrom,
  }));
}

/**
 * Get roles that a specific role inherits from
 */
export async function getInheritedRoles(roleId: string): Promise<string[]> {
  const role = await RoleModel.findById(roleId).exec();
  if (!role || !role.inherits) return [];

  if (role.inheritsFrom && role.inheritsFrom.length > 0) {
    // Inherit from specific roles
    return role.inheritsFrom;
  }

  // Inherit from all roles with lower hierarchyLevel
  const lowerRoles = await RoleModel.find({
    hierarchyLevel: { $lt: role.hierarchyLevel },
    isActive: true,
  }).exec();

  return lowerRoles.map((r) => r._id);
}

/**
 * Validate that inheritance settings don't create circular dependencies
 */
export async function validateInheritance(
  roleId: string,
  inheritsFrom: string[]
): Promise<{ valid: boolean; error?: string }> {
  const visited = new Set<string>();
  const stack = [...inheritsFrom];

  while (stack.length > 0) {
    const currentRoleId = stack.pop()!;

    if (currentRoleId === roleId) {
      return {
        valid: false,
        error: "Circular inheritance detected",
      };
    }

    if (visited.has(currentRoleId)) continue;
    visited.add(currentRoleId);

    const currentRole = await RoleModel.findById(currentRoleId).exec();
    if (currentRole?.inherits && currentRole.inheritsFrom) {
      stack.push(...currentRole.inheritsFrom);
    }
  }

  return { valid: true };
}
