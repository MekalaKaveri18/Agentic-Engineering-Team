import * as fs from "fs";
import * as path from "path";
import { ReviewerAgent } from "./agents/reviewer";
import { WORKED_EXAMPLE_SPEC, WORKED_EXAMPLE_SPEC_TEXT } from "./spec";
import {
  AgentLogEntry,
  ArchitecturePlan,
  BuildManifest,
  CoverageSummary,
  ImplementationReport,
  ReviewReport,
  TestCaseResult,
  TestSummary,
} from "./types";

interface FileMetric {
  path: string;
  lineCount: number;
}

interface JestResultsFile {
  numTotalTests: number;
  numPassedTests: number;
  numFailedTests: number;
  startTime: number;
  testResults: Array<{
    name: string;
    endTime?: number;
    startTime?: number;
    assertionResults?: Array<{
      ancestorTitles: string[];
      title: string;
      status: "passed" | "failed";
      duration?: number | null;
    }>;
  }>;
}

interface CoverageSummaryFile {
  total: {
    lines: { pct: number };
    statements: { pct: number };
    functions: { pct: number };
    branches: { pct: number };
  };
}

export class EngineeringOrchestrator {
  private readonly repoRoot: string;
  private readonly artifactsDir: string;
  private readonly reviewerAgent: ReviewerAgent;

  constructor(repoRoot = process.cwd()) {
    this.repoRoot = repoRoot;
    this.artifactsDir = path.join(this.repoRoot, "artifacts");
    this.reviewerAgent = new ReviewerAgent(this.repoRoot);
  }

  run(): BuildManifest {
    const architecture = this.architectPhase();
    const implementation = this.implementationPhase(architecture);
    const reviewReport = this.reviewPhase(architecture);
    const testSummary = this.testingPhase();
    const manifest = this.shipPhase(
      architecture,
      implementation,
      reviewReport,
      testSummary
    );

    this.writeAgentLog(
      architecture,
      implementation,
      reviewReport,
      testSummary,
      manifest
    );

    return manifest;
  }

  private architectPhase(): ArchitecturePlan {
    return {
      systemName: WORKED_EXAMPLE_SPEC.name,
      mission: WORKED_EXAMPLE_SPEC.summary,
      workflow: [
        "Architect translates the spec into module boundaries and quality gates.",
        "Implementer ships one focused middleware package with explicit tradeoffs.",
        "Reviewer runs independent static analysis over the shipped files and flags operational risks before ship.",
        "Tester validates the feature through executable Jest suites and coverage output.",
      ],
      modules: [
        {
          name: "RateLimiter",
          purpose: "Protect routes with token-bucket throttling and transparent headers.",
          sourceFiles: ["src/middleware/rate-limiter.ts"],
          verification: [
            "Per-key isolation",
            "Token refill over time",
            "429 responses expose retry headers",
          ],
        },
        {
          name: "RequestValidator",
          purpose:
            "Validate request payloads with a small schema DSL, coercion, and custom rules.",
          sourceFiles: ["src/middleware/request-validator.ts"],
          verification: [
            "Coercion for strings, numbers, and booleans",
            "Unknown-field rejection",
            "Custom validator hooks",
          ],
        },
        {
          name: "JWTAuth",
          purpose:
            "Issue, verify, and refresh signed tokens while keeping access and refresh secrets separate.",
          sourceFiles: ["src/middleware/jwt-auth.ts"],
          verification: [
            "Access token verification",
            "Refresh token exchange",
            "Route middleware rejects missing or expired tokens",
          ],
        },
      ],
      deploymentNotes: [
        "This worked example keeps state in memory for the rate limiter to stay runnable in a review environment.",
        "JWT refresh tokens are stateless; revocation would require a persistent session store in production.",
        "The validation layer is intentionally focused on common primitives rather than full JSON Schema.",
      ],
    };
  }

