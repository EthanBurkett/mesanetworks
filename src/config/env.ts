import { z } from "zod";
import { readFileSync } from "fs";
import path from "path";
import fs from "fs";
import crypto from "crypto";

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

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test", "local"])
    .default("development"),
  APP_URL: z
    .string()
    .url()
    .default(
      process.env.NODE_ENV === "production"
        ? "https://mesanet.works"
        : "http://localhost:3000"
    ),

  DATABASE_URI: z.string().default("mongodb://localhost:27017/mesanetworks"),
  AUTH0_DOMAIN: z.string().min(1, "AUTH0_DOMAIN is required"),
  AUTH0_CLIENT_ID: z.string().min(1, "AUTH0_CLIENT_ID is required"),
  AUTH0_CLIENT_SECRET: z.string().min(1, "AUTH0_CLIENT_SECRET is required"),
  AUTH0_AUDIENCE: z.string().optional(),
  AUTH0_SCOPE: z.string().default("read:users update:users create:users"),
  // POLAR_ACCESS_TOKEN: z.string().min(1, "POLAR_ACCESS_TOKEN is required"),
  // POLAR_WEBHOOK_SECRET: z.string().min(1, "POLAR_WEBHOOK_SECRET is required"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRY: z.string().default("24h"),
  REDIS_URI: z.string().default("redis://localhost:6379"),

  // Azure Blob Storage for backups
  AZURE_STORAGE_ACCOUNT_NAME: z.string().optional(),
  AZURE_STORAGE_ACCOUNT_KEY: z.string().optional(),
  AZURE_STORAGE_CONNECTION_STRING: z.string().optional(),
  AZURE_BACKUP_CONTAINER_NAME: z.string().default("database-backups"),

  // SMTP Configuration
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_SECURE: z.coerce.boolean().default(false), // true for 465, false for other ports
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM_NAME: z.string().default("Mesa Networks"),
  SMTP_FROM_EMAIL: z.string().email().optional(),

  TWO_FACTOR_ENCRYPTION_KEY: z
    .string()
    .min(32, "TWO_FACTOR_ENCRYPTION_KEY must be at least 32 characters"),
});

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

export const env = envSchema.parse(envVars);

export type Env = z.infer<typeof envSchema>;
