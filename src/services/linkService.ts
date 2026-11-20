import { LinkRow, ShortenRequestBody } from "../types";
import {
  generateCode,
  isUniqueViolation,
  isValidAlias,
  isValidHttpUrl,
} from "./urlService";

export interface LinkRepository {
  insertLink(code: string, longUrl: string): Promise<LinkRow>;
}

export class InvalidUrlError extends Error {}
export class InvalidAliasError extends Error {}
export class DuplicateAliasError extends Error {}

interface CreateShortLinkOptions {
  generateCode?: () => string;
  maxCollisionRetries?: number;
}

/** Validate input, insert a link, and retry random-code collisions. */
export async function createShortLink(
  input: ShortenRequestBody,
  repository: LinkRepository,
  options: CreateShortLinkOptions = {},
): Promise<{ code: string; longUrl: string }> {
  if (!isValidHttpUrl(input.url)) {
    throw new InvalidUrlError("Only valid http and https URLs are allowed.");
  }

  const hasAlias = input.alias !== undefined;
  if (hasAlias && !isValidAlias(input.alias)) {
    throw new InvalidAliasError(
      "Alias must be 1-32 characters and contain only letters, numbers, hyphens, or underscores.",
    );
  }

  const makeCode = options.generateCode ?? generateCode;
  const maxCollisionRetries = options.maxCollisionRetries ?? 5;
  const requestedAlias = hasAlias ? (input.alias as string) : undefined;
  let code = requestedAlias ?? makeCode();

  for (let attempt = 0; attempt <= maxCollisionRetries; attempt += 1) {
    try {
      await repository.insertLink(code, input.url);
      return { code, longUrl: input.url };
    } catch (error) {
      // A custom alias should fail immediately; a random code can be retried.
      if (hasAlias && isUniqueViolation(error)) {
        throw new DuplicateAliasError("That alias is already in use.");
      }

      if (!hasAlias && isUniqueViolation(error) && attempt < maxCollisionRetries) {
        code = makeCode();
        continue;
      }

      throw error;
    }
  }

  throw new Error("Could not create a unique short code.");
}
