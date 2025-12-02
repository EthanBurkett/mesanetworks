import jwt from "jsonwebtoken";
import { env } from "../config/env";

export const issueSession = (payload: object) => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRY,
  } as jwt.SignOptions);
};

export const verifySession = (token: string) => {
  try {
    return jwt.verify(token, env.JWT_SECRET) as {
      sub: string;
    };
  } catch (err) {
    throw new Error("Invalid or expired session token");
  }
};