  private implementationPhase(
    architecture: ArchitecturePlan
  ): ImplementationReport {
    const fileMetrics = this.getFileMetrics(
      architecture.modules.flatMap((modulePlan) => modulePlan.sourceFiles)
    );

    return {
      shippedFiles: fileMetrics.map((metric) => metric.path),
      lineCount: fileMetrics.reduce(
        (total, metric) => total + metric.lineCount,
        0
      ),
      designNotes: [
        "Kept the worked example dependency-light so the repo can run without network calls or registry installs.",
        "Split each middleware concern into its own module to make review and testing explicit.",
        "Kept the public API small enough for a reviewer to understand in one pass.",
      ],
    };
  }

  private reviewPhase(architecture: ArchitecturePlan): ReviewReport {
    return this.reviewerAgent.review(architecture);
  }

  private testingPhase(): TestSummary {
    const jestResultsPath = path.join(this.repoRoot, "jest-results.json");
    const coveragePath = path.join(
      this.repoRoot,
      "coverage",
      "coverage-summary.json"
    );

    if (!fs.existsSync(jestResultsPath)) {
      throw new Error(
        "Missing jest-results.json. Run `npm test` before generating artifacts."
      );
    }

    const jestResults = JSON.parse(
      fs.readFileSync(jestResultsPath, "utf8")
    ) as JestResultsFile;
    const cases: TestCaseResult[] = [];

    for (const suiteResult of jestResults.testResults) {
      const suiteName = path.basename(suiteResult.name);
      for (const assertion of suiteResult.assertionResults ?? []) {
        cases.push({
          suite: suiteName,
          name: [...assertion.ancestorTitles, assertion.title]
            .filter(Boolean)
            .join(" > "),
          status: assertion.status,
          durationMs: assertion.duration ?? undefined,
        });
      }
    }

    let coverage: CoverageSummary | undefined;

    if (fs.existsSync(coveragePath)) {
      const coverageSummary = JSON.parse(
        fs.readFileSync(coveragePath, "utf8")
      ) as CoverageSummaryFile;

      coverage = {
        lines: coverageSummary.total.lines.pct,
        statements: coverageSummary.total.statements.pct,
        functions: coverageSummary.total.functions.pct,
        branches: coverageSummary.total.branches.pct,
      };
    }

    const durationMs = jestResults.testResults.reduce((total, suiteResult) => {
      if (suiteResult.startTime && suiteResult.endTime) {
        return total + (suiteResult.endTime - suiteResult.startTime);
      }

      return total;
    }, 0);

    return {
      total: jestResults.numTotalTests,
      passed: jestResults.numPassedTests,
      failed: jestResults.numFailedTests,
      durationMs:
        durationMs > 0 ? durationMs : Math.max(0, Date.now() - jestResults.startTime),
      coverage,
      cases,
    };
  }

  private shipPhase(
    architecture: ArchitecturePlan,
    implementation: ImplementationReport,
    reviewReport: ReviewReport,
    testSummary: TestSummary
  ): BuildManifest {
    const unresolvedHighSeverityFindings = reviewReport.findings.filter(
      (finding) => finding.severity === "high" && finding.status !== "resolved"
    );

    if (testSummary.failed > 0 || unresolvedHighSeverityFindings.length > 0) {
      throw new Error(
        "Refusing to ship because tests failed or unresolved high-severity findings remain."
      );
    }

    fs.mkdirSync(this.artifactsDir, { recursive: true });

    const manifest: BuildManifest = {
      timestamp: new Date().toISOString(),
      mode: "local-deterministic",
      specName: architecture.systemName,
      modulesBuilt: architecture.modules.map((modulePlan) => modulePlan.name),
      filesShipped: implementation.shippedFiles,
      reviewFindings: reviewReport.findings,
      tests: testSummary,
      lineCount: implementation.lineCount,
    };

    fs.writeFileSync(
      path.join(this.repoRoot, "BUILD_MANIFEST.json"),
      `${JSON.stringify(manifest, null, 2)}\n`
    );
    fs.writeFileSync(
      path.join(this.repoRoot, "DEPLOYED_ARCHITECTURE.md"),
      this.renderArchitectureMarkdown(architecture, implementation)
    );
    fs.writeFileSync(
      path.join(this.artifactsDir, "review_report.md"),
      this.renderReviewMarkdown(reviewReport)
    );
    fs.writeFileSync(
      path.join(this.artifactsDir, "test_report.md"),
      this.renderTestMarkdown(testSummary)
    );
    fs.writeFileSync(
      path.join(this.artifactsDir, "pull_request.md"),
      this.renderPullRequestMarkdown(architecture, implementation, testSummary)
    );

    return manifest;
  }

