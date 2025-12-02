import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z, ZodError } from "zod";
import { ensureDBConnection } from "./db";
import {
  Permission,
  Role,
  hasRole,
  hasPermission,
  hasAllPermissions,
  getEffectivePermissions,
} from "./rbac";
import { SessionQueries, SessionMutations } from "./db/models/Session.model";
import { UserModel, UserQueries, User } from "./db/models/User.model";
import { RoleQueries } from "./db/models/Role.model";
import type { UserPermissions } from "./rbac";
import jwt from "jsonwebtoken";
import { env } from "@/config/env";

export interface AuthenticatedUser {
  user: User;
  identifier: string; // email, _id, or auth0Id
  permissions: UserPermissions;
}

// HTTP Status Codes
export enum HttpStatusCode {
  OK = 200,
  Created = 201,
  NoContent = 204,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  Conflict = 409,
  UnprocessableEntity = 422,
  TooManyRequests = 429,
  InternalServerError = 500,
  ServiceUnavailable = 503,
}

// Base API Error class
export class ApiError extends Error {
  constructor(
    public statusCode: HttpStatusCode,
    message: string,
    public messages: string[] = []
  ) {
    super(message);
    this.name = this.constructor.name;
    if (messages.length === 0) {
      this.messages = [message];
    }
  }
}

// Error classes for each status code
export class BadRequestError extends ApiError {
  constructor(message = "Bad Request", messages?: string[]) {
    super(HttpStatusCode.BadRequest, message, messages);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = "Unauthorized", messages?: string[]) {
    super(HttpStatusCode.Unauthorized, message, messages);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = "Forbidden", messages?: string[]) {
    super(HttpStatusCode.Forbidden, message, messages);
  }
}

export class NotFoundError extends ApiError {
  constructor(message = "Not Found", messages?: string[]) {
    super(HttpStatusCode.NotFound, message, messages);
  }
}

export class ConflictError extends ApiError {
  constructor(message = "Conflict", messages?: string[]) {
    super(HttpStatusCode.Conflict, message, messages);
  }
}

export class UnprocessableEntityError extends ApiError {
  constructor(message = "Unprocessable Entity", messages?: string[]) {
    super(HttpStatusCode.UnprocessableEntity, message, messages);
  }
}

export class TooManyRequestsError extends ApiError {
  constructor(message = "Too Many Requests", messages?: string[]) {
    super(HttpStatusCode.TooManyRequests, message, messages);
  }
}

export class InternalServerError extends ApiError {
  constructor(message = "Internal Server Error", messages?: string[]) {
    super(HttpStatusCode.InternalServerError, message, messages);
  }
}

export class ServiceUnavailableError extends ApiError {
  constructor(message = "Service Unavailable", messages?: string[]) {
    super(HttpStatusCode.ServiceUnavailable, message, messages);
  }
}

// Exported Errors object for easy access
export const Errors = {
  BadRequest: BadRequestError,
  Unauthorized: UnauthorizedError,
  Forbidden: ForbiddenError,
  NotFound: NotFoundError,
  Conflict: ConflictError,
  UnprocessableEntity: UnprocessableEntityError,
  TooManyRequests: TooManyRequestsError,
  InternalServer: InternalServerError,
  ServiceUnavailable: ServiceUnavailableError,
};

// API Response type
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  code: HttpStatusCode;
  messages: string[];
}

// Wrapper configuration
interface WrapperConfig<TSchema extends z.ZodTypeAny = z.ZodTypeAny> {
  request: NextRequest;
  parser?: TSchema;
  requireAuth?: boolean; // Just require authentication, no specific permissions
  requireRole?: Role;
  requirePermission?: Permission;
  requirePermissions?: Permission[];
  params?: Promise<Record<string, string>>;
}

// Helper function to get user from request
async function getUserFromRequest(
  request: NextRequest
): Promise<AuthenticatedUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) {
    return null;
  }

  try {
    // Verify JWT
    const decoded = jwt.verify(token, env.JWT_SECRET) as any;

    // Check session in database
    const session = await SessionQueries.findByToken(token);
    if (!session) {
      return null;
    }

    // Update last active time (async, don't wait)
    SessionMutations.updateLastActive(token).catch((err) => {
      console.error("Failed to update session activity:", err);
    });

    // Load user from database with populated roles
    const user = await UserQueries.findByAuth0IdAndPopulate(decoded.sub);

    if (!user) {
      return null;
    }

    // Get permissions from role documents
    let rolePermissions: Permission[] = [];
    if (user.roles && user.roles.length > 0) {
      rolePermissions = await RoleQueries.getPermissionsForRoles(
        user.roles as unknown as string[]
      );
    }

    // Calculate effective permissions
    const userPerms = {
      roles: [],
      permissions: rolePermissions,
    };

    const effectivePermissions = getEffectivePermissions(userPerms);

    const permissions: UserPermissions = {
      roles: [],
      permissions: effectivePermissions,
    };

    // Determine identifier (prefer email, then _id, then auth0Id)
    const identifier = user._id || user.auth0Id;

    return {
      user: user.toObject() as User,
      identifier,
      permissions,
    };
  } catch (error) {
    return null;
  }
}

