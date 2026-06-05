import { createHmac, randomUUID, timingSafeEqual } from "crypto";
import type { NextFunction, Request, Response } from "express";

type TokenType = "access" | "refresh";

interface JwtHeader {
  alg: "HS256";
  typ: "JWT";
}

export interface SessionClaims {
  sub: string;
  role?: string;
  [key: string]: unknown;
}

export interface VerifiedToken extends SessionClaims {
  type: TokenType;
  iat: number;
  exp: number;
  iss?: string;
  aud?: string;
  jti: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessExpiresAt: number;
  refreshExpiresAt: number;
}

export interface JWTAuthConfig {
  accessSecret: string;
  refreshSecret: string;
  issuer?: string;
  audience?: string;
  accessTtlSeconds?: number;
  refreshTtlSeconds?: number;
  now?: () => number;
}

export class JWTError extends Error {}

const base64UrlEncode = (value: Buffer | string): string =>
  Buffer.from(value)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

const base64UrlDecode = (value: string): string => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return Buffer.from(normalized + padding, "base64").toString("utf8");
};

const sign = (value: string, secret: string): string =>
  base64UrlEncode(createHmac("sha256", secret).update(value).digest());

const parseJson = <T>(value: string): T => JSON.parse(base64UrlDecode(value)) as T;

const stripReservedClaims = (claims: VerifiedToken): SessionClaims => {
  const { type, iat, exp, iss, aud, jti, ...rest } = claims;
  return rest;
};

export class JWTAuth {
  private readonly config: Required<JWTAuthConfig>;

  constructor(config: JWTAuthConfig) {
    if (!config.accessSecret || !config.refreshSecret) {
      throw new Error("JWTAuth requires both access and refresh secrets.");
    }

    this.config = {
      accessSecret: config.accessSecret,
      refreshSecret: config.refreshSecret,
      issuer: config.issuer ?? "nth-ai-agent-team",
      audience: config.audience ?? "express-middleware-suite",
      accessTtlSeconds: config.accessTtlSeconds ?? 900,
      refreshTtlSeconds: config.refreshTtlSeconds ?? 60 * 60 * 24 * 7,
      now: config.now ?? (() => Date.now()),
    };
  }

  issueTokens(claims: SessionClaims): TokenPair {
    const access = this.signToken(
      claims,
      "access",
      this.config.accessSecret,
      this.config.accessTtlSeconds
    );
    const refresh = this.signToken(
      claims,
      "refresh",
      this.config.refreshSecret,
      this.config.refreshTtlSeconds
    );
    const issuedAtSeconds = Math.floor(this.config.now() / 1000);

    return {
      accessToken: access,
      refreshToken: refresh,
      accessExpiresAt: (issuedAtSeconds + this.config.accessTtlSeconds) * 1000,
      refreshExpiresAt:
        (issuedAtSeconds + this.config.refreshTtlSeconds) * 1000,
    };
  }

  verifyAccessToken(token: string): VerifiedToken {
    return this.verifyToken(token, this.config.accessSecret, "access");
  }

  verifyRefreshToken(token: string): VerifiedToken {
    return this.verifyToken(token, this.config.refreshSecret, "refresh");
  }

  refreshTokens(refreshToken: string): TokenPair {
    const claims = this.verifyRefreshToken(refreshToken);
    return this.issueTokens(stripReservedClaims(claims));
  }

  middleware() {
    return (
      req: Request & { auth?: VerifiedToken },
      res: Response,
      next: NextFunction
    ): void => {
      const header = req.headers.authorization;

      if (!header || !header.startsWith("Bearer ")) {
        res.status(401).json({ error: "Missing bearer token." });
        return;
      }

      try {
        req.auth = this.verifyAccessToken(header.slice(7));
        next();
      } catch (error) {
        res.status(401).json({
          error:
            error instanceof Error ? error.message : "Invalid or expired token.",
        });
      }
    };
  }

  private signToken(
    claims: SessionClaims,
    type: TokenType,
    secret: string,
    ttlSeconds: number
  ): string {
    const issuedAtSeconds = Math.floor(this.config.now() / 1000);
    const payload: VerifiedToken = {
      ...claims,
      type,
      iat: issuedAtSeconds,
      exp: issuedAtSeconds + ttlSeconds,
      iss: this.config.issuer,
      aud: this.config.audience,
      jti: randomUUID(),
    };
    const header: JwtHeader = {
      alg: "HS256",
      typ: "JWT",
    };
    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    const signature = sign(`${encodedHeader}.${encodedPayload}`, secret);

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  private verifyToken(
    token: string,
    secret: string,
    expectedType: TokenType
  ): VerifiedToken {
    const segments = token.split(".");

    if (segments.length !== 3) {
      throw new JWTError("Malformed token.");
    }

    const [encodedHeader, encodedPayload, providedSignature] = segments;
    const signedValue = `${encodedHeader}.${encodedPayload}`;
    const expectedSignature = sign(signedValue, secret);

    if (
      providedSignature.length !== expectedSignature.length ||
      !timingSafeEqual(
        Buffer.from(providedSignature),
        Buffer.from(expectedSignature)
      )
    ) {
      throw new JWTError("Invalid signature.");
    }

    const header = parseJson<JwtHeader>(encodedHeader);
    const payload = parseJson<VerifiedToken>(encodedPayload);

    if (header.alg !== "HS256" || header.typ !== "JWT") {
      throw new JWTError("Unsupported token header.");
    }

    if (payload.type !== expectedType) {
      throw new JWTError(`Expected a ${expectedType} token.`);
    }

    const nowSeconds = Math.floor(this.config.now() / 1000);

    if (payload.exp <= nowSeconds) {
      throw new JWTError("Token expired.");
    }

    if (payload.iss !== this.config.issuer) {
      throw new JWTError("Unexpected issuer.");
    }

    if (payload.aud !== this.config.audience) {
      throw new JWTError("Unexpected audience.");
    }

    return payload;
  }
}
