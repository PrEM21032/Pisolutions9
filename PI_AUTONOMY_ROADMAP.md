# PI Autonomy — Rolling Build Roadmap

## North Star
PI is an objective-centric, capability-general human capability system. Give PI the objective, not the script. Krishna determines required capabilities, assembles bounded AI/human/tool resources, coordinates execution, verifies results, recovers from failure, and preserves human authority over consequential decisions.

## Operating rule
Krishna advances the next safe engineering objective automatically. Each cycle follows:

**inspect → identify failure/opportunity → plan → build → adversarial test → verify → record → select next objective**

No cycle may silently weaken permissions, truth controls, evidence requirements, security boundaries, or owner authority. Human approval remains required for credentials, protected production environments, paid activation, legal/financial commitments, and irreversible production actions.

## Team operating model
- **Krishna:** orchestration, objective understanding, mission composition, routing, recovery, escalation.
- **Brahma:** creation, architecture, hypotheses, prototypes.
- **Vishnu:** continuity, state integrity, stable operation, lifecycle.
- **Shiva:** red-team transformation, failure removal, retirement, simplification.
- **Rama:** governance, permissions, safety boundaries, owner authority.
- **Hanuman:** bounded execution through approved tools and workflows.
- **Shakti:** model/API/compute/integration infrastructure and provider independence.
- **Saraswati:** evidence, knowledge quality, provenance, uncertainty.
- **Garuda:** perception, research, signals, data collection.
- **Dhanvantari:** system health, diagnosis, repair, recovery.
- **Nandi:** reliability, stress, chaos, regression, release gates.
- **Vishwakarma:** universal engineering and technical verification.
- **Kubera:** resource, cost, capacity and economic constraints.
- **Mitra:** human experts, handoffs and team coordination.
- **Chitragupta:** audit, decision records, provenance and traceability.
- **Durga:** security, threat modeling, access control, sandboxing and abuse resistance.

## Priority build tracks

### Track A — Mission and capability engine
1. Durable state adapter boundary; never claim persistence until a live store is connected.
2. Mission graph with dependencies, budgets, deadlines, risk and verification contracts.
3. Capability registry with requirements, dependencies, cost, risk and verification methods.
4. Dynamic capability discovery and specialist composition.
5. Resource planning across time, people, compute, tools, money and physical requirements.

### Track B — Intelligence and model independence
1. Model-provider adapter contract and health checks.
2. Provider-independent model routing.
3. Specialist-aware model selection by task, cost, latency and policy.
4. Bounded model budgets and output contracts.
5. Multi-model disagreement detection and evidence escalation.
6. Deterministic recovery for bounded failure classes.

### Track C — Verification and truth
1. Evidence/provenance attached to consequential results.
2. Truth states: verified, probable, speculative, unknown.
3. Independent verification paths where practical.
4. Semantic/substantiveness gates for model outputs.
5. Verification-of-verifier tests.
6. No success claim without the corresponding evidence/state.

### Track D — Failure and resilience laboratory
1. Model failure matrix: empty, malformed, timeout, rate-limit, server error, contradictory output.
2. Tool failure matrix: timeout, auth, malformed input/output, unavailable dependency.
3. State failure matrix: duplicate execution, stale state, corruption, recovery.
4. Security/adversarial matrix: prompt injection, tool misuse, privilege escalation, data boundary violations.
5. Chaos tests with bounded blast radius.
6. Root-cause classification so retries change strategy instead of repeating blindly.

### Track E — Safe execution
1. Explicit tool capabilities and least-privilege checks.
2. Bounded inputs, outputs, timeouts and concurrency.
3. Sandboxed execution for untrusted code/data.
4. Idempotency for repeatable actions.
5. Human approval gates for consequential actions.
6. Kill/stop controls and safe dead-letter escalation.

### Track F — Human collaboration
1. Expert capability profiles.
2. Skill-gap detection.
3. Human handoff contracts.
4. Expert result verification.
5. Stakeholder/context tracking.
6. Human-in-the-loop escalation when PI lacks authority, evidence or physical capability.

### Track G — Universal engineering
1. Requirements and constraints.
2. Systems architecture.
3. Modeling and simulation.
4. Design and optimization.
5. Software/electronics/mechanical interfaces.
6. Manufacturing and test interfaces.
7. Certification/compliance interfaces.
8. Maintenance and lifecycle planning.

### Track H — Continuous improvement
1. Every material failure becomes a regression fixture.
2. Every accepted improvement gets a before/after benchmark.
3. Every new capability is sandboxed before activation.
4. Release candidates pass the full regression suite plus adversarial tests.
5. Production changes are observable and reversible where possible.
6. Scheduled cycles continue finding the next safe high-value improvement.

## Daily autonomous cycle

1. Read current repository/runtime state.
2. Inspect recent failures, tests and unresolved risks.
3. Select one highest-value safe improvement.
4. Make the smallest coherent change.
5. Add/strengthen tests that would have caught the weakness.
6. Run focused tests.
7. Run relevant regression suites.
8. Run adversarial/chaos cases when applicable.
9. Verify behavior and evidence.
10. Record the change and select the next objective.

If blocked:
**diagnose → alternate path → test → verify → escalate only when authority/resources are genuinely required.**

## Release standard
A milestone is complete only when:
- code exists;
- automated tests pass;
- adversarial tests cover known failure classes;
- runtime behavior is verified;
- evidence/truth contracts hold;
- security and permission boundaries remain intact;
- deployment is verified where deployment is in scope;
- no unresolved release-blocking regression remains.

Passing tests are evidence of readiness, not proof of perfection. PI must continue improving after every release.

Scheduled GitHub execution may continue independently, but ChatGPT itself does not remain connected after a response.
