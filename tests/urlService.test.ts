import { describe, expect, it } from "vitest";
import { generateCode, isValidHttpUrl } from "../src/services/urlService";

describe("generateCode", () => {
  it("creates a six-character base62 code", () => {
    const code = generateCode();

    expect(code).toHaveLength(6);
    expect(code).toMatch(/^[a-zA-Z0-9]+$/);
  });
});

describe("isValidHttpUrl", () => {
  it("accepts http and https URLs", () => {
    expect(isValidHttpUrl("http://example.com/path")).toBe(true);
    expect(isValidHttpUrl("https://example.com/path")).toBe(true);
  });

  it("rejects other protocols and malformed values", () => {
    expect(isValidHttpUrl("ftp://example.com/file")).toBe(false);
    expect(isValidHttpUrl("not a URL")).toBe(false);
  });
});
