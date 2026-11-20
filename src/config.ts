function positiveInteger(value: string | undefined, fallback: number, name: string): number {
  const parsed = value === undefined ? fallback : Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer.`);
  }

  return parsed;
}

const nodeEnv = process.env.NODE_ENV ?? "development";
const port = positiveInteger(process.env.PORT, 3000, "PORT");
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required.");
}

if (nodeEnv === "production" && !process.env.BASE_URL) {
  throw new Error("BASE_URL is required in production.");
}

const rawBaseUrl = process.env.BASE_URL ?? `http://localhost:${port}`;
const rawTrustProxy = process.env.TRUST_PROXY;
let baseUrl: string;

try {
  const parsedBaseUrl = new URL(rawBaseUrl);

  if (parsedBaseUrl.protocol !== "http:" && parsedBaseUrl.protocol !== "https:") {
    throw new Error("BASE_URL must use http or https.");
  }

  baseUrl = rawBaseUrl.replace(/\/+$/, "");
} catch {
  throw new Error("BASE_URL must be a valid absolute http or https URL.");
}

export const config = {
  nodeEnv,
  port,
  databaseUrl,
  baseUrl,
  // Trust only the configured number of reverse proxies, not every client header.
  trustProxy:
    rawTrustProxy === undefined || rawTrustProxy === "false"
      ? false
      : positiveInteger(rawTrustProxy, 1, "TRUST_PROXY"),
  rateLimitMax: positiveInteger(process.env.RATE_LIMIT_MAX, 30, "RATE_LIMIT_MAX"),
};
