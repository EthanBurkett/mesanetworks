import { field, getModel, model, index, unique } from "../odm";
import { Errors } from "@/lib/api-utils";
import { Permission, Role as RoleEnum } from "../../rbac/permissions";

@model("Role", { timestamps: true })
export class Role {
  _id!: string;
  createdAt!: Date;
  updatedAt!: Date;

  @field({ type: String, required: true })
  @unique()
  name!: string;

  @field({ type: String })
  description?: string;

  @field({ type: [String], default: [] })
  permissions!: Permission[];

  @field({ type: Number, default: 0 })
  hierarchyLevel!: number; // Lower number = lower privilege, used for drag-and-drop UI ordering

  @field({ type: Boolean, default: false })
  inherits!: boolean; // Whether this role inherits permissions from other roles

  @field({ type: [String], default: [] })
  inheritsFrom!: string[]; // Role IDs to inherit from. If empty and inherits=true, inherits from all roles with lower hierarchyLevel

  @field({ type: Boolean, default: true })
  isActive!: boolean;

  @field({ type: Boolean, default: false })
  isSystem!: boolean; // System roles cannot be deleted
}

export const RoleModel = getModel(Role);

export class RoleQueries {
  static async findByName(name: RoleEnum) {
    return RoleModel.findOne({ name, isActive: true }).exec();
  }

  static async findById(id: string) {
    return RoleModel.findById(id).exec();
  }

  static async findByNames(names: RoleEnum[]) {
    return RoleModel.find({ name: { $in: names }, isActive: true }).exec();
  }

  static async listAll(includeInactive = false) {
    const query = includeInactive ? {} : { isActive: true };
    return RoleModel.find(query).sort({ name: 1 }).exec();
  }

  static async getPermissionsForRole(roleId: string): Promise<Permission[]> {
    const role = await RoleModel.findById(roleId).exec();
    if (!role) {
      throw new Errors.NotFound("Role not found");
    }

    const permissions = new Set<Permission>(role.permissions);

    // Handle inheritance
    if (role.inherits) {
      let rolesToInheritFrom: Role[];

      if (role.inheritsFrom && role.inheritsFrom.length > 0) {
        // Inherit from specific roles
        rolesToInheritFrom = await RoleModel.find({
          _id: { $in: role.inheritsFrom },
          isActive: true,
        }).exec();
      } else {
        // Inherit from all roles with lower hierarchyLevel
        rolesToInheritFrom = await RoleModel.find({
          hierarchyLevel: { $lt: role.hierarchyLevel },
          isActive: true,
        }).exec();
      }

      // Recursively get permissions from inherited roles
      for (const inheritedRole of rolesToInheritFrom) {
        const inheritedPermissions = await this.getPermissionsForRole(
          inheritedRole._id
        );
        inheritedPermissions.forEach((p) => permissions.add(p));
      }
    }

    return Array.from(permissions);
  }

  static async getPermissionsForRoles(
    roleIds: string[]
  ): Promise<Permission[]> {
    const roles = await RoleModel.find({ _id: { $in: roleIds } }).exec();
    const permissions = new Set<Permission>();
    roles.forEach((role) => {
      role.permissions.forEach((permission) => permissions.add(permission));
    });
    return Array.from(permissions);
  }
}

export class RoleMutations {
  static async createRole(data: {
    name: RoleEnum;
    description?: string;
    permissions: Permission[];
    hierarchyLevel?: number;
    inherits?: boolean;
    inheritsFrom?: string[];
    isSystem?: boolean;
  }) {
    const existing = await RoleModel.findOne({ name: data.name }).exec();
    if (existing) {
      throw new Errors.Conflict(`Role ${data.name} already exists`);
    }

    const role = new RoleModel({
      name: data.name,
      description: data.description,
      permissions: data.permissions,
      hierarchyLevel: data.hierarchyLevel ?? 0,
      inherits: data.inherits ?? false,
      inheritsFrom: data.inheritsFrom ?? [],
      isSystem: data.isSystem || false,
    });

    return role.save();
  }

  static async updateRole(
    roleId: string,
    data: {
      description?: string;
      permissions?: Permission[];
      hierarchyLevel?: number;
      inherits?: boolean;
      inheritsFrom?: string[];
    }
  ) {
    const role = await RoleModel.findById(roleId).exec();
    if (!role) {
      throw new Errors.NotFound("Role not found");
    }

    if (role.isSystem) {
      throw new Errors.Forbidden("Cannot modify system roles");
    }

    return RoleModel.findByIdAndUpdate(
      roleId,
      { $set: data },
      { new: true }
    ).exec();
  }

  static async deleteRole(roleId: string) {
    const role = await RoleModel.findById(roleId).exec();
    if (!role) {
      throw new Errors.NotFound("Role not found");
    }

    if (role.isSystem) {
      throw new Errors.Forbidden("Cannot delete system roles");
    }

    return RoleModel.findByIdAndUpdate(
      roleId,
      { isActive: false },
      { new: true }
    ).exec();
  }

  static async addPermissionsToRole(roleId: string, permissions: Permission[]) {
    const role = await RoleModel.findById(roleId).exec();
    if (!role) {
      throw new Errors.NotFound("Role not found");
    }

    if (role.isSystem) {
      throw new Errors.Forbidden("Cannot modify system roles");
    }

    const updatedPermissions = Array.from(
      new Set([...role.permissions, ...permissions])
    );

    return RoleModel.findByIdAndUpdate(
      roleId,
      { permissions: updatedPermissions },
      { new: true }
    ).exec();
  }

  static async removePermissionsFromRole(
    roleId: string,
    permissions: Permission[]
  ) {
    const role = await RoleModel.findById(roleId).exec();
    if (!role) {
      throw new Errors.NotFound("Role not found");
    }

    if (role.isSystem) {
      throw new Errors.Forbidden("Cannot modify system roles");
    }

    const updatedPermissions = role.permissions.filter(
      (p) => !permissions.includes(p)
    );

    return RoleModel.findByIdAndUpdate(
      roleId,
      { permissions: updatedPermissions },
      { new: true }
    ).exec();
  }
}
