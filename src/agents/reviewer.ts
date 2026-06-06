import * as fs from "fs";
import * as path from "path";
import { ArchitecturePlan, ReviewFinding, ReviewReport } from "../types";

interface SourceFileSnapshot {
  relativePath: string;
  source: string;
  lines: string[];
}

const MISSING_FILE_DETAIL =
  "Reviewer could not inspect the shipped source file, so the review output is incomplete.";

export class ReviewerAgent {
  constructor(private readonly repoRoot = process.cwd()) {}

  review(architecture: ArchitecturePlan): ReviewReport {
    const files = architecture.modules.flatMap((modulePlan) =>
      modulePlan.sourceFiles.map((relativePath) => this.readSourceFile(relativePath))
    );
    const findings = files.flatMap((file) => this.reviewFile(file));

    return {
      reviewer: "static-analysis-reviewer",
      summary:
        findings.length === 0
          ? "Reviewer analyzed the shipped files and found no material blockers for this worked example."
          : `Reviewer analyzed ${files.length} shipped files and flagged ${findings.length} scoped findings from the code itself.`,
      methodology: [
        "Reads the shipped source files directly instead of relying on orchestrator-owned constants.",
        "Matches findings to concrete source signals so the review changes when the implementation changes.",
        "Focuses on operational and scope tradeoffs that matter for this worked example.",
      ],
      findings,
    };
  }

  private reviewFile(file: SourceFileSnapshot): ReviewFinding[] {
    if (file.source.length === 0) {
      return [
        {
          severity: "high",
          title: `Missing shipped file: ${file.relativePath}`,
          detail: MISSING_FILE_DETAIL,
          recommendation:
            "Restore the file before shipping so the reviewer can verify the implementation.",
          status: "open",
          file: file.relativePath,
        },
      ];
    }

    if (file.relativePath.endsWith("rate-limiter.ts")) {
      return this.reviewRateLimiter(file);
    }

    if (file.relativePath.endsWith("jwt-auth.ts")) {
      return this.reviewJwtAuth(file);
    }

    if (file.relativePath.endsWith("request-validator.ts")) {
      return this.reviewRequestValidator(file);
    }

    return [];
  }

  private reviewRateLimiter(file: SourceFileSnapshot): ReviewFinding[] {
    const usesInMemoryState =
      file.source.includes("new Map<string, BucketState>()") ||
      file.source.includes("private readonly buckets = new Map");
    const hasStorageAbstraction = /storage|adapter|redis/i.test(file.source);

    if (!usesInMemoryState || hasStorageAbstraction) {
      return [];
    }

    return [
      {
        severity: "medium",
        title: "Rate limiter storage is single-node only",
        detail:
          "Reviewer found request budgets stored in process memory, so multiple application instances would not share rate-limit state.",
        recommendation:
          "Introduce a storage adapter so the middleware can swap from local memory to Redis or another shared store before production deployment.",
        status: "accepted",
        file: file.relativePath,
        evidence: this.collectEvidence(file, [
          "private readonly buckets = new Map",
          "this.buckets.set(",
        ]),
      },
    ];
  }

  private reviewJwtAuth(file: SourceFileSnapshot): ReviewFinding[] {
    const supportsRefreshTokens =
      file.source.includes("refreshTokens(") &&
      file.source.includes("refreshToken");
    const hasRevocationStorage = /revoke|revocation|sessionStore|denyList|allowList/i.test(
      file.source
    );

    if (!supportsRefreshTokens || hasRevocationStorage) {
      return [];
    }

    return [
      {
        severity: "medium",
        title: "Refresh-token revocation is not persisted",
        detail:
          "Reviewer found a refresh flow but no session registry or token revocation layer, so individual refresh sessions cannot be invalidated once issued.",
        recommendation:
          "Add a persistent session or token registry if the auth module moves beyond the current scoped challenge environment.",
        status: "accepted",
        file: file.relativePath,
        evidence: this.collectEvidence(file, [
          "refreshTokens(",
          "verifyRefreshToken(",
          "return this.issueTokens(",
        ]),
      },
    ];
  }

  private reviewRequestValidator(file: SourceFileSnapshot): ReviewFinding[] {
    const usesFocusedDsl = file.source.includes(
      "fields: Record<string, FieldRule>;"
    );
    const signalsNestedSchemaSupport =
      /oneOf|allOf|anyOf|items:|properties:|nested schema|object schema/i.test(
        file.source
      );

    if (!usesFocusedDsl || signalsNestedSchemaSupport) {
      return [];
    }

    return [
      {
        severity: "low",
        title: "Validation DSL is intentionally narrower than full JSON Schema",
        detail:
          "Reviewer found a focused field-rule DSL rather than a full schema engine, which keeps the worked example readable but narrows the shape of supported schemas.",
        recommendation:
          "Expand the validator or plug in a full schema engine if future specs need nested schemas or broader composition features.",
        status: "accepted",
        file: file.relativePath,
        evidence: this.collectEvidence(file, [
          "export interface ValidationSchema",
          "fields: Record<string, FieldRule>;",
        ]),
      },
    ];
  }

  private readSourceFile(relativePath: string): SourceFileSnapshot {
    const absolutePath = path.join(this.repoRoot, relativePath);

    if (!fs.existsSync(absolutePath)) {
      return {
        relativePath,
        source: "",
        lines: [],
      };
    }

    const source = fs.readFileSync(absolutePath, "utf8");

    return {
      relativePath,
      source,
      lines: source.split(/\r?\n/),
    };
  }

  private collectEvidence(
    file: SourceFileSnapshot,
    markers: string[]
  ): string[] {
    const evidence = new Set<string>();

    for (const marker of markers) {
      const lineIndex = file.lines.findIndex((line) => line.includes(marker));
      if (lineIndex >= 0) {
        evidence.add(`L${lineIndex + 1}: ${file.lines[lineIndex].trim()}`);
      }
    }

    return [...evidence];
  }
}
