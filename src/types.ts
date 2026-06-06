export type AgentName =
  | "Architect"
  | "Implementer"
  | "Reviewer"
  | "Tester"
  | "Orchestrator";

export interface FeatureRequirement {
  title: string;
  details: string[];
}

export interface FeatureSpec {
  name: string;
  summary: string;
  modules: FeatureRequirement[];
  nonFunctionalRequirements: string[];
  acceptanceCriteria: string[];
}

export interface ModulePlan {
  name: string;
  purpose: string;
  sourceFiles: string[];
  verification: string[];
}

export interface ArchitecturePlan {
  systemName: string;
  mission: string;
  workflow: string[];
  modules: ModulePlan[];
  deploymentNotes: string[];
}

export interface ImplementationReport {
  shippedFiles: string[];
  lineCount: number;
  designNotes: string[];
}

export type FindingSeverity = "low" | "medium" | "high";
export type FindingStatus = "accepted" | "resolved" | "open";

export interface ReviewFinding {
  severity: FindingSeverity;
  title: string;
  detail: string;
  recommendation: string;
  status: FindingStatus;
  file?: string;
  evidence?: string[];
}

export interface ReviewReport {
  reviewer: "static-analysis-reviewer";
  summary: string;
  methodology: string[];
  findings: ReviewFinding[];
}

export interface CoverageSummary {
  lines: number;
  statements: number;
  functions: number;
  branches: number;
}

export interface TestCaseResult {
  suite: string;
  name: string;
  status: "passed" | "failed";
  durationMs?: number;
}

export interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  durationMs: number;
  coverage?: CoverageSummary;
  cases: TestCaseResult[];
}

export interface AgentLogEntry {
  agent: AgentName;
  goal: string;
  highlights: string[];
  handoff?: string;
}

export interface BuildManifest {
  timestamp: string;
  mode: "local-deterministic";
  specName: string;
  modulesBuilt: string[];
  filesShipped: string[];
  reviewFindings: ReviewFinding[];
  tests: TestSummary;
  lineCount: number;
}