// API Handler context
export interface HandlerContext<TBody = unknown> {
  auth?: AuthenticatedUser;
  body: TBody;
  params?: Record<string, string>;
}

// API Handler type
type ApiHandler<T = unknown, TBody = unknown> = (
  ctx: HandlerContext<TBody>
) => Promise<T> | T;

// Main wrapper function
export async function wrapper<T = unknown, TSchema extends z.ZodTypeAny = any>(
  configOrRequest: WrapperConfig<TSchema> | NextRequest,
  handler: ApiHandler<
    T,
    TSchema extends z.ZodTypeAny ? z.infer<TSchema> : never
  >
): Promise<NextResponse> {
  try {
    await ensureDBConnection();

    // Normalize config to always be an object
    const config: WrapperConfig<TSchema> =
      configOrRequest instanceof NextRequest
        ? { request: configOrRequest }
        : configOrRequest;

    const {
      request,
      parser,
      requireAuth,
      requireRole,
      requirePermission,
      requirePermissions,
      params,
    } = config;

    // Await params if provided
    const resolvedParams = params ? await params : undefined;

    // Always try to get authenticated user (even if not required)
    let authenticatedUser: AuthenticatedUser | undefined;
    const user = await getUserFromRequest(request);

    if (user) {
      authenticatedUser = user;
    }

    // Check if authentication is required
    if (requireAuth || requireRole || requirePermission || requirePermissions) {
      if (!authenticatedUser) {
        throw new UnauthorizedError("Authentication required");
      }

      // Check role requirement
      if (requireRole && !hasRole(authenticatedUser.permissions, requireRole)) {
        throw new ForbiddenError(
          `This action requires the ${requireRole} role`
        );
      }

      // Check single permission requirement
      if (
        requirePermission &&
        !hasPermission(authenticatedUser.permissions, requirePermission)
      ) {
        throw new ForbiddenError(
          `Missing required permission: ${requirePermission}`
        );
      }

      // Check multiple permissions requirement
      if (
        requirePermissions &&
        !hasAllPermissions(authenticatedUser.permissions, requirePermissions)
      ) {
        throw new ForbiddenError("Missing required permissions");
      }
    }

    // Build context object
    const ctx: HandlerContext<
      TSchema extends z.ZodTypeAny ? z.infer<TSchema> : never
    > = {
      auth: authenticatedUser,
      body: {} as any,
      params: resolvedParams,
    };

    // If parser is provided, parse and validate the request body
    if (parser) {
      try {
        let rawBody;
        try {
          rawBody = await request.json();
        } catch (jsonError) {
          throw new BadRequestError("Invalid JSON in request body", [
            "Request body must be valid JSON",
          ]);
        }

        const parsedBody = parser.parse(rawBody);

        // Add parsed body to context
        (ctx as any).body = parsedBody;

        // Call handler with context
        const result = await handler(ctx);

        // Success response
        const response: ApiResponse<T> = {
          success: true,
          data: result,
          code: HttpStatusCode.OK,
          messages: [],
        };

        return NextResponse.json(response, { status: HttpStatusCode.OK });
      } catch (error) {
        // Handle Zod validation errors
        if (error instanceof ZodError) {
          const messages = error.issues.map(
            (err) => `${err.path.join(".")}: ${err.message}`
          );

          const response: ApiResponse<null> = {
            success: false,
            data: null,
            code: HttpStatusCode.BadRequest,
            messages,
          };

          return NextResponse.json(response, {
            status: HttpStatusCode.BadRequest,
          });
        }

        // Re-throw other errors to be caught by outer catch
        throw error;
      }
    } else {
      // Call handler with context (no body)
      const result = await handler(ctx);

      // Success response
      const response: ApiResponse<T> = {
        success: true,
        data: result,
        code: HttpStatusCode.OK,
        messages: [],
      };

      return NextResponse.json(response, { status: HttpStatusCode.OK });
    }
  } catch (error) {
    // Handle API errors
    if (error instanceof ApiError) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        code: error.statusCode,
        messages: error.messages,
      };

      return NextResponse.json(response, { status: error.statusCode });
    }

    // Handle unknown errors
    console.error("Unhandled error in API route:", error);
    const response: ApiResponse<null> = {
      success: false,
      data: null,
      code: HttpStatusCode.InternalServerError,
      messages: ["An unexpected error occurred"],
    };

    return NextResponse.json(response, {
      status: HttpStatusCode.InternalServerError,
    });
  }
}
