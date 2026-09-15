# PI Autonomy — Rolling Build Roadmap

## Operating rule
Krishna advances the next safe engineering objective automatically. Each cycle follows: inspect → plan → build → test → verify → record → select next objective. Human approval is required only for credentials, protected production environments, paid activation, legal/financial commitments, or irreversible production actions.

## Tomorrow — Live Intelligence Foundation
1. Durable state adapter boundary (no false claim of persistence until a live store is connected).
2. Model-provider adapter contract and health checks.
3. Specialist delegation contract: Krishna → specialist → result → verifier.
4. Mission-level execution budget and capability policy integration.
5. End-to-end local test covering delegation, execution, verification, retry and dead-letter.

## Following day — Owner-to-Runtime Bridge
1. Owner objective ingestion endpoint/interface.
2. Mission submission bridge into the runtime.
3. Structured outcome API for the owner console.
4. Evidence and truth-state rendering contract.
5. Failure/recovery reporting and safe continuation.
6. End-to-end bridge test.

## Following day — Real Tooling
1. Tool registry with explicit capabilities.
2. Capability-aware execution enforcement.
3. Safe tool adapters with bounded inputs/timeouts.
4. Tool result evidence normalization.
5. Independent verification for externally sourced results.

## Following day — Real Intelligence
1. Connect an approved model provider through environment configuration.
2. Route tasks by specialist and cost/latency policy.
3. Add model-call limits and failure recovery.
4. Test model output against truth/evidence rules.
5. Never report model-generated claims as verified without evidence.

## Following day — Production Readiness
1. Durable production state.
2. Observability and audit trail.
3. Security/capability review.
4. Full end-to-end test.
5. Production environment gate.
6. Deployment verification.

## Completion standard
A milestone is complete only when code exists, automated tests pass, and the runtime behavior is verified. Scheduled GitHub execution may continue independently, but ChatGPT itself does not remain connected after a response.