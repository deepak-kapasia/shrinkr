const BASE62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** Create a random code using only URL-friendly base62 characters. */
export function generateCode(length = 6): string {
  let code = "";

  for (let index = 0; index < length; index += 1) {
    const randomIndex = Math.floor(Math.random() * BASE62.length);
    code += BASE62[randomIndex];
  }

  return code;
}

/** Accept only absolute HTTP and HTTPS URLs. */
export function isValidHttpUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.trim() === "") {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/** Keep aliases safe to place in one URL path segment. */
export function isValidAlias(value: unknown): value is string {
  return typeof value === "string" && /^[a-zA-Z0-9_-]{1,32}$/.test(value);
}

export function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  );
}
