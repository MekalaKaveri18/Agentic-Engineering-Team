import { JWTAuth, JWTError } from "../middleware";
import { createMockResponse } from "./helpers";

describe("JWTAuth", () => {
  it("issues access and refresh tokens and verifies both", () => {
    let now = 1_700_000_000_000;
    const auth = new JWTAuth({
      accessSecret: "access-secret",
      refreshSecret: "refresh-secret",
      issuer: "nth-ai",
      audience: "challenge-2",
      accessTtlSeconds: 60,
      refreshTtlSeconds: 600,
      now: () => now,
    });

    const tokens = auth.issueTokens({
      sub: "user-123",
      role: "builder",
    });

    const accessClaims = auth.verifyAccessToken(tokens.accessToken);
    const refreshClaims = auth.verifyRefreshToken(tokens.refreshToken);

    expect(accessClaims.sub).toBe("user-123");
    expect(accessClaims.role).toBe("builder");
    expect(refreshClaims.type).toBe("refresh");

    now += 5_000;

    const refreshed = auth.refreshTokens(tokens.refreshToken);
    const refreshedClaims = auth.verifyAccessToken(refreshed.accessToken);

    expect(refreshedClaims.sub).toBe("user-123");
    expect(refreshed.accessToken).not.toBe(tokens.accessToken);
  });

  it("rejects expired access tokens", () => {
    let now = 1_700_000_000_000;
    const auth = new JWTAuth({
      accessSecret: "access-secret",
      refreshSecret: "refresh-secret",
      accessTtlSeconds: 1,
      refreshTtlSeconds: 60,
      now: () => now,
    });

    const tokens = auth.issueTokens({ sub: "user-456" });

    now += 2_000;

    expect(() => auth.verifyAccessToken(tokens.accessToken)).toThrow(JWTError);
  });

  it("attaches verified access claims in middleware", () => {
    const auth = new JWTAuth({
      accessSecret: "access-secret",
      refreshSecret: "refresh-secret",
    });
    const tokens = auth.issueTokens({ sub: "user-789", role: "operator" });
    const middleware = auth.middleware();
    const request: {
      headers: { authorization: string };
      auth?: { sub: string; role?: string };
    } = {
      headers: {
        authorization: `Bearer ${tokens.accessToken}`,
      },
    };
    const responseState = createMockResponse();
    const next = jest.fn();

    middleware(request as never, responseState.response, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(request.auth).toBeDefined();
    expect(request.auth!.sub).toBe("user-789");
    expect(request.auth!.role).toBe("operator");
  });
});
