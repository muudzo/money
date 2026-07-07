import { z } from "zod";

/**
 * Central, validated configuration. Import `env` anywhere instead of reading
 * `process.env` directly so misconfiguration fails fast with a clear message.
 *
 * Only AUTH_SECRET and DATABASE_URL are truly required; every AI/billing
 * provider has a free/local default so the app runs with an otherwise empty env.
 */
const schema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  APP_URL: z.string().url().default("http://localhost:3000"),

  AUTH_SECRET: z
    .string()
    .min(16, "AUTH_SECRET must be at least 16 chars — run: openssl rand -base64 32"),
  DATABASE_URL: z.string().min(1).default("file:./dev.db"),

  SCRIPT_PROVIDER: z.enum(["ollama", "template"]).default("ollama"),
  OLLAMA_URL: z.string().url().default("http://localhost:11434"),
  OLLAMA_MODEL: z.string().default("llama3.2"),

  TTS_PROVIDER: z.enum(["say", "piper", "kokoro"]).default("say"),
  PIPER_BIN: z.string().optional(),
  PIPER_VOICE: z.string().optional(),

  CAPTIONS_PROVIDER: z.enum(["estimate", "whisper"]).default("estimate"),
  WHISPER_BIN: z.string().optional(),

  AVATAR_PROVIDER: z.enum(["kenburns", "lipsync"]).default("kenburns"),
  LIPSYNC_ENDPOINT: z.string().optional(),

  BILLING_PROVIDER: z.enum(["mock", "stripe"]).default("mock"),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRICE_STARTER: z.string().optional(),
  STRIPE_PRICE_GROWTH: z.string().optional(),
  STRIPE_PRICE_SCALE: z.string().optional(),
});

function loadEnv() {
  // During `next build`, AUTH_SECRET may be absent in CI; allow a build-time
  // placeholder so static analysis doesn't crash. Runtime still validates.
  const raw = {
    ...process.env,
    AUTH_SECRET:
      process.env.AUTH_SECRET ??
      (process.env.NEXT_PHASE === "phase-production-build"
        ? "build-time-placeholder-secret"
        : undefined),
  };

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return parsed.data;
}

export const env = loadEnv();
export type Env = typeof env;

export const isProd = env.NODE_ENV === "production";
