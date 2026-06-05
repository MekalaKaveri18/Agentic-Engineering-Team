import { EngineeringOrchestrator } from "./orchestrator";

const orchestrator = new EngineeringOrchestrator();
const manifest = orchestrator.run();

console.log("Agentic engineering run completed.");
console.log(`Modules: ${manifest.modulesBuilt.join(", ")}`);
console.log(`Tests: ${manifest.tests.passed}/${manifest.tests.total} passing`);
console.log(`Artifacts: AGENT_LOG.md, BUILD_MANIFEST.json, DEPLOYED_ARCHITECTURE.md, artifacts/`);
