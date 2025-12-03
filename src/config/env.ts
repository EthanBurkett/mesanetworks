import { z } from "zod";
import { readFileSync } from "fs";
import path from "path";
import fs from "fs";

function loadEnv() {
  try {
    const envFile = fs.readFileSync(
      path.join(process.cwd(), ".env.local"),
      "utf-8"
    );
    const envVars: Record<string, string> = {};

    envFile.split("\n").forEach((line, index) => {
      const cleanLine = line.trim().replace(/\r$/, "");
      if (cleanLine === "" || cleanLine.startsWith("#")) {
        return;
      }

      const match = cleanLine.match(/^([^=]+)=(.*)$/);
      if (match?.[1] && match[2] !== undefined) {
        const key = match[1].trim();
        let value = match[2].trim();

        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }

        envVars[key] = value;
      }
    });

    return { ...process.env, ...envVars };
  } catch (error) {
    console.warn("No .env file found, using process.env");
    return { ...process.env };
  }
}

const envVars = loadEnv();

const isVerify = (process.env.NODE_ENV as string) === "verify";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test", "verify", "local"])
    .default("development"),

  DATABASE_URI: z.string().default("mongodb://localhost:27017/mesanetworks"),
  AUTH0_DOMAIN: z.string().min(1, "AUTH0_DOMAIN is required"),
  AUTH0_CLIENT_ID: z.string().min(1, "AUTH0_CLIENT_ID is required"),
  AUTH0_CLIENT_SECRET: z.string().min(1, "AUTH0_CLIENT_SECRET is required"),
  AUTH0_AUDIENCE: z.string().optional(),
  AUTH0_SCOPE: z.string().default("read:users update:users create:users"),
  // POLAR_ACCESS_TOKEN: z.string().min(1, "POLAR_ACCESS_TOKEN is required"),
  // POLAR_WEBHOOK_SECRET: z.string().min(1, "POLAR_WEBHOOK_SECRET is required"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRY: z.string().default("1h"),
  REDIS_URI: z.string().default("redis://localhost:6379"),
});

if (!isVerify) {
  try {
    envSchema.parse(envVars);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(
        "❌ Invalid environment variables:",
        `Validation failed: ${error.issues
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join(", ")}`
      );
      process.exit(1);
    }
  }
}

export const env = isVerify
  ? (envVars as z.infer<typeof envSchema>)
  : envSchema.parse(envVars);

export type Env = z.infer<typeof envSchema>;