  private writeAgentLog(
    architecture: ArchitecturePlan,
    implementation: ImplementationReport,
    reviewReport: ReviewReport,
    testSummary: TestSummary,
    manifest: BuildManifest
  ): void {
    const entries: AgentLogEntry[] = [
      {
        agent: "Architect",
        goal: "Turn the feature brief into module boundaries and quality gates.",
        highlights: [
          `Spec: ${WORKED_EXAMPLE_SPEC_TEXT.replace(/\n{2,}/g, "\n")}`,
          `Modules: ${architecture.modules.map((modulePlan) => modulePlan.name).join(", ")}`,
          ...architecture.workflow,
        ],
        handoff:
          "Implementation should stay dependency-light and ship explicit tradeoffs instead of pretending to be broader than it is.",
      },
      {
        agent: "Implementer",
        goal: "Ship the worked example package and keep the public surface reviewable.",
        highlights: [
          `Files shipped: ${implementation.shippedFiles.join(", ")}`,
          `Shipped line count: ${implementation.lineCount}`,
          ...implementation.designNotes,
        ],
        handoff:
          "Reviewer should analyze the shipped files independently and capture any known operational gaps.",
      },
      {
        agent: "Reviewer",
        goal: "Analyze the shipped files independently and prevent dishonest shipping criteria.",
        highlights: [
          reviewReport.summary,
          ...reviewReport.methodology,
          ...reviewReport.findings.map(
          (finding) =>
            `[${finding.severity.toUpperCase()}] ${finding.title}: ${finding.detail}`
          ),
        ],
        handoff:
          "Tester can ship once the executable suite passes and only accepted tradeoffs remain.",
      },
      {
        agent: "Tester",
        goal: "Validate the worked example with executable tests and collect coverage.",
        highlights: [
          `Tests passed: ${testSummary.passed}/${testSummary.total}`,
          `Failed tests: ${testSummary.failed}`,
          testSummary.coverage
            ? `Coverage: ${testSummary.coverage.lines}% lines, ${testSummary.coverage.functions}% functions`
            : "Coverage: not available",
        ],
        handoff:
          "Orchestrator can write final artifacts because the worked example cleared the quality gates.",
      },
      {
        agent: "Orchestrator",
        goal: "Persist the run into reviewer-friendly artifacts.",
        highlights: [
          `Build manifest written at ${manifest.timestamp}`,
          `Artifacts directory: ${path.relative(this.repoRoot, this.artifactsDir)}`,
          `Known tradeoffs accepted: ${reviewReport.findings.length}`,
        ],
      },
    ];

    const markdown = [
      "# Agentic Engineering Team Log",
      "",
      "This run is fully local and deterministic. It does not claim open-ended code generation; it claims a real engineering workflow for one worked example and verifies that workflow with executable tests.",
      "",
      ...entries.flatMap((entry) => [
        `## ${entry.agent}`,
        "",
        `**Goal:** ${entry.goal}`,
        "",
        ...entry.highlights.map((highlight) => `- ${highlight}`),
        ...(entry.handoff ? ["", `**Handoff:** ${entry.handoff}`] : []),
        "",
      ]),
    ].join("\n");

    fs.writeFileSync(path.join(this.repoRoot, "AGENT_LOG.md"), markdown);
  }

  private getFileMetrics(relativePaths: string[]): FileMetric[] {
    return relativePaths.map((relativePath) => {
      const absolutePath = path.join(this.repoRoot, relativePath);
      const lineCount = fs.readFileSync(absolutePath, "utf8").trim().split(/\r?\n/).length;

      return {
        path: relativePath,
        lineCount,
      };
    });
  }

