import type { NextFunction, Request, Response } from "express";

type RateLimiterOptions = {
  keyGenerator: (req: Request) => string | null;
  max: number;
  message: string;
  name: string;
  windowMs: number;
};

const requestBuckets = new Map<string, number[]>();

export function getClientIp(req: Request) {
  return (req.ip || req.socket.remoteAddress || "unknown").trim();
}

export function normalizeRateLimitValue(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function createRateLimiter(options: RateLimiterOptions) {
  return (req: Request, res: Response, next: NextFunction) => {
    const keySuffix = options.keyGenerator(req);
    if (!keySuffix) {
      next();
      return;
    }

    const now = Date.now();
    const windowStart = now - options.windowMs;
    const bucketKey = `${options.name}:${keySuffix}`;
    const existingHits = requestBuckets.get(bucketKey) || [];
    const recentHits = existingHits.filter((timestamp) => timestamp > windowStart);

    if (recentHits.length >= options.max) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((recentHits[0] + options.windowMs - now) / 1000),
      );
      res.setHeader("Retry-After", String(retryAfterSeconds));
      res.status(429).json({ message: options.message });
      return;
    }

    recentHits.push(now);
    requestBuckets.set(bucketKey, recentHits);
    next();
  };
}
