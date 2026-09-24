import { PoolConfig } from "pg";

const STRIP_PARAMS = ["sslmode", "ssl", "channel_binding", "uselibpqcompat"];

function envFlag(name: string): boolean | undefined {
  const value = process.env[name];
  if (value == null || value === "") return undefined;
  const normalized = value.toLowerCase();
  if (["1", "true", "yes", "require"].includes(normalized)) return true;
  if (["0", "false", "no", "disable", "disabled"].includes(normalized)) {
    return false;
  }
  return undefined;
}

function isNeonHost(value: string): boolean {
  return /(^|\.)neon\.(tech|build)(:|\/|\?|$)/i.test(value || "");
}

function trimEnv(value?: string): string | undefined {
  if (value == null) return undefined;
  const trimmed = value.trim().replace(/^['"]|['"]$/g, "");
  return trimmed || undefined;
}

export function getDatabaseUrl(): string | undefined {
  return (
    trimEnv(process.env.DATABASE_URL) ||
    trimEnv(process.env.POSTGRES_URL) ||
    trimEnv(process.env.POSTGRES_PRISMA_URL) ||
    trimEnv(process.env.NEON_DATABASE_URL) ||
    undefined
  );
}

function sanitizeConnectionString(connectionString: string): string {
  try {
    const parsed = new URL(connectionString);
    for (const key of STRIP_PARAMS) {
      parsed.searchParams.delete(key);
    }
    return parsed.toString();
  } catch {
    return connectionString;
  }
}

export function shouldUseSsl(connectionString?: string): boolean {
  const sslFlag = envFlag("DB_SSL");
  if (sslFlag !== undefined) return sslFlag;

  if (!connectionString) {
    return isNeonHost(process.env.DB_HOST || "");
  }

  try {
    const parsed = new URL(connectionString);
    const sslMode = (
      parsed.searchParams.get("sslmode") ||
      process.env.PGSSLMODE ||
      ""
    ).toLowerCase();
    if (["disable"].includes(sslMode)) return false;
    if (["require", "verify-ca", "verify-full", "prefer"].includes(sslMode)) {
      return true;
    }
    return isNeonHost(parsed.hostname);
  } catch {
    const lower = connectionString.toLowerCase();
    if (lower.includes("sslmode=disable")) return false;
    return (
      lower.includes("sslmode=require") ||
      lower.includes("sslmode=verify") ||
      isNeonHost(lower)
    );
  }
}

export function createPgPoolConfig(): PoolConfig {
  const rawUrl = getDatabaseUrl();
  const useSsl = shouldUseSsl(rawUrl);
  const ssl = useSsl ? { rejectUnauthorized: false } : undefined;
  const isNeon = rawUrl
    ? isNeonHost(rawUrl)
    : isNeonHost(process.env.DB_HOST || "");
  const max = Number(process.env.DB_POOL_MAX) || (isNeon ? 5 : 20);
  const idleTimeoutMillis =
    Number(process.env.DB_IDLE_TIMEOUT) || (isNeon ? 10000 : 30000);
  const connectionTimeoutMillis =
    Number(process.env.DB_CONNECT_TIMEOUT) || (isNeon ? 20000 : 10000);

  if (rawUrl) {
    return {
      connectionString: sanitizeConnectionString(rawUrl),
      ssl,
      max,
      idleTimeoutMillis,
      connectionTimeoutMillis,
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
    };
  }

  return {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "rooh_db",
    ssl,
    max,
    idleTimeoutMillis,
    connectionTimeoutMillis,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
  };
}
