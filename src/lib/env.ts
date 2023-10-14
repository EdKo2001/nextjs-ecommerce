import zod from "zod";

const envSchema = zod.object({
  DATABASE_URL: zod.string().trim().min(1),
  SECRET_KEY: zod.string().trim().min(1),
  GOOGLE_CLIENT_ID: zod.string().trim().min(1),
  GOOGLE_CLIENT_SECRET: zod.string().trim().min(1),
  NEXTAUTH_URL: zod.string().trim().min(1),
  NEXTAUTH_SECRET: zod.string().trim().min(1),
});

export const env = envSchema.parse(process.env);
