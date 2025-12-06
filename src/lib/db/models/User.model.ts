import { CreateUserSchema, RegisterSchema } from "@/schemas/auth.schema";
import { field, getModel, model, unique } from "../odm";
import { parseDbError } from "@/utils/db-error-parser";
import { Errors } from "@/lib/api-utils";
import { getDefaultUserRoleId } from "../init-roles";
import {
  generateTOTPSecret,
  generateBackupCodes,
  hashBackupCode,
  verifyTOTPToken,
  verifyBackupCode,
  encryptSecret,
  decryptSecret,
} from "@/lib/auth/two-factor";

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

  // Two-Factor Authentication
  @field({ type: Boolean, default: false })
  twoFactorEnabled!: boolean;

  @field({ type: String })
  twoFactorSecret?: string; // Encrypted TOTP secret

  @field({ type: Boolean, default: false })
  twoFactorVerified!: boolean;

  @field({ type: [String], default: [] })
  backupCodes!: string[]; // Hashed backup codes
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

  /**
   * Check if user has 2FA enabled
   */
  static async hasTwoFactorEnabled(identifier: string): Promise<boolean> {
    const user = await this.findByIdentifier(identifier);
    return user?.twoFactorEnabled ?? false;
  }

  /**
   * Get user's 2FA status
   */
  static async getTwoFactorStatus(identifier: string): Promise<{
    enabled: boolean;
    verified: boolean;
    hasBackupCodes: boolean;
    backupCodesCount: number;
  }> {
    const user = await this.findByIdentifier(identifier);
    if (!user) {
      throw new Errors.NotFound("User not found");
    }

    const backupCodes = user.backupCodes || [];

    return {
      enabled: user.twoFactorEnabled || false,
      verified: user.twoFactorVerified || false,
      hasBackupCodes: backupCodes.length > 0,
      backupCodesCount: backupCodes.length,
    };
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

  // Two-Factor Authentication Methods

  /**
   * Generate and store encrypted TOTP secret for user
   * @returns The unencrypted secret (for QR code generation)
   */
  static async setupTwoFactor(identifier: string): Promise<string> {
    const user = await UserQueries.findByIdentifier(identifier);
    if (!user) {
      throw new Errors.NotFound("User not found");
    }

    const secret = generateTOTPSecret();
    user.twoFactorSecret = encryptSecret(secret);
    user.twoFactorVerified = false;
    await user.save();

    return secret; // Return unencrypted for QR code
  }

  /**
   * Verify TOTP token and enable 2FA for user
   */
  static async verifyAndEnableTwoFactor(
    identifier: string,
    token: string
  ): Promise<boolean> {
    const user = await UserQueries.findByIdentifier(identifier);
    if (!user) {
      throw new Errors.NotFound("User not found");
    }

    if (!user.twoFactorSecret) {
      // Try to fetch fresh from database in case of race condition
      const freshUser = await UserModel.findById(identifier).exec();
      if (!freshUser || !freshUser.twoFactorSecret) {
        throw new Errors.BadRequest("Two-factor not set up for this user");
      }

      const secret = decryptSecret(freshUser.twoFactorSecret);
      const isValid = verifyTOTPToken(token, secret);

      if (!isValid) {
        throw new Errors.Unauthorized("Invalid verification code");
      }

      freshUser.twoFactorEnabled = true;
      freshUser.twoFactorVerified = true;
      await freshUser.save();

      return true;
    }

    const secret = decryptSecret(user.twoFactorSecret);
    const isValid = verifyTOTPToken(token, secret);

    if (!isValid) {
      throw new Errors.Unauthorized("Invalid verification code");
    }

    user.twoFactorEnabled = true;
    user.twoFactorVerified = true;
    await user.save();

    return true;
  }

  /**
   * Verify TOTP token during login
   */
  static async verifyTwoFactorToken(
    identifier: string,
    token: string
  ): Promise<boolean> {
    const user = await UserQueries.findByIdentifier(identifier);
    if (!user) {
      throw new Errors.NotFound("User not found");
    }

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new Errors.BadRequest("Two-factor not enabled for this user");
    }

    const secret = decryptSecret(user.twoFactorSecret);
    return verifyTOTPToken(token, secret);
  }

  /**
   * Disable two-factor authentication
   */
  static async disableTwoFactor(identifier: string): Promise<void> {
    const user = await UserQueries.findByIdentifier(identifier);
    if (!user) {
      throw new Errors.NotFound("User not found");
    }

    user.twoFactorEnabled = false;
    user.twoFactorVerified = false;
    user.twoFactorSecret = undefined;
    user.backupCodes = [];
    await user.save();
  }

  /**
   * Generate new backup codes for user
   * @returns Array of plain-text backup codes (show once to user)
   */
  static async generateBackupCodes(identifier: string): Promise<string[]> {
    const user = await UserQueries.findByIdentifier(identifier);
    if (!user) {
      throw new Errors.NotFound("User not found");
    }

    if (!user.twoFactorEnabled) {
      throw new Errors.BadRequest("Two-factor must be enabled first");
    }

    const codes = generateBackupCodes(10);
    user.backupCodes = codes.map(hashBackupCode);
    await user.save();

    return codes; // Return plain codes for one-time display
  }

  /**
   * Verify and consume a backup code
   */
  static async verifyBackupCode(
    identifier: string,
    code: string
  ): Promise<boolean> {
    const user = await UserQueries.findByIdentifier(identifier);
    if (!user) {
      throw new Errors.NotFound("User not found");
    }

    if (!user.twoFactorEnabled) {
      throw new Errors.BadRequest("Two-factor not enabled for this user");
    }

    const backupCodes = user.backupCodes || [];

    // Find matching backup code
    const matchIndex = backupCodes.findIndex((hashedCode) =>
      verifyBackupCode(code, hashedCode)
    );

    if (matchIndex === -1) {
      return false; // Invalid code
    }

    // Remove used backup code
    backupCodes.splice(matchIndex, 1);
    user.backupCodes = backupCodes;
    await user.save();

    return true;
  }
}
