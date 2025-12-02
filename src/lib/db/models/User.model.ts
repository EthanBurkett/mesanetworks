import { CreateUserSchema, RegisterSchema } from "@/schemas/auth.schema";
import { field, getModel, model, unique } from "../odm";
import { parseDbError } from "@/utils/db-error-parser";
import { Errors } from "@/lib/api-utils";
import { getDefaultUserRoleId } from "../init-roles";

@model("user", {
  timestamps: true,
})
export class User {
  _id!: string;
  _createdAt!: Date;
  _updatedAt!: Date;

  @field({ type: String, required: true })
  @unique()
  auth0Id!: string;

  @field({ unique: true, type: String, required: true })
  email!: string;

  @field({ type: String, required: true })
  firstName!: string;

  @field({ type: String, required: true })
  lastName!: string;

  @field({ type: String })
  avatarUrl?: string;

  @field({ type: Boolean, default: true })
  isActive!: boolean;

  @field({ type: Date })
  lastLoginAt?: Date;

  @field({ type: [String], ref: "Role", default: [] })
  roles!: string[];
}

export const UserModel = getModel(User);

export class UserQueries {
  static async findByAuth0IdAndPopulate(auth0Id: string) {
    return UserModel.findOne({ auth0Id }).populate("roles").exec();
  }

  static async findByEmail(email: string) {
    return UserModel.findOne({ email }).exec();
  }

  static async findById(id: string) {
    return UserModel.findById(id).exec();
  }

  static async getUserWithActiveSessions(auth0Id: string) {
    const user = await UserModel.findOne({ auth0Id }).exec();
    if (!user) {
      throw new Errors.NotFound("User not found");
    }
    return user;
  }

  static async findByIdentifier(identifier: string) {
    return UserModel.findOne({
      $or: [
        { _id: identifier },
        { auth0Id: identifier },
        { email: identifier },
      ],
    }).exec();
  }

  static async findAll() {
    return UserModel.find().exec();
  }

  static async findByAuth0Id(auth0Id: string) {
    return UserModel.findOne({ auth0Id }).exec();
  }

  static async findWithRoles(identifier: string) {
    const user = await this.findByIdentifier(identifier);
    if (!user) {
      return null;
    }
    return user;
  }
}

export class UserMutations {
  public static async createUser(data: CreateUserSchema) {
    try {
      let user = await UserModel.findOne({ auth0Id: data.auth0Id }).exec();

      if (user) {
        user.email = data.email.toLowerCase();
        user.lastLoginAt = new Date();
        await user.save();
        return user;
      }

      user = await UserModel.findOne({
        email: data.email.toLowerCase(),
      }).exec();

      if (user) {
        user.auth0Id = data.auth0Id;
        user.lastLoginAt = new Date();
        await user.save();
        return user;
      }

      user = await UserModel.create({
        auth0Id: data.auth0Id,
        email: data.email.toLowerCase(),
        firstName: data.firstName,
        lastName: data.lastName,
        avatarUrl: data.avatarUrl,
        lastLoginAt: new Date(),
      });

      try {
        const defaultRoleId = await getDefaultUserRoleId();
        user.roles = [defaultRoleId];
        await user.save();
      } catch (error) {
        console.warn("Could not assign default role to new user:", error);
      }

      return user;
    } catch (error) {
      parseDbError(error);
    }
  }

  static async updateLastLogin(identifier: string) {
    const user = await UserQueries.findByIdentifier(identifier);
    if (!user) {
      throw new Errors.NotFound("User not found");
    }
    user.lastLoginAt = new Date();
    return user.save();
  }

  static async updateProfile(
    identifier: string,
    data: {
      firstName?: string;
      lastName?: string;
      avatarUrl?: string;
    }
  ) {
    const user = await UserQueries.findByIdentifier(identifier);
    if (!user) {
      throw new Errors.NotFound("User not found");
    }
    if (data.firstName !== undefined) user.firstName = data.firstName;
    if (data.lastName !== undefined) user.lastName = data.lastName;
    if (data.avatarUrl !== undefined) user.avatarUrl = data.avatarUrl;
    return user.save();
  }

  static async deactivate(identifier: string) {
    const user = await UserQueries.findByIdentifier(identifier);
    if (!user) {
      throw new Errors.NotFound("User not found");
    }
    user.isActive = false;
    return user.save();
  }

  static async reactivate(identifier: string) {
    const user = await UserQueries.findByIdentifier(identifier);
    if (!user) {
      throw new Errors.NotFound("User not found");
    }
    user.isActive = true;
    return user.save();
  }

  static async assignRoleIds(identifier: string, roleIds: string[]) {
    const user = await UserQueries.findByIdentifier(identifier);
    if (!user) {
      throw new Errors.NotFound("User not found");
    }

    const newRoleIds = roleIds.filter((id) => !user.roles.includes(id));
    user.roles.push(...newRoleIds);
    return user.save();
  }

  static async removeRoleIds(identifier: string, roleIds: string[]) {
    const user = await UserQueries.findByIdentifier(identifier);
    if (!user) {
      throw new Errors.NotFound("User not found");
    }
    user.roles = user.roles.filter((id) => !roleIds.includes(id));
    return user.save();
  }

  static async setRoleIds(identifier: string, roleIds: string[]) {
    const user = await UserQueries.findByIdentifier(identifier);
    if (!user) {
      throw new Errors.NotFound("User not found");
    }
    user.roles = roleIds;
    return user.save();
  }
}
