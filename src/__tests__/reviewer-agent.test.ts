import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { ReviewerAgent } from "../agents/reviewer";
import { ArchitecturePlan } from "../types";

describe("ReviewerAgent", () => {
  it("produces findings from shipped source code instead of orchestrator constants", () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "reviewer-agent-"));

    try {
      const middlewareDir = path.join(tempRoot, "src", "middleware");
      fs.mkdirSync(middlewareDir, { recursive: true });
      fs.writeFileSync(
        path.join(middlewareDir, "rate-limiter.ts"),
        [
          "interface BucketState { tokens: number; }",
          "export class RateLimiter {",
          "  private readonly buckets = new Map<string, BucketState>();",
          "  set(key: string, value: BucketState) {",
          "    this.buckets.set(key, value);",
          "  }",
          "}",
        ].join("\n")
      );
      fs.writeFileSync(
        path.join(middlewareDir, "jwt-auth.ts"),
        [
          "export class JWTAuth {",
          "  verifyRefreshToken(token: string) { return token; }",
          "  issueTokens() { return true; }",
          "  refreshTokens(refreshToken: string) {",
          "    this.verifyRefreshToken(refreshToken);",
          "    return this.issueTokens();",
          "  }",
          "}",
        ].join("\n")
      );
      fs.writeFileSync(
        path.join(middlewareDir, "request-validator.ts"),
        [
          "interface FieldRule { type: 'string'; }",
          "export interface ValidationSchema {",
          "  fields: Record<string, FieldRule>;",
          "}",
        ].join("\n")
      );

      const architecture: ArchitecturePlan = {
        systemName: "Express Middleware Suite",
        mission: "Test review analysis",
        workflow: [],
        deploymentNotes: [],
        modules: [
          {
            name: "RateLimiter",
            purpose: "test",
            sourceFiles: ["src/middleware/rate-limiter.ts"],
            verification: [],
          },
          {
            name: "RequestValidator",
            purpose: "test",
            sourceFiles: ["src/middleware/request-validator.ts"],
            verification: [],
          },
          {
            name: "JWTAuth",
            purpose: "test",
            sourceFiles: ["src/middleware/jwt-auth.ts"],
            verification: [],
          },
        ],
      };

      const report = new ReviewerAgent(tempRoot).review(architecture);
      const titles = report.findings.map((finding) => finding.title);

      expect(report.reviewer).toBe("static-analysis-reviewer");
      expect(report.methodology).toEqual(
        expect.arrayContaining([
          expect.stringContaining("Reads the shipped source files directly"),
        ])
      );
      expect(titles).toEqual(
        expect.arrayContaining([
          "Rate limiter storage is single-node only",
          "Refresh-token revocation is not persisted",
          "Validation DSL is intentionally narrower than full JSON Schema",
        ])
      );
    } finally {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  });
});
