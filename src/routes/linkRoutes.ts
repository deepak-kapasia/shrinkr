import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  createRedirectHandler,
  createShortenHandler,
  createStatsHandler,
} from "../controllers/linkController";
import { findLinkByCode, incrementClicks, insertLink } from "../db/queries";
import { config } from "../config";

const router = Router();

const shortenRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many shorten requests. Please try again later." },
});

router.post(
  "/api/shorten",
  shortenRateLimit,
  createShortenHandler({ repository: { insertLink }, baseUrl: config.baseUrl }),
);

router.get("/api/stats/:code", createStatsHandler(findLinkByCode));

// The UPDATE query increments the count and returns the destination atomically.
router.get("/:code", createRedirectHandler(incrementClicks));

export default router;
