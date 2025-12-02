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
  name!: RoleEnum;

  @field({ type: String })
  description?: string;

  @field({ type: [String], default: [] })
  permissions!: Permission[];

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
    return role.permissions;
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
      isSystem: data.isSystem || false,
    });

    return role.save();
  }

  static async updateRole(
    roleId: string,
    data: {
      description?: string;
      permissions?: Permission[];
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
