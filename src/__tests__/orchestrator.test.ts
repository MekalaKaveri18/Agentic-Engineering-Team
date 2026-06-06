import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { EngineeringOrchestrator } from "../orchestrator";

const writeJson = (filePath: string, data: unknown): void => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
};

describe("EngineeringOrchestrator", () => {
  it("writes manifest and reviewer-facing artifacts from a verified run", () => {
    const tempRoot = fs.mkdtempSync(
      path.join(os.tmpdir(), "agentic-engineering-team-")
    );

    try {
      const middlewareDir = path.join(tempRoot, "src", "middleware");
      fs.mkdirSync(middlewareDir, { recursive: true });
      fs.writeFileSync(
        path.join(middlewareDir, "rate-limiter.ts"),
        [
          "interface BucketState { tokens: number; }",
          "export class RateLimiter {",
          "  private readonly buckets = new Map<string, BucketState>();",
          "  remember(key: string, value: BucketState) {",
          "    this.buckets.set(key, value);",
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

      writeJson(path.join(tempRoot, "jest-results.json"), {
        numTotalTests: 2,
        numPassedTests: 2,
        numFailedTests: 0,
        startTime: 1000,
        testResults: [
          {
            name: path.join(tempRoot, "src", "__tests__", "feature.test.ts"),
            startTime: 1000,
            endTime: 1100,
            assertionResults: [
              {
                ancestorTitles: ["Feature"],
                title: "ships",
                status: "passed",
                duration: 10,
              },
              {
                ancestorTitles: ["Feature"],
                title: "verifies",
                status: "passed",
                duration: 12,
              },
            ],
          },
        ],
      });

      writeJson(path.join(tempRoot, "coverage", "coverage-summary.json"), {
        total: {
          lines: { pct: 80 },
          statements: { pct: 81 },
          functions: { pct: 82 },
          branches: { pct: 83 },
        },
      });

      const orchestrator = new EngineeringOrchestrator(tempRoot);
      const manifest = orchestrator.run();

      expect(manifest.modulesBuilt).toEqual([
        "RateLimiter",
        "RequestValidator",
        "JWTAuth",
      ]);
      expect(manifest.tests.total).toBe(2);
      expect(manifest.tests.coverage?.lines).toBe(80);
      expect(manifest.lineCount).toBeGreaterThan(0);
      expect(manifest.reviewFindings.map((finding) => finding.title)).toEqual(
        expect.arrayContaining([
          "Rate limiter storage is single-node only",
          "Refresh-token revocation is not persisted",
          "Validation DSL is intentionally narrower than full JSON Schema",
        ])
      );

      expect(
        fs.existsSync(path.join(tempRoot, "AGENT_LOG.md"))
      ).toBeTruthy();
      expect(
        fs.existsSync(path.join(tempRoot, "BUILD_MANIFEST.json"))
      ).toBeTruthy();
      expect(
        fs.existsSync(path.join(tempRoot, "artifacts", "review_report.md"))
      ).toBeTruthy();
      expect(
        fs.existsSync(path.join(tempRoot, "artifacts", "test_report.md"))
      ).toBeTruthy();
      expect(
        fs.existsSync(path.join(tempRoot, "artifacts", "pull_request.md"))
      ).toBeTruthy();
    } finally {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  });
});