  private renderArchitectureMarkdown(
    architecture: ArchitecturePlan,
    implementation: ImplementationReport
  ): string {
    return [
      `# ${architecture.systemName} Architecture`,
      "",
      architecture.mission,
      "",
      "## Workflow",
      "",
      ...architecture.workflow.map((step, index) => `${index + 1}. ${step}`),
      "",
      "## Modules",
      "",
      ...architecture.modules.flatMap((modulePlan) => [
        `### ${modulePlan.name}`,
        "",
        modulePlan.purpose,
        "",
        `Source files: ${modulePlan.sourceFiles.join(", ")}`,
        "",
        "Verification goals:",
        ...modulePlan.verification.map((goal) => `- ${goal}`),
        "",
      ]),
      "## Implementation Notes",
      "",
      ...implementation.designNotes.map((note) => `- ${note}`),
      "",
      `Total shipped middleware LOC: ${implementation.lineCount}`,
      "",
      "## Deployment Notes",
      "",
      ...architecture.deploymentNotes.map((note) => `- ${note}`),
      "",
    ].join("\n");
  }

  private renderReviewMarkdown(reviewReport: ReviewReport): string {
    return [
      "# Review Report",
      "",
      reviewReport.summary,
      "",
      "## Methodology",
      "",
      ...reviewReport.methodology.map((step) => `- ${step}`),
      "",
      "## Findings",
      "",
      ...reviewReport.findings.flatMap((finding) => [
        `## ${finding.title}`,
        "",
        `Severity: ${finding.severity}`,
        "",
        `Status: ${finding.status}`,
        "",
        ...(finding.file ? [`File: ${finding.file}`, ""] : []),
        finding.detail,
        "",
        ...(finding.evidence && finding.evidence.length > 0
          ? ["Evidence:", ...finding.evidence.map((line) => `- ${line}`), ""]
          : []),
        `Recommendation: ${finding.recommendation}`,
        "",
      ]),
    ].join("\n");
  }

  private renderTestMarkdown(testSummary: TestSummary): string {
    return [
      "# Test Report",
      "",
      `Total tests: ${testSummary.total}`,
      `Passed: ${testSummary.passed}`,
      `Failed: ${testSummary.failed}`,
      `Duration: ${testSummary.durationMs}ms`,
      ...(testSummary.coverage
        ? [
            `Coverage (lines): ${testSummary.coverage.lines}%`,
            `Coverage (statements): ${testSummary.coverage.statements}%`,
            `Coverage (functions): ${testSummary.coverage.functions}%`,
            `Coverage (branches): ${testSummary.coverage.branches}%`,
          ]
        : []),
      "",
      "## Assertions",
      "",
      ...testSummary.cases.map(
        (testCase) =>
          `- [${testCase.status.toUpperCase()}] ${testCase.suite}: ${testCase.name}`
      ),
      "",
    ].join("\n");
  }

  private renderPullRequestMarkdown(
    architecture: ArchitecturePlan,
    implementation: ImplementationReport,
    testSummary: TestSummary
  ): string {
    return [
      "# Pull Request Summary",
      "",
      `Implements the worked example for ${architecture.systemName} with three middleware modules and executable verification.`,
      "",
      "## What shipped",
      "",
      ...architecture.modules.map(
        (modulePlan) => `- ${modulePlan.name}: ${modulePlan.purpose}`
      ),
      "",
      "## Verification",
      "",
      `- ${testSummary.passed}/${testSummary.total} tests passing`,
      ...(testSummary.coverage
        ? [`- ${testSummary.coverage.lines}% line coverage`]
        : []),
      `- ${implementation.lineCount} lines of middleware code shipped`,
      "",
      "## Known tradeoffs",
      "",
      "- In-memory rate limiting is acceptable for the worked example but not for multi-node production.",
      "- Refresh-token revocation would need persistent storage.",
      "- The schema engine is focused, not a full JSON Schema implementation.",
      "",
    ].join("\n");
  }
}
