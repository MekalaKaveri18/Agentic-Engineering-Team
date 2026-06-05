import { RateLimiter } from "../middleware";
import { createMockResponse } from "./helpers";

describe("RateLimiter", () => {
  it("uses a token bucket per key and refills over time", () => {
    let now = 0;
    const limiter = new RateLimiter({
      capacity: 2,
      windowMs: 1000,
      now: () => now,
    });

    const first = limiter.consume("ip-1");
    const second = limiter.consume("ip-1");
    const blocked = limiter.consume("ip-1");

    expect(first.allowed).toBe(true);
    expect(first.remaining).toBe(1);
    expect(second.allowed).toBe(true);
    expect(second.remaining).toBe(0);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterMs).toBeGreaterThan(0);

    now += 500;

    const afterRefill = limiter.consume("ip-1");
    const otherIp = limiter.consume("ip-2");

    expect(afterRefill.allowed).toBe(true);
    expect(otherIp.allowed).toBe(true);
    expect(otherIp.remaining).toBe(1);
  });

  it("returns 429 responses with operational headers when a client is throttled", () => {
    const limiter = new RateLimiter({
      capacity: 1,
      windowMs: 60_000,
      now: () => 0,
    });
    const middleware = limiter.middleware();
    const request = {
      ip: "127.0.0.1",
      socket: { remoteAddress: "127.0.0.1" },
    } as never;
    const next = jest.fn();

    middleware(request, createMockResponse().response, next);

    const throttled = createMockResponse();
    middleware(request, throttled.response, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(throttled.getStatus()).toBe(429);
    expect(throttled.headers.get("X-RateLimit-Limit")).toBe("1");
    expect(throttled.headers.get("X-RateLimit-Remaining")).toBe("0");
    expect(throttled.headers.get("Retry-After")).toBe("60");
    expect(throttled.getBody()).toEqual({
      error: "Rate limit exceeded",
      retryAfterMs: 60000,
    });
  });
});
