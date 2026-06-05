import type { NextFunction, Request, Response } from "express";

export interface RateLimitConfig {
  capacity: number;
  windowMs: number;
  keyGenerator: (req: Request) => string;
  now: () => number;
}

interface BucketState {
  tokens: number;
  lastRefillAt: number;
}

export interface RateLimitDecision {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterMs: number;
  resetAt: number;
}

const defaultKeyGenerator = (req: Request): string =>
  req.ip || req.socket.remoteAddress || "unknown";

export class RateLimiter {
  private readonly buckets = new Map<string, BucketState>();
  private readonly config: RateLimitConfig;

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = {
      capacity: config.capacity ?? 60,
      windowMs: config.windowMs ?? 60_000,
      keyGenerator: config.keyGenerator ?? defaultKeyGenerator,
      now: config.now ?? (() => Date.now()),
    };

    if (this.config.capacity <= 0) {
      throw new Error("RateLimiter capacity must be positive.");
    }

    if (this.config.windowMs <= 0) {
      throw new Error("RateLimiter windowMs must be positive.");
    }
  }

  consume(key: string, cost = 1, at = this.config.now()): RateLimitDecision {
    if (cost <= 0) {
      throw new Error("Token cost must be positive.");
    }

    const refillRate = this.config.capacity / this.config.windowMs;
    const current =
      this.buckets.get(key) ?? {
        tokens: this.config.capacity,
        lastRefillAt: at,
      };
    const elapsed = Math.max(0, at - current.lastRefillAt);
    const availableTokens = Math.min(
      this.config.capacity,
      current.tokens + elapsed * refillRate
    );
    const updated: BucketState = {
      tokens: availableTokens,
      lastRefillAt: at,
    };

    if (updated.tokens < cost) {
      const missingTokens = cost - updated.tokens;
      const retryAfterMs = Math.ceil(missingTokens / refillRate);

      this.buckets.set(key, updated);

      return {
        allowed: false,
        limit: this.config.capacity,
        remaining: 0,
        retryAfterMs,
        resetAt: at + retryAfterMs,
      };
    }

    updated.tokens -= cost;
    this.buckets.set(key, updated);

    return {
      allowed: true,
      limit: this.config.capacity,
      remaining: Math.floor(updated.tokens),
      retryAfterMs: 0,
      resetAt: at,
    };
  }

  middleware() {
    return (req: Request, res: Response, next: NextFunction): void => {
      const decision = this.consume(this.config.keyGenerator(req));

      res.setHeader("X-RateLimit-Limit", String(decision.limit));
      res.setHeader("X-RateLimit-Remaining", String(decision.remaining));
      res.setHeader(
        "X-RateLimit-Reset",
        String(Math.ceil(decision.resetAt / 1000))
      );

      if (!decision.allowed) {
        res.setHeader(
          "Retry-After",
          String(Math.max(1, Math.ceil(decision.retryAfterMs / 1000)))
        );
        res.status(429).json({
          error: "Rate limit exceeded",
          retryAfterMs: decision.retryAfterMs,
        });
        return;
      }

      next();
    };
  }

  clear(): void {
    this.buckets.clear();
  }
}
