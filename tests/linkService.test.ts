import { describe, expect, it, vi } from "vitest";
import {
  createShortLink,
  DuplicateAliasError,
} from "../src/services/linkService";

describe("createShortLink", () => {
  it("returns a conflict when a custom alias already exists", async () => {
    const insertLink = vi.fn().mockRejectedValue({ code: "23505" });

    await expect(
      createShortLink(
        { url: "https://example.com/long-link", alias: "my-link" },
        { insertLink },
      ),
    ).rejects.toBeInstanceOf(DuplicateAliasError);

    expect(insertLink).toHaveBeenCalledWith("my-link", "https://example.com/long-link");
  });

  it("retries when a generated code collides", async () => {
    const insertLink = vi
      .fn()
      .mockRejectedValueOnce({ code: "23505" })
      .mockResolvedValueOnce({});
    const makeCode = vi.fn().mockReturnValueOnce("aaaaaa").mockReturnValueOnce("bbbbbb");

    const result = await createShortLink(
      { url: "https://example.com" },
      { insertLink },
      { generateCode: makeCode },
    );

    expect(result.code).toBe("bbbbbb");
    expect(insertLink).toHaveBeenLastCalledWith("bbbbbb", "https://example.com");
  });
});
