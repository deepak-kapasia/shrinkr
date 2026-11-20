import { NextFunction, Request, Response } from "express";
import {
  createShortLink,
  DuplicateAliasError,
  InvalidAliasError,
  InvalidUrlError,
  LinkRepository,
} from "../services/linkService";
import { generateCode } from "../services/urlService";
import { ShortenRequestBody } from "../types";

interface ControllerDependencies {
  repository: LinkRepository;
  baseUrl: string;
  makeCode?: () => string;
}

export function createShortenHandler({
  repository,
  baseUrl,
  makeCode = generateCode,
}: ControllerDependencies) {
  return async function shortenHandler(
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result = await createShortLink(
        request.body as ShortenRequestBody,
        repository,
        { generateCode: makeCode },
      );

      response.status(201).json({
        shortUrl: `${baseUrl}/${encodeURIComponent(result.code)}`,
        code: result.code,
      });
    } catch (error) {
      if (error instanceof InvalidUrlError || error instanceof InvalidAliasError) {
        response.status(400).json({ error: error.message });
        return;
      }

      if (error instanceof DuplicateAliasError) {
        response.status(409).json({ error: error.message });
        return;
      }

      next(error);
    }
  };
}

export function createRedirectHandler(
  incrementLink: (code: string) => Promise<{ long_url: string } | null>,
) {
  return async function redirectHandler(
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const link = await incrementLink(String(request.params.code));

      if (!link) {
        response.status(404).json({ error: "Short link not found." });
        return;
      }

      response.redirect(302, link.long_url);
    } catch (error) {
      next(error);
    }
  };
}

export function createStatsHandler(
  findLink: (code: string) => Promise<{
    long_url: string;
    clicks: number;
    created_at: Date;
  } | null>,
) {
  return async function statsHandler(
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const link = await findLink(String(request.params.code));

      if (!link) {
        response.status(404).json({ error: "Short link not found." });
        return;
      }

      response.json({
        longUrl: link.long_url,
        clicks: link.clicks,
        createdAt: link.created_at,
      });
    } catch (error) {
      next(error);
    }
  };
}
