import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),
  AUTH_SECRET: z.string().optional(),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

const raw = {
  DATABASE_URL: process.env.DATABASE_URL ?? "",
  AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
  AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
  AUTH_SECRET: process.env.AUTH_SECRET,
  NODE_ENV: process.env.NODE_ENV ?? "development",
};

const parsed = envSchema.safeParse(raw);

if (!parsed.success) {
  // Log and fail fast — misconfigured environments are unsafe for prod
  console.error("Invalid environment configuration:\n", parsed.error.format());
  throw new Error("Invalid environment configuration");
}

const env = parsed.data;

// In production, require auth-related secrets
if (env.NODE_ENV === "production") {
  const missing = [] as string[];
  if (!env.AUTH_GOOGLE_ID) missing.push("AUTH_GOOGLE_ID");
  if (!env.AUTH_GOOGLE_SECRET) missing.push("AUTH_GOOGLE_SECRET");
  if (!env.AUTH_SECRET) missing.push("AUTH_SECRET");

  if (missing.length > 0) {
    console.error("Missing required production env vars:", missing.join(", "));
    throw new Error(
      "Missing required production environment variables: " +
        missing.join(", "),
    );
  }
}

export { env };
